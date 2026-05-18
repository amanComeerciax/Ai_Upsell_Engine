import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../lib/prisma';
import { aiService } from '../services/ai.service';
import { emailService } from '../services/email.service';
import { emitEvent } from '../lib/socket';
import { scoringService } from '../services/scoring.service';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isTLS = REDIS_URL.startsWith('rediss://');
const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
});

/**
 * Cart Abandonment Worker
 * Fires after a delay (default 30 min) to check if a cart was abandoned.
 * If the customer didn't buy → sends a recovery email with AI upsell.
 */
export const cartWorker = new Worker(
    'cart-abandonment',
    async (job: Job) => {
        const { cartToken, merchantId } = job.data;
        console.log(`[Cart Worker] 🛒 Checking cart abandonment: ${cartToken}`);

        try {
            // 1. Get the cart from DB
            const cart = await (prisma as any).abandoned_carts.findUnique({
                where: { cart_token: cartToken }
            });

            if (!cart) {
                console.log(`[Cart Worker] ⚠️ Cart ${cartToken} not found. Skipping.`);
                return;
            }

            // 2. If cart was already converted (customer bought), skip
            if (cart.status === 'converted') {
                console.log(`[Cart Worker] ✅ Cart ${cartToken} already converted to order. Skipping.`);
                return;
            }

            // 3. If recovery already sent, skip
            if (cart.recovery_sent) {
                console.log(`[Cart Worker] 📧 Recovery already sent for ${cartToken}. Skipping.`);
                return;
            }

            // 4. Double-check: did this customer place an order recently?
            if (cart.customer_email) {
                const recentOrder = await (prisma as any).orders.findFirst({
                    where: {
                        merchant_id: merchantId,
                        users: { email: cart.customer_email },
                        created_at: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // last 2 hours
                    },
                    orderBy: { created_at: 'desc' }
                });

                if (recentOrder) {
                    console.log(`[Cart Worker] ✅ Customer ${cart.customer_email} placed an order. Marking as converted.`);
                    await (prisma as any).abandoned_carts.update({
                        where: { id: cart.id },
                        data: { status: 'converted' }
                    });
                    return;
                }
            }

            // 5. Cart is ABANDONED! 🚨 Generate AI upsell recommendation
            console.log(`[Cart Worker] 🚨 Cart ABANDONED: ${cartToken} (${cart.customer_email || 'unknown'})`);

            const cartItems = cart.cart_items as any[];
            if (!cartItems || cartItems.length === 0) {
                console.log(`[Cart Worker] ⚠️ Cart has no items. Skipping.`);
                return;
            }

            // Get the first cart item's product to find complementary recommendations
            const triggerProductId = cartItems[0].product_id;
            let recommendedProduct: any = null;

            if (triggerProductId) {
                // Find the trigger product in DB
                const triggerProduct = await (prisma as any).products.findFirst({
                    where: {
                        shopify_id: BigInt(triggerProductId),
                        merchant_id: merchantId
                    }
                });

                if (triggerProduct) {
                    // Get all merchant products as candidates
                    const allProducts = await (prisma as any).products.findMany({
                        where: {
                            merchant_id: merchantId,
                            id: { not: triggerProduct.id }
                        }
                    });

                    // Use scoring service to rank candidates
                    if (allProducts.length > 0) {
                        const ranked = scoringService.rankCandidates(triggerProduct, allProducts);
                        if (ranked.length > 0) {
                            recommendedProduct = ranked[0]; // ScoredProduct extends Product directly
                            console.log(`[Cart Worker] 🎯 AI pick: "${recommendedProduct.name}" (score: ${ranked[0].score.toFixed(2)})`);
                        }
                    }
                }
            }

            // 6. Pick a discount (slightly higher than post-purchase to incentivize return)
            const discountPercent = 20; // More aggressive for abandoned carts

            // 7. Get or create user
            let user = null;
            if (cart.customer_email) {
                user = await (prisma as any).users.upsert({
                    where: { email: cart.customer_email },
                    update: { name: cart.customer_name || undefined },
                    create: {
                        email: cart.customer_email,
                        name: cart.customer_name || 'Shopper',
                        merchant_id: merchantId
                    }
                });
            }

            // 8. Generate AI pitch & Expiry
            if (recommendedProduct) {
                const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hour expiry

                // Generate AI pitch
                let pitch = `Complete your order and save ${discountPercent}% on ${recommendedProduct.name}!`;
                try {
                    const aiResult = await aiService.getSmartRecommendation(
                        { name: cartItems[0].title, category: 'General' } as any,
                        [recommendedProduct] as any
                    );
                    if (aiResult?.reason) {
                        pitch = `${aiResult.reason} Save ${discountPercent}% now!`;
                    }
                } catch (e) {
                    console.warn('[Cart Worker] AI pitch failed, using default.');
                }

                // Create or Update upsell event (type: abandoned_cart)
                // Use upsert-like logic to prevent duplicates if job is rescheduled
                const existingEvent = await (prisma as any).upsell_events.findFirst({
                    where: { abandoned_cart_id: cart.id }
                });

                let upsellEvent;
                if (existingEvent) {
                    upsellEvent = await (prisma as any).upsell_events.update({
                        where: { id: existingEvent.id },
                        data: {
                            user_id: user?.id || null,
                            upsell_product_id: recommendedProduct.id,
                            discount_percent: discountPercent,
                            pitch,
                            expires_at: expiresAt,
                        }
                    });
                    console.log(`[Cart Worker] 📝 Updated existing upsell event: #${upsellEvent.id}`);
                } else {
                    upsellEvent = await (prisma as any).upsell_events.create({
                        data: {
                            merchant_id: merchantId,
                            user_id: user?.id || null,
                            upsell_product_id: recommendedProduct.id,
                            discount_percent: discountPercent,
                            pitch,
                            shown_at: null,
                            expires_at: expiresAt,
                            converted: false,
                            event_type: 'abandoned_cart',
                            abandoned_cart_id: cart.id,
                        }
                    });
                    console.log(`[Cart Worker] 📝 Created new upsell event: #${upsellEvent.id}`);
                }

                // 9. Send recovery email
                if (cart.customer_email) {
                    // Get merchant for shop domain
                    const merchant = await (prisma as any).merchants.findUnique({
                        where: { id: merchantId }
                    });

                    const shopDomain = merchant?.shopify_shop_name
                        ? `${merchant.shopify_shop_name}.myshopify.com`
                        : 'your-store.myshopify.com';

                    const emailSent = await emailService.sendUpsellEmail({
                        to: cart.customer_email,
                        customerName: cart.customer_name || 'there',
                        triggerProductName: cartItems[0].title || 'your cart items',
                        upsellProductName: recommendedProduct.name || 'Special Product',
                        upsellProductImage: recommendedProduct.image_url || null,
                        originalPrice: Number(recommendedProduct.price || 0),
                        discountPercent,
                        personalizedPitch: `You left items in your cart! ${pitch}`,
                        eventId: upsellEvent.id,
                        expiresAt,
                        shopDomain,
                        customSubject: merchant?.cart_email_subject || `🛒 You forgot something! Save ${discountPercent}% if you come back now`,
                        customBody: merchant?.cart_email_body || null,
                    });

                    if (emailSent) {
                        console.log(`[Cart Worker] 📧 Recovery email sent to ${cart.customer_email}`);
                    }
                }

                // 10. Update cart status
                await (prisma as any).abandoned_carts.update({
                    where: { id: cart.id },
                    data: { status: 'recovered', recovery_sent: true }
                });

                // 11. Emit socket event
                emitEvent('cart:abandoned', {
                    cartToken,
                    customerEmail: cart.customer_email,
                    upsellEventId: upsellEvent.id,
                    recommendedProduct: recommendedProduct.name,
                });

            } else {
                console.log(`[Cart Worker] ⚠️ No recommendation found for cart ${cartToken}. Marking as expired.`);
                await (prisma as any).abandoned_carts.update({
                    where: { id: cart.id },
                    data: { status: 'expired' }
                });
            }

        } catch (error) {
            console.error(`[Cart Worker] ❌ Error processing cart ${cartToken}:`, error);
            throw error; // Let BullMQ retry
        }
    },
    {
        connection: connection as any,
        concurrency: 5,
    }
);

// Event listeners
cartWorker.on('completed', (job) => {
    console.log(`[Cart Worker] ✅ Job ${job.id} completed.`);
});

cartWorker.on('failed', (job, err) => {
    console.error(`[Cart Worker] ❌ Job ${job?.id} failed:`, err.message);
});

console.log('[Cart Worker] 🛒 Cart abandonment worker is running...');
