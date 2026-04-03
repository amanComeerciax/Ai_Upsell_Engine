import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { emitEvent } from '../lib/socket';
import { cacheService } from '../services/cache.service';

export const upsellController = {
    async getAllUpsells(req: Request, res: Response) {
        try {
            // Tenant isolation
            const merchantFilter = req.merchant ? { merchant_id: req.merchant.id } : {};
            const now = new Date();

            const upsells = await (prisma as any).upsell_events.findMany({
                where: merchantFilter,
                include: {
                    users: true,
                    products: true,
                    orders: true,
                    abandoned_cart: true
                },
                orderBy: {
                    id: 'desc'
                }
            });

            const formattedUpsells = upsells.map((u: any) => {
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
                    id: (u as any).id,
                    campaignId: `CAMP-${(u as any).id.toString().padStart(4, '0')}`,
                    customerEmail: ((u as any).users?.email && (u as any).users.email !== 'guest@example.com')
                        ? (u as any).users.email
                        : ((u as any).abandoned_cart?.customer_email || (u as any).users?.email || 'guest@example.com'),
                    customerName: ((u as any).users?.name && (u as any).users.name !== 'Guest' && (u as any).users.name !== 'Guest Customer')
                        ? (u as any).users.name
                        : ((u as any).abandoned_cart?.customer_name || (u as any).users?.name || 'Guest'),
                    productName: (u as any).products?.name || 'Unknown Product',
                    productImage: (u as any).products?.image_url || null,
                    productCategory: (u as any).products?.category || 'General',
                    discountPercent: (u as any).discount_percent || 0,
                    originalPrice: Number((u as any).products?.price || 0),
                    discountedPrice: Number((u as any).products?.price || 0) * (1 - ((u as any).discount_percent || 0) / 100),
                    status,
                    timeRemaining,
                    impressionCount: (u as any).impression_count,
                    shownAt: (u as any).shown_at,
                    expiresAt: (u as any).expires_at,
                    revenue: (u as any).converted
                        ? Number((u as any).products?.price || 0) * (1 - ((u as any).discount_percent || 0) / 100)
                        : 0,
                };
            });

            res.status(200).json(formattedUpsells);
        } catch (error) {
            console.error('[Upsell Controller] Error:', error);
            res.status(500).json({ error: 'Failed to fetch upsells' });
        }
    },

    async getUpsellById(req: Request, res: Response) {
        try {
            const eventId = parseInt(req.params.eventId as string);
            if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

            const upsell = await prisma.upsell_events.findUnique({
                where: { id: eventId },
                include: { products: true, orders: true }
            });

            if (!upsell) {
                return res.status(404).json({ error: 'Upsell event not found' });
            }

            // Check if expired
            const now = new Date();
            if (upsell.expires_at && upsell.expires_at < now) {
                return res.status(410).json({ error: 'Upsell offer has expired' });
            }

            const shopDomain = req.headers['x-shopify-shop-domain'] as string ||
                req.headers.referer?.match(/https?:\/\/([^/]+)/)?.[1] ||
                'navjivan-kirana-store.myshopify.com';

            res.status(200).json({
                event_id: upsell.id,
                order_id: upsell.order_id,
                shopify_order_id: (upsell as any).orders?.shopify_id?.toString(),
                recommended_product: {
                    id: upsell.products?.id,
                    name: upsell.products?.name,
                    price: Number(upsell.products?.price),
                    image: (upsell.products as any).image_url,
                    discount_percent: upsell.discount_percent,
                    shopify_id: upsell.products?.shopify_id?.toString(),
                    shopify_variant_id: (upsell.products as any).shopify_variant_id?.toString(),
                    shopify_url: upsell.products?.shopify_id
                        ? `https://${shopDomain}/products/${(upsell.products as any).handle || upsell.products.name?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}`
                        : null,
                    reason: (upsell as any).pitch || `Customers who bought ${upsell.products?.name} also loved this!`
                },
                expires_at: upsell.expires_at,
                already_converted: upsell.converted
            });
        } catch (error) {
            console.error('[Upsell Controller] Error fetching by event ID:', error);
            res.status(500).json({ error: 'Logic error retrieving recommendation' });
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

            const shopDomain = req.headers['x-shopify-shop-domain'] as string ||
                req.headers.referer?.match(/https?:\/\/([^/]+)/)?.[1] ||
                'navjivan-kirana-store.myshopify.com';

            res.status(200).json({
                event_id: upsell.id,
                order_id: upsell.order_id,
                shopify_order_id: (order as any).shopify_id?.toString(),
                recommended_product: {
                    id: upsell.products?.id,
                    name: upsell.products?.name,
                    price: Number(upsell.products?.price),
                    image: (upsell.products as any).image_url,
                    discount_percent: upsell.discount_percent,
                    shopify_id: upsell.products?.shopify_id?.toString(),
                    shopify_variant_id: (upsell.products as any).shopify_variant_id?.toString(),
                    shopify_url: upsell.products?.shopify_id
                        ? `https://${shopDomain}/products/${(upsell.products as any).handle || upsell.products.name?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}`
                        : null,
                    reason: (upsell as any).pitch || `Recommended specifically for your order!`
                },
                expires_at: upsell.expires_at,
                already_converted: upsell.converted
            });

        } catch (error) {
            console.error('[Upsell Controller] Error fetching by order:', error);
            res.status(500).json({ error: 'Logic error retrieving recommendation' });
        }
    },

    // STEP 2a: Mark widget as shown (real impression tracking)
    async markShown(req: Request, res: Response) {
        try {
            const eventId = parseInt(req.params.eventId as string);
            if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

            const event = await prisma.upsell_events.findUnique({ where: { id: eventId } });
            if (!event) return res.status(404).json({ error: 'Upsell event not found' });

            // Atomically increment impression_count
            // Also set shown_at only on the FIRST impression (preserves time-of-first-view)
            const isFirstImpression = !event.shown_at || event.impression_count === 0;
            const updated = await prisma.upsell_events.update({
                where: { id: eventId },
                data: {
                    impression_count: { increment: 1 },
                    // Only stamp shown_at on first impression so time-of-first-view is preserved
                    ...(isFirstImpression ? { shown_at: new Date() } : {})
                }
            });

            console.log(`[Upsell Controller] 👁️ Widget shown — Event ${eventId}, total impressions: ${updated.impression_count}`);

            res.status(200).json({
                success: true,
                message: 'Impression recorded',
                impression_count: updated.impression_count
            });

            // Notify via Socket
            emitEvent('upsell:shown', {
                eventId,
                impressionCount: updated.impression_count,
                timestamp: new Date()
            });
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

            // Notify via Socket
            emitEvent('upsell:converted', {
                eventId,
                productName: updated.products?.name,
                revenue,
                timestamp: new Date()
            });

            // Invalidate caches (conversion changes dashboard stats, analytics, A/B metrics)
            if (event.merchant_id) {
                await cacheService.invalidateMerchant(event.merchant_id);
            }

        } catch (error) {
            console.error('[Upsell Controller] convertUpsell Error:', error);
            res.status(500).json({ error: 'Failed to record conversion' });
        }
    },

    async resendUpsell(req: Request, res: Response) {
        try {
            const eventId = parseInt(req.params.eventId as string);
            if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

            const event = await prisma.upsell_events.findUnique({ where: { id: eventId } });
            if (!event) return res.status(404).json({ error: 'Campaign not found' });
            if (event.converted) return res.status(400).json({ error: 'Campaign already converted — cannot retrigger.' });

            // Extend the expiry window by 24 hours from now
            const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await prisma.upsell_events.update({
                where: { id: eventId },
                data: { expires_at: newExpiry }
            });

            console.log(`[Upsell Controller] 🔄 Retriggered event ${eventId} — new expiry: ${newExpiry.toISOString()}`);

            res.status(200).json({
                success: true,
                message: 'Campaign window extended by 24 hours. Email re-queued.',
                new_expires_at: newExpiry
            });
        } catch (error) {
            console.error('[Upsell Controller] resendUpsell Error:', error);
            res.status(500).json({ error: 'Failed to retrigger campaign' });
        }
    },

    /**
     * getFillingProducts — Suggests products to bridge the gap to Free Shipping
     * Called by the widget progress bar
     */
    async getFillingProducts(req: Request, res: Response) {
        try {
            const cartTotal = parseFloat(req.query.cart_total as string || '0');
            const shopName = req.query.shop as string;
            
            if (!shopName) return res.status(400).json({ error: 'Shop domain required' });

            // Find merchant settings for threshold
            const merchant = await prisma.merchants.findFirst({
                where: { shopify_shop_name: shopName }
            });

            if (!merchant || !merchant.progress_bar_active) {
                return res.status(200).json({ active: false });
            }

            const threshold = Number(merchant.shipping_threshold || 1000);
            const gap = threshold - cartTotal;

            if (gap <= 0) {
                return res.status(200).json({ active: true, unlocked: true, threshold });
            }

            // Find products priced around the gap (+/- 50% of gap) or low-cost items
            // We want products that are easy to add to cart
            const candidates = await prisma.products.findMany({
                where: {
                    merchant_id: merchant.id,
                    price: {
                        gte: Math.max(10, gap * 0.4), // Don't suggest 1rs items, but also not 10k items
                        lte: gap * 1.5
                    }
                },
                take: 10
            });

            // If no perfect gap fillers, just take any 3 cheap products
            let suggestions = candidates;
            if (candidates.length === 0) {
                suggestions = await prisma.products.findMany({
                    where: { merchant_id: merchant.id },
                    orderBy: { price: 'asc' },
                    take: 3
                });
            }

            res.status(200).json({
                active: true,
                unlocked: false,
                threshold,
                gap,
                suggestions: suggestions.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: (p as any).image_url,
                    shopify_id: p.shopify_id?.toString(),
                    shopify_variant_id: (p as any).shopify_variant_id?.toString()
                }))
            });

        } catch (error) {
            console.error('[Upsell Controller] getFillingProducts Error:', error);
            res.status(500).json({ error: 'Failed to fetch filling products' });
        }
    },

    /**
     * Cart Recovery — serves upsell recommendation for abandoned cart links
     * Called by the widget when customer visits ?recovery=true&cart_token=XXX
     */
    async getCartRecovery(req: Request, res: Response) {
        try {
            const { cartToken } = req.params;
            if (!cartToken) return res.status(400).json({ error: 'Cart token required' });

            // Find the abandoned cart
            const cart = await (prisma as any).abandoned_carts.findUnique({
                where: { cart_token: cartToken }
            });

            if (!cart) return res.status(404).json({ error: 'Cart not found' });

            // Find the upsell event linked to this cart
            const upsellEvent = await (prisma as any).upsell_events.findFirst({
                where: { abandoned_cart_id: cart.id },
                include: { products: true },
                orderBy: { id: 'desc' }
            });

            if (!upsellEvent || !upsellEvent.products) {
                return res.status(404).json({ error: 'No recommendation found for this cart' });
            }

            const product = upsellEvent.products;
            const originalPrice = Number(product.price || 0);
            const discountedPrice = originalPrice * (1 - (upsellEvent.discount_percent || 0) / 100);

            // Mark cart as recovered (customer clicked the link)
            await (prisma as any).abandoned_carts.update({
                where: { id: cart.id },
                data: { status: 'recovered' }
            });

            res.status(200).json({
                event_id: upsellEvent.id,
                product_name: product.name,
                product_handle: product.handle,
                product_image: product.image_url,
                original_price: originalPrice,
                discounted_price: discountedPrice,
                discount_percent: upsellEvent.discount_percent,
                pitch: upsellEvent.pitch,
                variant_id: product.shopify_variant_id?.toString() || null,
                expires_at: upsellEvent.expires_at,
                cart_items: cart.cart_items,
                event_type: 'abandoned_cart',
            });

        } catch (error) {
            console.error('[Upsell Controller] getCartRecovery Error:', error);
            res.status(500).json({ error: 'Failed to fetch cart recovery' });
        }
    }
};
