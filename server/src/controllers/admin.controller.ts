import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const adminController = {
    /**
     * Get global SaaS statistics
     */
    async getGlobalStats(req: Request, res: Response) {
        try {
            const [
                totalMerchants,
                proMerchants,
                totalOrders,
                totalUpsells,
                convertedUpsells
            ] = await Promise.all([
                prisma.merchants.count(),
                prisma.merchants.count({ where: { plan: 'pro' } }),
                prisma.orders.count(),
                prisma.upsell_events.count(),
                prisma.upsell_events.count({ where: { converted: true } })
            ]);

            // Calculate global conversion rate
            const conversionRate = totalUpsells > 0 
                ? (convertedUpsells / totalUpsells) * 100 
                : 0;

            // Calculate total revenue (Sum of all orders)
            const revenueResult = await prisma.orders.aggregate({
                _sum: { total_amount: true }
            });

            res.status(200).json({
                merchants: {
                    total: totalMerchants,
                    pro: proMerchants,
                    free: totalMerchants - proMerchants
                },
                performance: {
                    totalOrders,
                    totalUpsells,
                    convertedUpsells,
                    conversionRate: parseFloat(conversionRate.toFixed(2))
                },
                revenue: {
                    total: parseFloat((revenueResult._sum.total_amount || 0).toString())
                }
            });
        } catch (error: any) {
            console.error('[Admin Controller] Stats Error:', error);
            res.status(500).json({ error: 'Failed to fetch global stats' });
        }
    },

    /**
     * Get all merchants with details
     */
    async getAllMerchants(req: Request, res: Response) {
        try {
            const merchants = await (prisma.merchants as any).findMany({
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    clerk_user_id: true,
                    business_name: true,
                    email: true,
                    shopify_shop_name: true,
                    plan: true,
                    subscription_status: true,
                    role: true,
                    created_at: true
                }
            });

            res.status(200).json(merchants);
        } catch (error: any) {
            console.error('[Admin Controller] Merchants Error:', error);
            res.status(500).json({ error: 'Failed to fetch merchants' });
        }
    },

    /**
     * Update a merchant's plan or role manually
     */
    async updateMerchant(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { plan, role } = req.body;

            const updatedMerchant = await (prisma.merchants as any).update({
                where: { id: parseInt(id as string) },
                data: {
                    ...(plan && { plan }),
                    ...(role && { role })
                }
            });

            res.status(200).json({ 
                message: 'Merchant updated successfully',
                merchant: {
                    id: updatedMerchant.id,
                    plan: updatedMerchant.plan,
                    role: (updatedMerchant as any).role
                }
            });
        } catch (error: any) {
            console.error('[Admin Controller] Update Error:', error);
            res.status(500).json({ error: 'Failed to update merchant' });
        }
    }
};
