import { Request, Response } from 'express';
import { shopifyService } from '../services/shopify.service';
import prisma from '../lib/prisma';
import { inferCategory } from '../lib/categorizer';

export const shopifyController = {
    async syncProducts(req: Request, res: Response) {
        try {
            console.log('[Shopify Sync] Starting product synchronization...');
            const shopifyProducts = await shopifyService.getProducts(
                process.env.SHOPIFY_SHOP_NAME || '',
                process.env.SHOPIFY_ACCESS_TOKEN || ''
            );

            let syncedCount = 0;
            const results: { name: string; category: string; price: string }[] = [];

            for (const sp of shopifyProducts) {
                // Get the first variant's price and ID
                const price = sp.variants && sp.variants.length > 0 ? sp.variants[0].price : 0;
                const variantId = sp.variants && sp.variants.length > 0 ? sp.variants[0].id : null;
                // Get the first image
                const imageUrl = sp.images && sp.images.length > 0 ? sp.images[0].src : null;
                // Smart category: use Shopify's product_type, or infer from name
                const category = sp.product_type || inferCategory(sp.title);

                await (prisma.products as any).upsert({
                    where: { shopify_id: BigInt(sp.id) },
                    update: {
                        name: sp.title,
                        handle: sp.handle,
                        shopify_variant_id: variantId ? BigInt(variantId) : null,
                        description: sp.body_html,
                        category: category,
                        price: price,
                        image_url: imageUrl,
                    },
                    create: {
                        shopify_id: BigInt(sp.id),
                        shopify_variant_id: variantId ? BigInt(variantId) : null,
                        name: sp.title,
                        handle: sp.handle,
                        description: sp.body_html,
                        category: category,
                        price: price,
                        image_url: imageUrl,
                    },
                });
                syncedCount++;
                results.push({ name: sp.title, category, price });
                console.log(`[Shopify Sync] ✅ ${sp.title} → ${category}`);
            }

            res.status(200).json({
                success: true,
                message: `Successfully synced ${syncedCount} products from Shopify.`,
                count: syncedCount,
                products: results
            });
        } catch (error: any) {
            console.error('[Shopify Sync] Error:', error);
            res.status(500).json({ error: 'Failed to sync products from Shopify' });
        }
    }
};

