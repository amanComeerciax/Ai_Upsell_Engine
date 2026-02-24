import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { aiService } from '../services/ai.service';
import { shopifyService } from '../services/shopify.service';
import { emailService } from '../services/email.service';
import { inferCategory } from '../lib/categorizer';
import { emitEvent } from '../lib/socket';
import { queueService } from '../services/queue.service';

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

        } catch (error) {
            console.error('[Shopify Webhook] ❌ Queue Error:', error);
        }
    }
};
