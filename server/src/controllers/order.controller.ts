import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const orderController = {
    async getAllOrders(req: Request, res: Response) {
        try {
            // Tenant isolation
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};

            const orders = await prisma.orders.findMany({
                where: merchantFilter,
                include: {
                    users: true,
                    order_items: {
                        include: {
                            products: true
                        }
                    },
                    upsell_events: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            const formattedOrders = orders.map(o => ({
                id: `ORD-${o.id.toString().padStart(4, '0')}`,
                customerName: o.users?.name || 'Guest Customer',
                customerEmail: o.users?.email || 'guest@example.com',
                products: o.order_items.map(item => item.products?.name || 'Unknown Product'),
                amount: Number(o.total_amount),
                orderDate: o.created_at,
                upsellStatus: o.upsell_events.length > 0 ? (o.upsell_events.some(e => e.converted) ? 'sent' : 'scheduled') : 'none'
            }));

            res.status(200).json(formattedOrders);
        } catch (error) {
            console.error('[Order Controller] Error:', error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }
};
