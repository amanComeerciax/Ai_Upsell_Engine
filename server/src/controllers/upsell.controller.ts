import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const upsellController = {
    async getAllUpsells(req: Request, res: Response) {
        try {
            // Tenant isolation
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};

            const upsells = await prisma.upsell_events.findMany({
                where: merchantFilter,
                include: {
                    users: true,
                    products: true,
                    orders: true
                },
                orderBy: {
                    shown_at: 'desc'
                }
            });

            const formattedUpsells = upsells.map(u => ({
                id: `CAMP-${u.id.toString().padStart(4, '0')}`,
                customerEmail: u.users?.email || 'guest@example.com',
                productsRecommended: [u.products?.name || 'Unknown Product'],
                status: u.converted ? 'converted' : 'sent',
                revenue: u.converted ? Number(u.products?.price) * (1 - (u.discount_percent || 0) / 100) : 0,
                logicMatches: [u.products?.category || 'General']
            }));

            res.status(200).json(formattedUpsells);
        } catch (error) {
            console.error('[Upsell Controller] Error:', error);
            res.status(500).json({ error: 'Failed to fetch upsells' });
        }
    },

    async getUpsellByOrderId(req: Request, res: Response) {
        try {
            const orderId = req.params.orderId as string;

            // Find order by ID or shopify_id
            const isNumeric = /^\d+$/.test(orderId);
            const order = await prisma.orders.findFirst({
                where: isNumeric ? { shopify_id: BigInt(orderId) } : undefined,
                include: {
                    upsell_events: {
                        include: {
                            products: true
                        },
                        orderBy: { shown_at: 'desc' },
                        take: 1
                    }
                }
            });

            if (!order || !order.upsell_events.length) {
                return res.status(404).json({ error: 'No recommendation found for this order' });
            }

            const upsell = order.upsell_events[0];
            res.status(200).json({
                order_id: order.id,
                shopify_order_id: orderId,
                recommended_product: {
                    id: upsell.products?.id,
                    name: upsell.products?.name,
                    price: Number(upsell.products?.price),
                    image: (upsell.products as any).image_url,
                    discount_percent: upsell.discount_percent
                },
                expires_at: upsell.expires_at
            });

        } catch (error) {
            console.error('[Upsell Controller] Error fetching by order:', error);
            res.status(500).json({ error: 'Logic error retrieving recommendation' });
        }
    }
};
