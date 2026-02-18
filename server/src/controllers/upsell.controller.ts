import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const upsellController = {
    async getAllUpsells(req: Request, res: Response) {
        try {
            // Tenant isolation
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};
            const now = new Date();

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

            const formattedUpsells = upsells.map(u => {
                // Compute dynamic status
                let status: string;
                if (u.converted) {
                    status = 'converted';
                } else if (u.expires_at && u.expires_at < now) {
                    status = 'expired';
                } else {
                    status = 'active';
                }

                // Time remaining in window
                let timeRemaining: string | null = null;
                if (!u.converted && u.expires_at && u.expires_at > now) {
                    const msLeft = u.expires_at.getTime() - now.getTime();
                    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
                    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
                    timeRemaining = `${hoursLeft}h ${minutesLeft}m`;
                }

                return {
                    id: u.id,
                    campaignId: `CAMP-${u.id.toString().padStart(4, '0')}`,
                    customerEmail: u.users?.email || 'guest@example.com',
                    customerName: u.users?.name || 'Guest',
                    productName: u.products?.name || 'Unknown Product',
                    productImage: (u.products as any)?.image_url || null,
                    productCategory: u.products?.category || 'General',
                    discountPercent: u.discount_percent || 0,
                    originalPrice: Number(u.products?.price || 0),
                    discountedPrice: Number(u.products?.price || 0) * (1 - (u.discount_percent || 0) / 100),
                    status,
                    timeRemaining,
                    shownAt: u.shown_at,
                    expiresAt: u.expires_at,
                    revenue: u.converted
                        ? Number(u.products?.price || 0) * (1 - (u.discount_percent || 0) / 100)
                        : 0,
                };
            });

            res.status(200).json(formattedUpsells);
        } catch (error) {
            console.error('[Upsell Controller] Error:', error);
            res.status(500).json({ error: 'Failed to fetch upsells' });
        }
    },

    async getUpsellByOrderId(req: Request, res: Response) {
        try {
            const orderId = req.params.orderId as string;

            // Find order by shopify_id
            const isNumeric = /^\d+$/.test(orderId);
            const order = await prisma.orders.findFirst({
                where: isNumeric ? { shopify_id: BigInt(orderId) } : undefined,
                include: {
                    upsell_events: {
                        include: { products: true },
                        orderBy: { shown_at: 'desc' },
                        take: 1
                    }
                }
            });

            if (!order || !order.upsell_events.length) {
                return res.status(404).json({ error: 'No recommendation found for this order' });
            }

            const upsell = order.upsell_events[0];

            // Check if expired
            const now = new Date();
            if (upsell.expires_at && upsell.expires_at < now) {
                return res.status(410).json({ error: 'Upsell offer has expired' });
            }

            res.status(200).json({
                event_id: upsell.id,
                order_id: order.id,
                shopify_order_id: orderId,
                recommended_product: {
                    id: upsell.products?.id,
                    name: upsell.products?.name,
                    price: Number(upsell.products?.price),
                    image: (upsell.products as any).image_url,
                    discount_percent: upsell.discount_percent
                },
                expires_at: upsell.expires_at,
                already_converted: upsell.converted
            });

        } catch (error) {
            console.error('[Upsell Controller] Error fetching by order:', error);
            res.status(500).json({ error: 'Logic error retrieving recommendation' });
        }
    },

    // STEP 2a: Mark widget as shown (impression tracking)
    async markShown(req: Request, res: Response) {
        try {
            const eventId = parseInt(req.params.eventId as string);
            if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

            const event = await prisma.upsell_events.findUnique({ where: { id: eventId } });
            if (!event) return res.status(404).json({ error: 'Upsell event not found' });

            // Update shown_at to now (impression recorded)
            await prisma.upsell_events.update({
                where: { id: eventId },
                data: { shown_at: new Date() }
            });

            res.status(200).json({ success: true, message: 'Impression recorded' });
        } catch (error) {
            console.error('[Upsell Controller] markShown Error:', error);
            res.status(500).json({ error: 'Failed to record impression' });
        }
    },

    // STEP 2b: Convert upsell (customer clicked "Claim Discount")
    async convertUpsell(req: Request, res: Response) {
        try {
            const eventId = parseInt(req.params.eventId as string);
            if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

            const event = await prisma.upsell_events.findUnique({
                where: { id: eventId },
                include: { products: true }
            });

            if (!event) return res.status(404).json({ error: 'Upsell event not found' });

            // Check if already converted
            if (event.converted) {
                return res.status(200).json({ success: true, message: 'Already converted', already_done: true });
            }

            // Check 48-hour expiry window
            const now = new Date();
            if (event.expires_at && event.expires_at < now) {
                return res.status(410).json({
                    error: 'Offer expired',
                    message: 'This 48-hour upsell offer has expired.',
                    expired_at: event.expires_at
                });
            }

            // Mark as converted
            const updated = await prisma.upsell_events.update({
                where: { id: eventId },
                data: { converted: true },
                include: { products: true }
            });

            const revenue = Number(updated.products?.price || 0) * (1 - (updated.discount_percent || 0) / 100);

            console.log(`[Upsell Engine] ✅ Conversion recorded! Event ${eventId} — Revenue: ₹${revenue.toFixed(2)}`);

            res.status(200).json({
                success: true,
                message: 'Conversion recorded successfully!',
                event_id: eventId,
                product_name: updated.products?.name,
                revenue_generated: revenue,
                discount_applied: updated.discount_percent
            });

        } catch (error) {
            console.error('[Upsell Controller] convertUpsell Error:', error);
            res.status(500).json({ error: 'Failed to record conversion' });
        }
    }
};
