import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import axios from 'axios';

// 1-hour in-memory cache for AI insights (avoid calling Groq on every page load)
const insightsCache = new Map<string, { insights: any[]; generatedAt: number }>();
const INSIGHTS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const analyticsController = {
    async getDashboardStats(req: Request, res: Response) {
        try {
            // Tenant isolation
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};

            // 1. Get basic counts
            const totalOrders = await prisma.orders.count({ where: merchantFilter });
            const totalProducts = await prisma.products.count({ where: merchantFilter });
            const totalUpsellEvents = await prisma.upsell_events.count({ where: merchantFilter });

            // 2. Calculate Total Revenue
            const revenueResult = await prisma.orders.aggregate({
                where: merchantFilter,
                _sum: {
                    total_amount: true
                }
            });

            // 3. Get Recent Activity (Last 5 orders)
            const recentOrders = await prisma.orders.findMany({
                where: merchantFilter,
                take: 5,
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    users: true,
                    order_items: {
                        include: {
                            products: true
                        }
                    }
                }
            });

            // 4. Calculate Real Analytics
            const totalRevenue = Number(revenueResult._sum.total_amount || 0);
            const convertedOrders = await prisma.upsell_events.count({ where: { ...merchantFilter, converted: true } });

            // Calculate rates based on actual events
            const impressedCount = await prisma.upsell_events.count({
                where: { ...merchantFilter, impression_count: { gt: 0 } }
            });
            const openRate = totalUpsellEvents > 0
                ? parseFloat(((impressedCount / totalUpsellEvents) * 100).toFixed(1))
                : 0.0;
            const clickRate = totalUpsellEvents > 0 ? ((convertedOrders / totalUpsellEvents) * 100).toFixed(1) : "0.0";

            // 5. Calculate Revenue Trajectory (Last 7 days)
            const trajectory = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const startOfDay = new Date(date.setHours(0, 0, 0, 0));
                const endOfDay = new Date(date.setHours(23, 59, 59, 999));

                const dayRevenue = await prisma.orders.aggregate({
                    where: {
                        ...merchantFilter,
                        created_at: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    },
                    _sum: {
                        total_amount: true
                    }
                });

                trajectory.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: Number(dayRevenue._sum.total_amount || 0)
                });
            }

            // 6. Generate Dynamic Activity Feed
            const activityFeed = recentOrders.map(o => ({
                msg: `Order from ${o.users?.name || 'Guest'} detected`,
                time: "Recently",
                type: "success"
            }));

            // Add AI events to feed
            const recentUpsells = await prisma.upsell_events.findMany({
                where: merchantFilter,
                take: 3,
                orderBy: { shown_at: 'desc' },
                include: { products: true }
            });

            recentUpsells.forEach(u => {
                activityFeed.unshift({
                    msg: `AI suggested ${u.products?.name || 'product'}`,
                    time: "Just now",
                    type: "ai"
                });
            });

            res.status(200).json({
                counts: {
                    totalOrders,
                    totalProducts,
                    totalUpsellEvents,
                    totalRevenue
                },
                recentOrders: recentOrders.map(o => ({
                    id: o.id,
                    customerEmail: o.users?.email || 'Guest',
                    status: o.total_amount ? 'paid' : 'pending',
                    totalAmount: Number(o.total_amount),
                    createdAt: o.created_at
                })),
                conversionRates: {
                    openRate,         // % of upsell events where the widget was actually displayed
                    impressedCount,   // raw count of widget impressions
                    clickRate,
                    conversionRate: totalOrders > 0 ? ((convertedOrders / totalOrders) * 100).toFixed(1) : "0.0"
                },
                trajectory,
                activityFeed: activityFeed.slice(0, 5)
            });

        } catch (error: any) {
            console.error('[Analytics Controller] Error:', error);
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    },

    /**
     * Detailed analytics: time-series + top products for the Analytics page
     */
    async getDetailedAnalytics(req: Request, res: Response) {
        try {
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};
            const days = parseInt(req.query.days as string) || 30;

            // ── 1. Time-series: upsells sent + converted per day ──────────────
            const timeSeries = [];
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

                const dateFilter = { gte: startOfDay, lte: endOfDay };

                const [sent, converted, dayRevenue, impressed] = await Promise.all([
                    prisma.upsell_events.count({
                        where: { ...merchantFilter, shown_at: dateFilter }
                    }),
                    prisma.upsell_events.count({
                        where: { ...merchantFilter, converted: true, shown_at: dateFilter }
                    }),
                    prisma.orders.aggregate({
                        where: { ...merchantFilter, created_at: dateFilter },
                        _sum: { total_amount: true }
                    }),
                    // Real impressions: events with impression_count > 0, shown on this day
                    prisma.upsell_events.count({
                        where: { ...merchantFilter, shown_at: dateFilter, impression_count: { gt: 0 } }
                    })
                ]);

                timeSeries.push({
                    date: startOfDay.toISOString(),
                    label: startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    sent,
                    impressed,   // widget actually displayed (impression_count > 0)
                    converted,
                    revenue: Number(dayRevenue._sum.total_amount || 0)
                });
            }

            // ── 2. Top Products by upsell performance ─────────────────────────
            // Get all upsell events with their recommended product
            const allUpsells = await prisma.upsell_events.findMany({
                where: merchantFilter,
                include: { products: true }
            });

            // Group by product
            const productMap = new Map<number, {
                name: string;
                image: string | null;
                category: string | null;
                timesRecommended: number;
                timesConverted: number;
                revenue: number;
            }>();

            for (const upsell of allUpsells) {
                if (!upsell.upsell_product_id || !upsell.products) continue;
                const pid = upsell.upsell_product_id;
                const existing = productMap.get(pid) || {
                    name: upsell.products.name || 'Unknown',
                    image: upsell.products.image_url,
                    category: upsell.products.category,
                    timesRecommended: 0,
                    timesConverted: 0,
                    revenue: 0
                };
                existing.timesRecommended += 1;
                if (upsell.converted) {
                    existing.timesConverted += 1;
                    // Revenue = discounted price of product
                    const price = Number(upsell.products.price || 0);
                    const discount = upsell.discount_percent || 0;
                    existing.revenue += price * (1 - discount / 100);
                }
                productMap.set(pid, existing);
            }

            const topProducts = Array.from(productMap.entries())
                .map(([id, data]) => ({
                    id,
                    name: data.name,
                    image: data.image,
                    category: data.category,
                    timesRecommended: data.timesRecommended,
                    conversionRate: data.timesRecommended > 0
                        ? parseFloat(((data.timesConverted / data.timesRecommended) * 100).toFixed(1))
                        : 0,
                    revenueGenerated: parseFloat(data.revenue.toFixed(2))
                }))
                .sort((a, b) => b.timesRecommended - a.timesRecommended)
                .slice(0, 10);

            // ── 3. Summary KPIs ───────────────────────────────────────────────
            const totalSent = timeSeries.reduce((s, d) => s + d.sent, 0);
            const totalConverted = timeSeries.reduce((s, d) => s + d.converted, 0);
            const totalImpressed = timeSeries.reduce((s, d) => s + d.impressed, 0);
            const totalRevenue = timeSeries.reduce((s, d) => s + d.revenue, 0);

            // Avg time from order creation to upsell shown (in hours)
            const shownUpsells = await prisma.upsell_events.findMany({
                where: { ...merchantFilter, shown_at: { not: null } },
                include: { orders: true },
                take: 50
            });
            let avgResponseHrs = 0;
            if (shownUpsells.length > 0) {
                const totalMs = shownUpsells.reduce((sum, u) => {
                    const orderTime = u.orders?.created_at?.getTime() || 0;
                    const shownTime = u.shown_at?.getTime() || 0;
                    return sum + Math.max(0, shownTime - orderTime);
                }, 0);
                avgResponseHrs = parseFloat((totalMs / shownUpsells.length / 3600000).toFixed(1));
            }

            res.status(200).json({
                timeSeries,
                topProducts,
                kpis: {
                    totalSent,
                    totalImpressed,                          // widget actually shown
                    impressionRate: totalSent > 0
                        ? parseFloat(((totalImpressed / totalSent) * 100).toFixed(1))
                        : 0,                                 // real open/impression rate (%)
                    totalConverted,
                    conversionRate: totalSent > 0 ? parseFloat(((totalConverted / totalSent) * 100).toFixed(1)) : 0,
                    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                    avgResponseHrs: avgResponseHrs || null
                }
            });

        } catch (error: any) {
            console.error('[Analytics Controller] Detailed Error:', error);
            res.status(500).json({ error: 'Failed to fetch detailed analytics' });
        }
    },

    /**
     * AI Analytics Insights — powered by Groq (Llama 3.3 70B)
     * Fetches real store data, sends to Groq, returns actionable insights.
     */
    async getInsights(req: Request, res: Response) {
        try {
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};
            const cacheKey = `insights_${req.merchant?.id || 'global'}`;

            // Check 1-hour cache first
            const cached = insightsCache.get(cacheKey);
            if (cached && (Date.now() - cached.generatedAt < INSIGHTS_CACHE_TTL_MS)) {
                return res.status(200).json({ insights: cached.insights, cached: true, fallback: false });
            }

            // ── Gather real store data for Groq ──────────────────────────────
            const [totalOrders, totalProducts, totalUpsells, convertedUpsells, impressedUpsells, revenueResult] = await Promise.all([
                prisma.orders.count({ where: merchantFilter }),
                prisma.products.count({ where: merchantFilter }),
                prisma.upsell_events.count({ where: merchantFilter }),
                prisma.upsell_events.count({ where: { ...merchantFilter, converted: true } }),
                prisma.upsell_events.count({ where: { ...merchantFilter, impression_count: { gt: 0 } } }),
                prisma.orders.aggregate({ where: merchantFilter, _sum: { total_amount: true } }),
            ]);

            const totalRevenue = Number(revenueResult._sum.total_amount || 0);
            const conversionRate = totalUpsells > 0 ? ((convertedUpsells / totalUpsells) * 100).toFixed(1) : '0';
            const impressionRate = totalUpsells > 0 ? ((impressedUpsells / totalUpsells) * 100).toFixed(1) : '0';

            // ── Call Groq API ────────────────────────────────────────────────
            const GROQ_API_KEY = process.env.GROQ_API_KEY;
            const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
            const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

            if (!GROQ_API_KEY) {
                console.warn('[Analytics] No GROQ_API_KEY set. Returning fallback insights.');
                return res.status(200).json({ insights: this.getFallbackInsights(), cached: false, fallback: true });
            }

            const prompt = `You are an AI analytics advisor for an e-commerce upsell platform. Analyze this store data and return exactly 3 actionable insights.

Store Data:
- Total Orders: ${totalOrders}
- Total Products: ${totalProducts}
- Total Upsell Campaigns Sent: ${totalUpsells}
- Upsell Conversions: ${convertedUpsells} (${conversionRate}% conversion rate)
- Widget Impressions: ${impressedUpsells} (${impressionRate}% impression rate)
- Total Revenue: ₹${totalRevenue.toLocaleString()}

Return a JSON array of exactly 3 objects with this format:
[
  { "icon": "📊", "title": "Short Title", "insight": "Actionable insight in 1-2 sentences." }
]

Rules:
- Use relevant emojis for icons (📊, ⚡, 🎯, 💡, 🔥, 📈, 🛒, etc.)
- Insights must be actionable and specific to the data
- If impression rate is low, suggest ways to improve widget visibility
- If conversion rate is high, celebrate it and suggest scaling
- Keep language concise, business-focused, and professional
- Return ONLY the JSON array, no extra text`;

            const groqResponse = await axios.post(`${GROQ_BASE_URL}/chat/completions`, {
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500,
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            const rawContent = groqResponse.data.choices?.[0]?.message?.content || '[]';
            let insights;
            try {
                const parsed = JSON.parse(rawContent);
                // Handle both direct array and { insights: [...] } formats
                insights = Array.isArray(parsed) ? parsed : (parsed.insights || parsed.data || [parsed]);
            } catch {
                console.error('[Analytics] Failed to parse Groq response:', rawContent);
                insights = this.getFallbackInsights();
            }

            // Cache for 1 hour
            insightsCache.set(cacheKey, { insights, generatedAt: Date.now() });

            console.log(`[Analytics] 🤖 Groq insights generated for merchant ${req.merchant?.id || 'global'}`);
            return res.status(200).json({ insights, cached: false, fallback: false });

        } catch (error: any) {
            console.error('[Analytics] Groq Insights Error:', error.response?.data || error.message);
            return res.status(200).json({ insights: this.getFallbackInsights(), cached: false, fallback: true });
        }
    },

    /** Static fallback if Groq is down */
    getFallbackInsights() {
        return [
            { icon: '📊', title: 'Conversion Health', insight: 'Your upsell funnel is active. Monitor the 48-hour conversion window to maximize yield.' },
            { icon: '⚡', title: 'Velocity Check', insight: 'Upsell offers are dispatched immediately after order detection. Response speed is optimized.' },
            { icon: '🎯', title: 'Growth Tip', insight: 'Track widget impressions vs conversions to identify your best-performing product pairings.' }
        ];
    },

    /**
     * A/B Test Metrics: Compare Group A (AI) vs Group B (Control)
     */
    async getABTestMetrics(req: Request, res: Response) {
        try {
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};

            // 1. Get totals and conversions for Group A (AI)
            const [totalA, convertedA] = await Promise.all([
                prisma.upsell_events.count({
                    where: { ...merchantFilter, test_group: 'A' } as any
                }),
                prisma.upsell_events.count({
                    where: { ...merchantFilter, test_group: 'A', converted: true } as any
                })
            ]);

            // 2. Get totals and conversions for Group B (Control)
            const [totalB, convertedB] = await Promise.all([
                prisma.upsell_events.count({
                    where: { ...merchantFilter, test_group: 'B' } as any
                }),
                prisma.upsell_events.count({
                    where: { ...merchantFilter, test_group: 'B', converted: true } as any
                })
            ]);

            // 3. Calculate Rates
            const rateA = totalA > 0 ? (convertedA / totalA) : 0;
            const rateB = totalB > 0 ? (convertedB / totalB) : 0;

            // 4. Calculate Lift (A vs B)
            let lift = 0;
            if (rateB > 0) {
                lift = ((rateA - rateB) / rateB) * 100;
            } else if (rateA > 0) {
                lift = 100; // 100% lift if B is zero but A has results
            }

            res.status(200).json({
                groupA: {
                    total: totalA,
                    conversions: convertedA,
                    rate: parseFloat((rateA * 100).toFixed(2))
                },
                groupB: {
                    total: totalB,
                    conversions: convertedB,
                    rate: parseFloat((rateB * 100).toFixed(2))
                },
                lift: parseFloat(lift.toFixed(1)),
                summary: lift > 0
                    ? `AI Personalization is driving a ${lift.toFixed(1)}% lift in conversions!`
                    : "Wait for more data to see the lift from AI personalization."
            });

        } catch (error: any) {
            console.error('[Analytics Controller] A/B Metrics Error:', error);
            res.status(500).json({ error: 'Failed to fetch A/B test metrics' });
        }
    }
};

