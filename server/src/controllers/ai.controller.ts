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
     * Main recommendation pipeline: Returns top 3 products for the carousel widget.
     */
    async getRecommendation(req: Request, res: Response) {
        try {
            const { product_id, shop: shopQuery } = req.query;

            // 1. Identify Merchant via query param (priority) or Referer header
            const referer = req.headers.referer || '';
            let shopName: string | null = (shopQuery as string) || null;

            // Normalize query param: strip protocol, port, .myshopify.com suffix
            if (shopName) {
                shopName = shopName.replace(/^https?:\/\//, '').split(':')[0].split('/')[0].trim();
                shopName = shopName.replace(/\.myshopify\.com$/, ''); // keep just subdomain
            }

            // Fallback: extract from Referer header
            if (!shopName && referer) {
                const shopNameMatch = referer.match(/([^/:]+)\.myshopify\.com/);
                shopName = shopNameMatch ? shopNameMatch[1] : null;
            }

            console.log(`[AI Controller] Request. Shop: "${shopName || 'unknown'}", PID: ${product_id}, Referer: ${referer}`);

            let merchantFilter: any = null;
            if (shopName) {
                const merchant = await prisma.merchants.findFirst({
                    where: {
                        OR: [
                            { shopify_shop_name: shopName },
                            { shopify_shop_name: `${shopName}.myshopify.com` },
                            { shopify_shop_name: { contains: shopName } }
                        ]
                    },
                    orderBy: { created_at: 'desc' }
                });
                if (merchant) {
                    merchantFilter = { merchant_id: merchant.id };
                    shopName = (merchant.shopify_shop_name ?? '').replace(/\.myshopify\.com$/, '');
                    console.log(`[AI Controller] ✅ Identified Merchant: ${merchant.shopify_shop_name} (ID: ${merchant.id})`);
                } else {
                    console.warn(`[AI Controller] ❌ Merchant not found for shop: "${shopName}"`);
                    return res.status(401).json({ error: 'Unidentified Merchant', message: 'Could not match store credentials.' });
                }
            } else {
                console.warn(`[AI Controller] ❌ No shop identifier in request. Referer: ${referer}`);
                return res.status(401).json({ 
                    error: 'Unidentified Merchant', 
                    message: 'No shop identifier found in request. Please ensure the ?shop= query parameter or Referer header is present.' 
                });
            }

            // 2. Fetch available products from DB
            const allProducts = await prisma.products.findMany({
                where: merchantFilter,
                orderBy: { created_at: 'desc' }
            });

            console.log(`[AI Controller] 📦 Found ${allProducts.length} products for merchant (ID: ${merchantFilter.merchant_id})`);

            if (allProducts.length < 2) {
                console.warn(`[AI Controller] ⚠️ Insufficient inventory for cross-sells: ${allProducts.length} products.`);
                return res.status(400).json({
                    error: 'Insufficient Inventory',
                    message: 'At least 2 products are required for cross-sells. Current count: ' + allProducts.length
                });
            }

            // 3. Find Trigger Product
            let triggerProduct = allProducts[0];
            if (product_id) {
                const found = allProducts.find(p => p.shopify_id === BigInt(product_id as string));
                if (found) triggerProduct = found;
            }

            const candidates = allProducts.filter(p => p.id !== triggerProduct.id);
            console.log(`[AI Controller] 🎯 Trigger Product: "${triggerProduct.name}" (ID: ${triggerProduct.id}). Candidates: ${candidates.length}`);

            // 4. Get top 3 recommendations for the carousel (instant — smart fallback + background AI)
            const topRecs = await aiService.getTopRecommendations(triggerProduct, candidates);
            console.log(`[AI Controller] ✨ Generated ${topRecs.length} recommendations.`);

            // 5. Build full product details for each recommendation
            const shopDomain = shopName
                ? (shopName.includes('.') ? shopName : `${shopName}.myshopify.com`)
                : (process.env.SHOPIFY_SHOP_NAME || 'store.myshopify.com');

            const recProducts = topRecs.map(rec => {
                const rp = allProducts.find(p => p.id === rec.recommended_product_id);
                const slug = rp?.handle
                    || rp?.name?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
                return {
                    id: rec.recommended_product_id,
                    name: rec.recommended_product_name,
                    price: Number(rp?.price) || 0,
                    discount_percent: rec.discount_percent,
                    image: rp?.image_url || null,
                    reason: rec.reason,
                    shopify_id: rp?.shopify_id?.toString() || null,
                    shopify_url: rp?.shopify_id ? `https://${shopDomain}/products/${slug}` : null,
                };
            });

            // Return recommendations[] for carousel + recommended_product for legacy compat
            res.status(200).json({
                success: true,
                order_id: null,
                recommendations: recProducts,              // New: carousel array
                recommended_product: recProducts[0] || null, // Legacy: email/event compat
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
