import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cacheService } from '../services/cache.service';

export const productController = {
    async getAllProducts(req: Request, res: Response) {
        try {
            // Tenant isolation: filter by merchant_id if available
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};

            // Check Redis cache first (5 min TTL)
            const cacheKey = cacheService.key(req.merchant?.id, 'products');
            const cached = await cacheService.get(cacheKey);
            if (cached) return res.status(200).json(cached);

            const products = await prisma.products.findMany({
                where: merchantFilter,
                include: {
                    upsell_events: true,
                    _count: {
                        select: { order_items: true }
                    }
                }
            });

            // Map data to include real metrics from the database
            const productsWithMetrics = products.map(p => {
                const totalRecommended = p.upsell_events.length;
                const convertedEvents = p.upsell_events.filter(e => e.converted);
                const conversionRate = totalRecommended > 0
                    ? ((convertedEvents.length / totalRecommended) * 100).toFixed(1)
                    : "0.0";

                // Revenue from converted upsells (Price * (1 - discount/100))
                const revenueGenerated = convertedEvents.reduce((acc, event) => {
                    const price = Number(p.price || 0);
                    const discount = event.discount_percent || 0;
                    return acc + (price * (1 - discount / 100));
                }, 0);

                return {
                    id: p.id,
                    shopifyId: (p as any).shopify_id ? (p as any).shopify_id.toString() : null,
                    name: p.name,
                    category: p.category,
                    price: Number(p.price),
                    imageURL: (p as any).image_url,
                    timesRecommended: totalRecommended,
                    conversionRate: conversionRate,
                    revenueGenerated: revenueGenerated.toFixed(0)
                };
            });

            // Cache for 5 minutes
            await cacheService.set(cacheKey, productsWithMetrics, 300);
            res.status(200).json(productsWithMetrics);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    async getProductStats(req: Request, res: Response) {
        try {
            // Tenant isolation
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};

            // Check Redis cache first (2 min TTL)
            const cacheKey = cacheService.key(req.merchant?.id, 'product-stats');
            const cached = await cacheService.get(cacheKey);
            if (cached) return res.status(200).json(cached);

            const totalProducts = await prisma.products.count({ where: merchantFilter });
            const totalOrders = await prisma.orders.count({ where: merchantFilter });
            const upsellEvents = await prisma.upsell_events.count({ where: merchantFilter });
            const convertedUpsells = await prisma.upsell_events.count({ where: { ...merchantFilter, converted: true } });

            const revenueResult = await prisma.orders.aggregate({
                where: merchantFilter,
                _sum: {
                    total_amount: true
                }
            });

            const performanceIncrease = upsellEvents > 0
                ? ((convertedUpsells / (totalOrders || 1)) * 100).toFixed(1) + "%"
                : "0.0%";

            const responseData = {
                totalProducts,
                totalOrders,
                totalRevenue: Number(revenueResult._sum.total_amount || 0),
                performanceIncrease: performanceIncrease
            };

            // Cache for 2 minutes
            await cacheService.set(cacheKey, responseData, 120);
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    },

    async updateProduct(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const { name, category, price } = req.body;
            const updated = await prisma.products.update({
                where: { id },
                data: {
                    ...(name !== undefined && { name }),
                    ...(category !== undefined && { category }),
                    ...(price !== undefined && { price: String(price) }),
                }
            });
            res.status(200).json({
                success: true,
                product: { id: updated.id, name: updated.name, category: updated.category, price: Number(updated.price) }
            });

            // Invalidate product caches
            if (req.merchant?.id) {
                await cacheService.invalidate(cacheService.key(req.merchant.id, 'products'));
                await cacheService.invalidate(cacheService.key(req.merchant.id, 'product-stats'));
            }
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    },

    async deleteProduct(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            // Delete related upsell events first (FK constraint)
            await (prisma as any).upsell_events.deleteMany({ where: { product_id: id } });
            await prisma.products.delete({ where: { id } });
            res.status(200).json({ success: true });

            // Invalidate product caches
            if (req.merchant?.id) {
                await cacheService.invalidate(cacheService.key(req.merchant.id, 'products'));
                await cacheService.invalidate(cacheService.key(req.merchant.id, 'product-stats'));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    },

    /**
     * Per-product deep-dive analytics
     * Returns: summary, funnel, discount analysis, A/B test, revenue timeline, campaign list
     */
    async getProductAnalytics(req: Request, res: Response) {
        try {
            const productId = parseInt(req.params.id as string);
            if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

            // Check cache (3 min TTL)
            const cacheKey = cacheService.key(req.merchant?.id, `product-analytics:${productId}`);
            const cached = await cacheService.get(cacheKey);
            if (cached) return res.status(200).json(cached);

            // Fetch product
            const product = await prisma.products.findUnique({ where: { id: productId } });
            if (!product) return res.status(404).json({ error: 'Product not found' });

            // Fetch all upsell events for this product
            const events = await prisma.upsell_events.findMany({
                where: { upsell_product_id: productId },
                include: { users: true, orders: true },
                orderBy: { id: 'desc' }
            });

            const now = new Date();
            const price = Number(product.price || 0);

            // ── SUMMARY ────────────────────────────────
            const converted = events.filter(e => e.converted);
            const active = events.filter(e => !e.converted && e.expires_at && e.expires_at > now);
            const expired = events.filter(e => !e.converted && e.expires_at && e.expires_at <= now);
            const totalImpressions = events.reduce((sum, e) => sum + (e.impression_count || 0), 0);
            const totalRevenue = converted.reduce((sum, e) => {
                const disc = e.discount_percent || 0;
                return sum + (price * (1 - disc / 100));
            }, 0);
            const avgDiscount = events.length > 0
                ? events.reduce((sum, e) => sum + (e.discount_percent || 0), 0) / events.length
                : 0;

            const summary = {
                totalCampaigns: events.length,
                converted: converted.length,
                active: active.length,
                expired: expired.length,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                avgDiscount: Math.round(avgDiscount * 10) / 10,
                impressions: totalImpressions,
                conversionRate: events.length > 0
                    ? Math.round((converted.length / events.length) * 1000) / 10
                    : 0
            };

            // ── FUNNEL ─────────────────────────────────
            const shown = events.filter(e => e.impression_count > 0);
            const funnel = {
                sent: events.length,
                shown: shown.length,
                converted: converted.length
            };

            // ── DISCOUNT ANALYSIS ──────────────────────
            const discountMap = new Map<number, { campaigns: number; converted: number }>();
            for (const e of events) {
                const disc = e.discount_percent || 0;
                const entry = discountMap.get(disc) || { campaigns: 0, converted: 0 };
                entry.campaigns++;
                if (e.converted) entry.converted++;
                discountMap.set(disc, entry);
            }
            const discountAnalysis = Array.from(discountMap.entries())
                .map(([discount, data]) => ({
                    discount,
                    campaigns: data.campaigns,
                    converted: data.converted,
                    rate: data.campaigns > 0 ? Math.round((data.converted / data.campaigns) * 1000) / 10 : 0
                }))
                .sort((a, b) => a.discount - b.discount);

            // ── A/B TEST ───────────────────────────────
            const groupA = events.filter(e => e.test_group === 'A');
            const groupB = events.filter(e => e.test_group === 'B');
            const calcGroup = (group: typeof events) => {
                const conv = group.filter(e => e.converted);
                const rev = conv.reduce((sum, e) => {
                    const disc = e.discount_percent || 0;
                    return sum + (price * (1 - disc / 100));
                }, 0);
                return {
                    campaigns: group.length,
                    converted: conv.length,
                    rate: group.length > 0 ? Math.round((conv.length / group.length) * 1000) / 10 : 0,
                    revenue: Math.round(rev * 100) / 100
                };
            };
            const abTest = {
                groupA: calcGroup(groupA),
                groupB: calcGroup(groupB)
            };

            // ── REVENUE TIMELINE (last 30 days) ────────
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const timelineMap = new Map<string, { revenue: number; conversions: number }>();
            // Pre-fill 30 days
            for (let d = 0; d < 30; d++) {
                const date = new Date(thirtyDaysAgo);
                date.setDate(date.getDate() + d);
                const key = date.toISOString().split('T')[0];
                timelineMap.set(key, { revenue: 0, conversions: 0 });
            }
            // Fill with actual data from converted events
            for (const e of converted) {
                const dateKey = (e.shown_at || new Date()).toISOString().split('T')[0];
                if (timelineMap.has(dateKey)) {
                    const entry = timelineMap.get(dateKey)!;
                    const disc = e.discount_percent || 0;
                    entry.revenue += price * (1 - disc / 100);
                    entry.conversions++;
                }
            }
            const revenueTimeline = Array.from(timelineMap.entries())
                .map(([date, data]) => ({
                    date,
                    revenue: Math.round(data.revenue * 100) / 100,
                    conversions: data.conversions
                }));

            // ── CAMPAIGN LIST ──────────────────────────
            const campaigns = events.map(e => {
                let status: string;
                if (e.converted) status = 'converted';
                else if (e.expires_at && e.expires_at < now) status = 'expired';
                else status = 'active';

                const disc = e.discount_percent || 0;
                return {
                    id: e.id,
                    customerEmail: (e.users?.email && e.users.email !== 'guest@example.com')
                        ? e.users.email : 'guest@example.com',
                    customerName: (e.users?.name && e.users.name !== 'Guest')
                        ? e.users.name : 'Guest',
                    discount: disc,
                    status,
                    revenue: e.converted ? Math.round(price * (1 - disc / 100) * 100) / 100 : 0,
                    shownAt: e.shown_at,
                    expiresAt: e.expires_at,
                    testGroup: e.test_group || '—',
                    impressions: e.impression_count
                };
            });

            const responseData = {
                product: {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price,
                    imageUrl: (product as any).image_url,
                    shopifyId: (product as any).shopify_id?.toString() || null
                },
                summary,
                funnel,
                discountAnalysis,
                abTest,
                revenueTimeline,
                campaigns
            };

            // Cache for 3 minutes
            await cacheService.set(cacheKey, responseData, 180);
            res.status(200).json(responseData);
        } catch (error) {
            console.error('[Product Controller] getProductAnalytics Error:', error);
            res.status(500).json({ error: 'Failed to fetch product analytics' });
        }
    }
};

