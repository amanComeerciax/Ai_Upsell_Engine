import { Request, Response } from 'express';
import { shopifyService } from '../services/shopify.service';
import prisma from '../lib/prisma';

export const shopifyController = {
    async syncProducts(req: Request, res: Response) {
        try {
            console.log('[Shopify Sync] Starting product synchronization...');
            const shopifyProducts = await shopifyService.getProducts();

            let syncedCount = 0;

            for (const sp of shopifyProducts) {
                // Get the first variant's price
                const price = sp.variants && sp.variants.length > 0 ? sp.variants[0].price : 0;
                // Get the first image
                const imageUrl = sp.images && sp.images.length > 0 ? sp.images[0].src : null;

                await prisma.products.upsert({
                    where: { shopify_id: BigInt(sp.id) },
                    update: {
                        name: sp.title,
                        category: sp.product_type || 'General',
                        price: price,
                        image_url: imageUrl,
                    },
                    create: {
                        shopify_id: BigInt(sp.id),
                        name: sp.title,
                        category: sp.product_type || 'General',
                        price: price,
                        image_url: imageUrl,
                    },
                });
                syncedCount++;
            }

            res.status(200).json({
                success: true,
                message: `Successfully synced ${syncedCount} products from Shopify.`,
                count: syncedCount
            });
        } catch (error: any) {
            console.error('[Shopify Sync] Error:', error);
            res.status(500).json({ error: 'Failed to sync products from Shopify' });
        }
    }
};
