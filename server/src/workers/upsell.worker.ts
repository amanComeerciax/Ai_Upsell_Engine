import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../lib/prisma';
import { aiService } from '../services/ai.service';
import { shopifyService } from '../services/shopify.service';
import { emailService } from '../services/email.service';
import { inferCategory } from '../lib/categorizer';
import { emitEvent } from '../lib/socket';
import { cacheService } from '../services/cache.service';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isTLS = REDIS_URL.startsWith('rediss://');
const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
});

// Create and start the worker
export const upsellWorker = new Worker(
    'upsell-processing',
    async (job: Job) => {
        const { orderData, merchantId, shopDomain } = job.data;
        console.log(`[Worker] 🛠️ Processing Job ${job.id} for Order: ${orderData.id}`);

        try {
            // 1. Get or Create User
            const userEmail = orderData.email || 'guest@example.com';
            const userName = `${orderData.customer?.first_name || ''} ${orderData.customer?.last_name || ''}`.trim() || 'Guest Customer';

            const user = await (prisma as any).users.upsert({
                where: { email: userEmail },
                update: { name: userName, merchant_id: merchantId },
                create: { email: userEmail, name: userName, merchant_id: merchantId }
            });

            // 2. Create Order
            const order = await (prisma as any).orders.upsert({
                where: { shopify_id: BigInt(orderData.id) },
                update: { total_amount: orderData.total_price },
                create: {
                    shopify_id: BigInt(orderData.id),
                    user_id: user.id,
                    total_amount: orderData.total_price,
                    merchant_id: merchantId,
                }
            });

            // Invalidate cache immediately after order is saved to DB
            // (webhook invalidation happens too early — before order exists in DB)
            if (merchantId) {
                await cacheService.invalidateMerchant(merchantId);
            }

            // 3. Process Line Items
            let triggerProduct = null;
            for (const item of orderData.line_items) {
                let product = await (prisma as any).products.findUnique({
                    where: { shopify_id: BigInt(item.product_id) }
                });

                // Auto-Sync if missing
                if (!product && item.product_id && merchantId) {
                    const merchant = await (prisma as any).merchants.findUnique({ where: { id: merchantId } });
                    if (merchant && merchant.shopify_access_token) {
                        const shopifyProduct = await shopifyService.getProductById(
                            merchant.shopify_shop_name,
                            merchant.shopify_access_token,
                            item.product_id.toString()
                        );
                        if (shopifyProduct) {
                            product = await (prisma as any).products.upsert({
                                where: { shopify_id: BigInt(shopifyProduct.id) },
                                update: {
                                    name: shopifyProduct.title,
                                    category: shopifyProduct.product_type || inferCategory(shopifyProduct.title),
                                    price: shopifyProduct.variants?.[0]?.price || 0,
                                    image_url: shopifyProduct.image?.src || null
                                },
                                create: {
                                    shopify_id: BigInt(shopifyProduct.id),
                                    name: shopifyProduct.title,
                                    category: shopifyProduct.product_type || inferCategory(shopifyProduct.title),
                                    price: shopifyProduct.variants?.[0]?.price || 0,
                                    image_url: shopifyProduct.image?.src || null,
                                    merchant_id: merchantId
                                }
                            });
                        }
                    }
                }

                if (product) {
                    const existingItem = await (prisma as any).order_items.findFirst({
                        where: { order_id: order.id, product_id: product.id }
                    });
                    if (!existingItem) {
                        await (prisma as any).order_items.create({
                            data: { order_id: order.id, product_id: product.id, quantity: item.quantity }
                        });
                    }
                    if (!triggerProduct) triggerProduct = product;
                }
            }

            // 4. Run AI with Personalization
            if (triggerProduct) {
                console.log(`[Worker] 🤖 Running AI for: ${triggerProduct.name}`);
                const candidates = await (prisma as any).products.findMany({
                    where: { merchant_id: merchantId, NOT: { id: triggerProduct.id } },
                    orderBy: { created_at: 'desc' }
                });

                const formattedCandidates = candidates.map((c: any) => ({
                    id: c.id,
                    name: c.name || 'Unknown',
                    category: c.category || 'General',
                    price: Number(c.price),
                    // Enriched fields for Feature DNA scoring
                    tags: c.tags || null,
                    description: c.description || null,
                    handle: c.handle || null,
                    image_url: c.image_url || null,
                    shopify_id: c.shopify_id?.toString() || null,
                    shopify_variant_id: c.shopify_variant_id?.toString() || null,
                }));

                // ── PERSONALIZATION ENGINE ─────────────────────────────────
                const shippingAddress = orderData.shipping_address || {};
                const location = shippingAddress.city && shippingAddress.province
                    ? `${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.country}`
                    : shippingAddress.country || 'Global';

                const pastOrders = await (prisma as any).orders.findMany({
                    where: { user_id: user.id, NOT: { shopify_id: BigInt(orderData.id) } },
                    include: { order_items: { include: { products: true } } },
                    take: 5,
                    orderBy: { created_at: 'desc' }
                });

                const interests = Array.from(new Set(
                    pastOrders.flatMap((o: any) => o.order_items.map((oi: any) => oi.products?.category))
                        .filter(Boolean)
                )) as string[];

                // ── A/B TESTING SPLIT (50/50) ──────────────────────────────
                const testGroup = Math.random() < 0.5 ? 'A' : 'B';
                console.log(`[Worker] 🧪 A/B Testing: Order ${order.id} assigned to Group ${testGroup}`);

                // Fetch merchant's discount range
                const merchantSettings = await prisma.merchants.findUnique({
                    where: { id: merchantId },
                    select: { discount_min: true, discount_max: true }
                });
                const discountRange = {
                    min: merchantSettings?.discount_min ?? 5,
                    max: merchantSettings?.discount_max ?? 25
                };

                const recommendation = await aiService.getSmartRecommendation(
                    {
                        id: triggerProduct.id,
                        name: triggerProduct.name || 'Unknown',
                        category: triggerProduct.category || 'General',
                        price: Number(triggerProduct.price),
                        // Enriched fields for Feature DNA scoring
                        tags: (triggerProduct as any).tags || null,
                        description: (triggerProduct as any).description || null,
                        handle: (triggerProduct as any).handle || null,
                    },
                    formattedCandidates,
                    { location, interests },
                    testGroup,
                    discountRange
                );

                if (recommendation.recommended_product_id > 0) {
                    const existingUpsell = await (prisma as any).upsell_events.findFirst({
                        where: { order_id: order.id }
                    });

                    if (!existingUpsell) {
                        const expiresAt = new Date();
                        expiresAt.setHours(expiresAt.getHours() + 48);

                        const newUpsellEvent = await (prisma as any).upsell_events.create({
                            data: {
                                user_id: user.id,
                                order_id: order.id,
                                upsell_product_id: recommendation.recommended_product_id,
                                discount_percent: recommendation.discount_percent,
                                pitch: recommendation.reason,
                                converted: false,
                                merchant_id: merchantId,
                                expires_at: expiresAt,
                                test_group: testGroup // Store the test group
                            },
                            include: { products: true }
                        });

                        console.log(`[Worker] ✅ Upsell created for order ${order.id}`);

                        // Notify via Socket
                        emitEvent('upsell:created', {
                            eventId: newUpsellEvent.id,
                            productName: newUpsellEvent.products?.name,
                            customer: userEmail
                        });

                        // Send Email
                        const merchant = merchantId ? await (prisma as any).merchants.findUnique({ where: { id: merchantId } }) : null;
                        await emailService.sendUpsellEmail({
                            to: userEmail,
                            customerName: userName,
                            triggerProductName: triggerProduct.name || 'your recent purchase',
                            upsellProductName: newUpsellEvent.products?.name || recommendation.recommended_product_name,
                            upsellProductImage: newUpsellEvent.products?.image_url || null,
                            originalPrice: Number(newUpsellEvent.products?.price || 0),
                            discountPercent: recommendation.discount_percent,
                            personalizedPitch: recommendation.reason,
                            eventId: newUpsellEvent.id,
                            expiresAt,
                            shopDomain,
                            customSubject: merchant?.email_subject,
                            customBody: merchant?.email_body
                        });
                    }
                }
            }
            return { status: 'success', orderId: orderData.id };
        } catch (error: any) {
            // Handle unique constraint violation (P2002) - means upsell already exists for this order
            if (error.code === 'P2002') {
                console.log(`[Worker] ⚠️ Duplicate record detected for job ${job.id}. Upsell for order ${orderData.id} already exists. Skipping.`);
                return { status: 'skipped', reason: 'duplicate', orderId: orderData.id };
            }

            console.error(`[Worker] ❌ Error processing job ${job.id}:`, error.message);
            throw error; // Rethrow to trigger BullMQ retry
        }
    },
    {
        connection: connection as any,
        concurrency: 2, // Only process 2 AI tasks at once to protect the host
    }
);

upsellWorker.on('completed', (job) => {
    console.log(`[Worker] ✅ Job ${job.id} completed!`);
});

upsellWorker.on('failed', (job, err) => {
    console.error(`[Worker] 💥 Job ${job?.id} failed: ${err.message}`);
});
