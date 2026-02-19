import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import prisma from '../lib/prisma';

/**
 * Controller for AI-driven operations.
 * Designed for production-level reliability and clean separation of concerns.
 */
export const aiController = {
    /**
     * Retrieves status and available models from the local AI core
     */
    async getModels(req: Request, res: Response) {
        try {
            const models = await aiService.listLocalModels();
            res.status(200).json({
                status: 'operational',
                engine: 'Velocity AI v1',
                ...models
            });
        } catch (error: any) {
            res.status(503).json({ error: 'AI Core Unavailable', details: error.message });
        }
    },

    /**
     * Main recommendation pipeline: Triggers AI reasoning to find the best upsell
     */
    async getRecommendation(req: Request, res: Response) {
        try {
            const { product_id } = req.query;

            // 1. Identify Merchant via Referer (for SaaS widget)
            const referer = req.headers.referer || '';
            const shopNameMatch = referer.match(/([^/]+)\.myshopify\.com/);
            const shopName = shopNameMatch ? shopNameMatch[1] : null;

            console.log(`[AI Controller] Request. Referer: ${referer}, Shop: ${shopName}`);

            let merchantFilter: any = {};
            if (shopName) {
                const merchant = await prisma.merchants.findFirst({
                    where: {
                        OR: [
                            { shopify_shop_name: { contains: shopName } },
                            { shopify_shop_name: shopName }
                        ]
                    },
                    orderBy: { created_at: 'desc' }
                });
                if (merchant) {
                    merchantFilter = { merchant_id: merchant.id };
                    console.log(`[AI Controller] Identified Merchant ID: ${merchant.id}`);
                }
            }


            // 2. Fetch available products from DB (Potential candidates)
            const allProducts = await prisma.products.findMany({
                where: merchantFilter,
                orderBy: { created_at: 'desc' }
            });

            console.log(`[AI Controller] Found ${allProducts.length} products for merchant filter`);

            if (allProducts.length < 2) {
                return res.status(400).json({
                    error: 'Insufficient Inventory',
                    message: 'At least 2 products are required for cross-sells. Count: ' + allProducts.length
                });
            }

            // 3. Logic: Find Trigger Product
            let triggerProduct = allProducts[0];
            if (product_id) {
                const found = allProducts.find(p => p.shopify_id === BigInt(product_id as string));
                if (found) triggerProduct = found;
            }

            const candidates = allProducts.filter(p => p.id !== triggerProduct.id);

            // 4. Delegation: Ask AI Service for a smart recommendation
            const aiRecommendation = await aiService.getSmartRecommendation(triggerProduct, candidates);

            // Fetch the actual product details for the recommendation
            const recProduct = allProducts.find(p => p.id === aiRecommendation.recommended_product_id);

            // 5. Response: Return structured data for the widget
            res.status(200).json({
                success: true,
                order_id: null,
                recommended_product: {
                    id: aiRecommendation.recommended_product_id,
                    name: aiRecommendation.recommended_product_name,
                    price: Number(recProduct?.price) || 0,
                    discount_percent: aiRecommendation.discount_percent,
                    image: recProduct?.image_url,
                    reason: aiRecommendation.reason,
                    shopify_id: recProduct?.shopify_id?.toString() || null,
                    shopify_url: recProduct?.shopify_id
                        ? `https://${shopName ? (shopName.includes('.') ? shopName : `${shopName}.myshopify.com`) : (process.env.SHOPIFY_SHOP_NAME || 'store.myshopify.com')}/products/${(recProduct as any).handle || recProduct.name?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}`
                        : null,
                }
            });

        } catch (error: any) {
            console.error('[AI Controller] Pipeline Exception:', error);
            res.status(500).json({
                error: 'Internal Logic Error',
                message: 'Failed to generate autonomous recommendation.'
            });
        }
    }
};
