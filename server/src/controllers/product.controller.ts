import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const productController = {
    async getAllProducts(req: Request, res: Response) {
        try {
            const products = await prisma.products.findMany({
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

            res.status(200).json(productsWithMetrics);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    async getProductStats(req: Request, res: Response) {
        try {
            const totalProducts = await prisma.products.count();
            const totalOrders = await prisma.orders.count();
            const upsellEvents = await prisma.upsell_events.count();
            const convertedUpsells = await prisma.upsell_events.count({ where: { converted: true } });

            const revenueResult = await prisma.orders.aggregate({
                _sum: {
                    total_amount: true
                }
            });

            const performanceIncrease = upsellEvents > 0
                ? ((convertedUpsells / (totalOrders || 1)) * 100).toFixed(1) + "%"
                : "0.0%";

            res.status(200).json({
                totalProducts,
                totalOrders,
                totalRevenue: Number(revenueResult._sum.total_amount || 0),
                performanceIncrease: performanceIncrease
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }
};
