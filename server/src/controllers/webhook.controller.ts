import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { aiService } from '../services/ai.service';
import { shopifyService } from '../services/shopify.service';
import { emailService } from '../services/email.service';
import { inferCategory } from '../lib/categorizer';
import { emitEvent } from '../lib/socket';
import { queueService } from '../services/queue.service';
import { cacheService } from '../services/cache.service';

export const webhookController = {
    async handleOrderCreate(req: Request, res: Response) {
        // 1. Acknowledge Shopify IMMEDIATELY
        res.status(200).json({ status: 'Acknowledged' });

        // 2. Process in Background via Queue
        try {
            const orderData = req.body;
            console.log(`[Shopify Webhook] 📥 New order received: ${orderData.id}. Offloading to queue...`);

            // Notify via Socket (Instant feedback)
            emitEvent('order:created', {
                shopifyId: orderData.id,
                total: orderData.total_price,
                customer: orderData.email
            });

            // 0. Identify Merchant (We do this here to route properly)
            const merchantIdHeader = req.headers['x-merchant-id'] as string;
            const shopDomain = req.headers['x-shopify-shop-domain'] as string;
            let merchantId: number | null = null;

            if (merchantIdHeader) {
                merchantId = parseInt(merchantIdHeader);
            } else if (shopDomain) {
                const merchant = await (prisma as any).merchants.findFirst({
                    where: { shopify_shop_name: { contains: shopDomain.replace('.myshopify.com', '') } },
                    orderBy: { created_at: 'desc' }
                });
                if (merchant) merchantId = merchant.id;
            }

            // 3. Add to Queue for heavy lifting (AI, DB Sync, Email)
            await queueService.addUpsellJob(
                orderData,
                merchantId,
                shopDomain || 'your-store.myshopify.com'
            );

            // 4. Also mark any abandoned cart from this customer as "converted"
            if (orderData.email) {
                await (prisma as any).abandoned_carts.updateMany({
                    where: {
                        customer_email: orderData.email,
                        status: 'pending',
                        ...(merchantId ? { merchant_id: merchantId } : {})
                    },
                    data: { status: 'converted' }
                });
                console.log(`[Webhook] 🛒→✅ Marked abandoned carts as converted for ${orderData.email}`);
            }

            // Invalidate caches for this merchant (new order = stale dashboard/analytics/orders)
            if (merchantId) {
                await cacheService.invalidateMerchant(merchantId);
            }

        } catch (error) {
            console.error('[Shopify Webhook] ❌ Queue Error:', error);
        }
    },

    /**
     * Handle Shopify carts/create and carts/update webhooks
     * Saves cart data and schedules an abandonment check job
     */
    async handleCartUpdate(req: Request, res: Response) {
        // Acknowledge immediately (Shopify requires < 5s response)
        res.status(200).json({ status: 'Acknowledged' });

        try {
            const cartData = req.body;
            const cartToken = cartData.token || cartData.id?.toString();
            if (!cartToken) {
                console.warn('[Cart Webhook] ⚠️ No cart token found, skipping.');
                return;
            }

            // Identify merchant
            const merchantIdHeader = req.headers['x-merchant-id'] as string;
            const shopDomain = req.headers['x-shopify-shop-domain'] as string;
            let merchantId: number | null = null;

            if (merchantIdHeader) {
                merchantId = parseInt(merchantIdHeader);
            } else if (shopDomain) {
                const merchant = await (prisma as any).merchants.findFirst({
                    where: { shopify_shop_name: { contains: shopDomain.replace('.myshopify.com', '') } },
                    orderBy: { created_at: 'desc' }
                });
                if (merchant) merchantId = merchant.id;
            }

            // Extract cart items
            const cartItems = (cartData.line_items || []).map((item: any) => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                image: item.image || item.featured_image?.url || null
            }));

            const cartTotal = cartItems.reduce((sum: number, item: any) =>
                sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0
            );

            const customerEmail = cartData.customer?.email || cartData.email || null;
            const customerName = cartData.customer
                ? `${cartData.customer.first_name || ''} ${cartData.customer.last_name || ''}`.trim()
                : null;

            // Skip empty carts
            if (cartItems.length === 0) {
                console.log(`[Cart Webhook] 🛒 Empty cart ${cartToken}, skipping.`);
                return;
            }

            // Upsert cart in DB
            await (prisma as any).abandoned_carts.upsert({
                where: { cart_token: cartToken },
                update: {
                    cart_items: cartItems,
                    cart_total: cartTotal,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    status: 'pending',
                    recovery_sent: false,
                },
                create: {
                    cart_token: cartToken,
                    merchant_id: merchantId,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    cart_items: cartItems,
                    cart_total: cartTotal,
                    status: 'pending',
                }
            });

            console.log(`[Cart Webhook] 🛒 Cart saved: ${cartToken} (${cartItems.length} items, ₹${cartTotal})`);

            // Schedule abandonment check (30 min delay, or merchant's custom delay)
            const delayMs = 10 * 1000; // ⚠️ TEST: 10 sec (change to 30 * 60 * 1000 for production)
            await queueService.addCartCheckJob(cartToken, merchantId || 0, delayMs);

            // Notify via Socket
            emitEvent('cart:updated', {
                cartToken,
                customerEmail,
                itemCount: cartItems.length,
                total: cartTotal
            });

        } catch (error) {
            console.error('[Cart Webhook] ❌ Error:', error);
        }
    },

    /**
     * Handle Shopify checkouts/create and checkouts/update
     * This is where customer email becomes available.
     * Updates the abandoned cart record with the real email.
     */
    async handleCheckoutUpdate(req: Request, res: Response) {
        res.status(200).json({ status: 'Acknowledged' });

        try {
            const checkoutData = req.body;
            const cartToken = checkoutData.cart_token;
            const customerEmail = checkoutData.email || checkoutData.customer?.email;
            const customerName = checkoutData.billing_address
                ? `${checkoutData.billing_address.first_name || ''} ${checkoutData.billing_address.last_name || ''}`.trim()
                : checkoutData.customer
                    ? `${checkoutData.customer.first_name || ''} ${checkoutData.customer.last_name || ''}`.trim()
                    : null;

            if (!cartToken || !customerEmail) {
                console.log('[Checkout Webhook] ⚠️ No cart token or email, skipping.');
                return;
            }

            console.log(`[Checkout Webhook] 📧 Got email for cart ${cartToken}: ${customerEmail}`);

            // Update abandoned cart with real email + RESET status so worker can fire again
            // This fixes the race condition where worker fired before checkout captured email
            const merchantIdHeader = req.headers['x-merchant-id'] as string;
            const shopDomain = req.headers['x-shopify-shop-domain'] as string;
            let merchantId: number | null = merchantIdHeader ? parseInt(merchantIdHeader) : null;
            if (!merchantId && shopDomain) {
                const m = await (prisma as any).merchants.findFirst({
                    where: { shopify_shop_name: { contains: shopDomain.replace('.myshopify.com', '') } }
                });
                if (m) merchantId = m.id;
            }

            const updated = await (prisma as any).abandoned_carts.updateMany({
                where: {
                    cart_token: cartToken,
                    status: { not: 'converted' }  // Don't touch if customer already ordered
                },
                data: {
                    customer_email: customerEmail,
                    customer_name: customerName || undefined,
                    status: 'pending',       // ← Reset so worker fires again with email
                    recovery_sent: false,    // ← Reset so email gets sent this time
                }
            });

            if (updated.count > 0) {
                console.log(`[Checkout Webhook] ✅ Updated cart ${cartToken} with email ${customerEmail}`);
                // Reschedule fresh abandonment check now that we have the email
                const delayMs = 10 * 1000; // ⚠️ TEST: 10s → change to 10*60*1000 in production
                await queueService.addCartCheckJob(cartToken, merchantId || 0, delayMs);
                console.log(`[Checkout Webhook] 🔄 Rescheduled abandonment check for ${cartToken}`);
            } else {
                // Cart not saved from carts/update yet — save it now
                const merchantIdHeader = req.headers['x-merchant-id'] as string;
                const merchantId = merchantIdHeader ? parseInt(merchantIdHeader) : null;

                const cartItems = (checkoutData.line_items || []).map((item: any) => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                }));

                if (cartItems.length > 0) {
                    await (prisma as any).abandoned_carts.upsert({
                        where: { cart_token: cartToken },
                        update: { customer_email: customerEmail, customer_name: customerName },
                        create: {
                            cart_token: cartToken,
                            merchant_id: merchantId,
                            customer_email: customerEmail,
                            customer_name: customerName,
                            cart_items: cartItems,
                            cart_total: checkoutData.total_price || 0,
                        }
                    });

                    // Schedule abandonment check (10 min for checkout abandonment)
                    await queueService.addCartCheckJob(cartToken, merchantId || 0, 10 * 60 * 1000);
                    console.log(`[Checkout Webhook] 🛒 Cart saved from checkout: ${cartToken}`);
                }
            }

        } catch (error) {
            console.error('[Checkout Webhook] ❌ Error:', error);
        }
    }
};
