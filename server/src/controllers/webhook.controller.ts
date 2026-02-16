import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { aiService } from '../services/ai.service';

export const webhookController = {
    async handleOrderCreate(req: Request, res: Response) {
        // 1. Acknowledge Shopify IMMEDIATELY (Prevent retry loops)
        res.status(200).json({ status: 'Acknowledged' });

        // 2. Process in Background
        try {
            const orderData = req.body;
            console.log(`[Shopify Webhook] Received new order: ${orderData.id}`);

            // 1. Get or Create User
            const userEmail = orderData.email || 'guest@example.com';
            const userName = `${orderData.customer?.first_name || ''} ${orderData.customer?.last_name || ''}`.trim() || 'Guest Customer';

            const user = await prisma.users.upsert({
                where: { email: userEmail },
                update: { name: userName },
                create: { email: userEmail, name: userName }
            });

            // 2. Create Order (Deduplicated)
            const order = await prisma.orders.upsert({
                where: { shopify_id: BigInt(orderData.id) },
                update: { total_amount: orderData.total_price },
                create: {
                    shopify_id: BigInt(orderData.id),
                    user_id: user.id,
                    total_amount: orderData.total_price,
                }
            });

            // 3. Create Order Items and find a Trigger Product
            let triggerProduct = null;
            for (const item of orderData.line_items) {
                const product = await prisma.products.findUnique({
                    where: { shopify_id: BigInt(item.product_id) }
                });

                if (product) {
                    // Check if item already exists in order
                    const existingItem = await prisma.order_items.findFirst({
                        where: { order_id: order.id, product_id: product.id }
                    });

                    if (!existingItem) {
                        await prisma.order_items.create({
                            data: {
                                order_id: order.id,
                                product_id: product.id,
                                quantity: item.quantity
                            }
                        });
                    }
                    if (!triggerProduct) triggerProduct = product;
                }
            }

            // 4. If we found a trigger product in our DB, run AI Recommendation
            if (triggerProduct) {
                console.log(`[AI Engine] Analyzing order for trigger product: ${triggerProduct.name}`);

                // Get all other products as candidates
                const candidates = await prisma.products.findMany({
                    where: {
                        NOT: { id: triggerProduct.id }
                    },
                    take: 10 // Consider top 10 for speed
                });

                // Format candidates for AI service
                const formattedCandidates = candidates.map(c => ({
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

                // 5. Save Upsell Event (Prevent duplicates)
                const existingUpsell = await prisma.upsell_events.findFirst({
                    where: { order_id: order.id }
                });

                if (!existingUpsell) {
                    await prisma.upsell_events.create({
                        data: {
                            user_id: user.id,
                            order_id: order.id,
                            upsell_product_id: recommendation.recommended_product_id,
                            discount_percent: recommendation.discount_percent,
                            converted: false
                        }
                    });
                    console.log(`[AI Engine] Created Upsell: Suggesting ${recommendation.recommended_product_name} with ${recommendation.discount_percent}% discount.`);
                } else {
                    console.log(`[AI Engine] Upsell already exists for order ${order.id}, skipping creation.`);
                }
            }
        } catch (error) {
            console.error('[Shopify Webhook] Background process error:', error);
        }
    }
};
