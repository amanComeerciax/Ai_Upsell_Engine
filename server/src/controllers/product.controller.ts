import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const productController = {
    async getAllProducts(req: Request, res: Response) {
        try {
            // Tenant isolation: filter by merchant_id if available
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};

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
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
};
