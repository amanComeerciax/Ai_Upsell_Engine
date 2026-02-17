import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { aiService } from '../services/ai.service';
import { shopifyService } from '../services/shopify.service';
import { inferCategory } from '../lib/categorizer';

export const webhookController = {
    async handleOrderCreate(req: Request, res: Response) {
        // 1. Acknowledge Shopify IMMEDIATELY
        res.status(200).json({ status: 'Acknowledged' });

        // 2. Process in Background
        try {
            const orderData = req.body;
            console.log(`[Shopify Webhook] Processing new order: ${orderData.id}`);

            // 0. Identify Merchant
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

            if (!merchantId) {
                console.warn(`[Shopify Webhook] Merchant not identified for order ${orderData.id}`);
            }

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

            // 4. Run AI
            if (triggerProduct) {
                console.log(`[AI Engine] Analyzing order for: ${triggerProduct.name}`);
                const candidates = await (prisma as any).products.findMany({
                    where: { merchant_id: merchantId, NOT: { id: triggerProduct.id } },
                    take: 10
                });

                const formattedCandidates = candidates.map((c: any) => ({
                    id: c.id,
                    name: c.name || 'Unknown',
                    category: c.category || 'General',
                    price: Number(c.price)
                }));

                const recommendation = await aiService.getSmartRecommendation(
                    {
                        id: triggerProduct.id,
                        name: triggerProduct.name || 'Unknown',
                        category: triggerProduct.category || 'General',
                        price: Number(triggerProduct.price)
                    },
                    formattedCandidates
                );

                if (recommendation.recommended_product_id > 0) {
                    const existingUpsell = await (prisma as any).upsell_events.findFirst({
                        where: { order_id: order.id }
                    });

                    if (!existingUpsell) {
                        await (prisma as any).upsell_events.create({
                            data: {
                                user_id: user.id,
                                order_id: order.id,
                                upsell_product_id: recommendation.recommended_product_id,
                                discount_percent: recommendation.discount_percent,
                                converted: false,
                                merchant_id: merchantId,
                            }
                        });
                        console.log(`[AI Engine] Upsell created for order ${order.id}`);
                    }
                }
            }
        } catch (error) {
            console.error('[Shopify Webhook] Error:', error);
        }
    }
};
