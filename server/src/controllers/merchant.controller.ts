import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import axios from 'axios';
import { inferCategory } from '../lib/categorizer';
import { cacheService } from '../services/cache.service';

export const merchantController = {
    /**
     * Register a new merchant (called after Clerk sign-up)
     */
    async register(req: Request, res: Response) {
        try {
            const { clerk_user_id, business_name, email } = req.body;

            if (!clerk_user_id) {
                return res.status(400).json({ error: 'clerk_user_id is required' });
            }

            // Check if merchant already exists
            const existing = await prisma.merchants.findUnique({
                where: { clerk_user_id }
            });

            if (existing) {
                // Get stats for existing merchant
                const [productCount, orderCount, upsellCount] = await Promise.all([
                    prisma.products.count({ where: { merchant_id: existing.id } }),
                    prisma.orders.count({ where: { merchant_id: existing.id } }),
                    prisma.upsell_events.count({ where: { merchant_id: existing.id } }),
                ]);

                return res.status(200).json({
                    merchant: {
                        ...existing,
                        stats: { products: productCount, orders: orderCount, upsells: upsellCount },
                        shopify_connected: !!existing.shopify_shop_name && !!existing.shopify_access_token
                    },
                    message: 'Merchant already registered',
                    isNew: false
                });
            }

            const merchant = await prisma.merchants.create({
                data: {
                    clerk_user_id,
                    business_name: business_name || null,
                    email: email || null,
                    plan: 'free'
                }
            });

            console.log(`[Merchant] New merchant registered: ${merchant.business_name} (ID: ${merchant.id})`);

            res.status(201).json({
                merchant: {
                    ...merchant,
                    stats: { products: 0, orders: 0, upsells: 0 },
                    shopify_connected: false
                },
                message: 'Merchant registered successfully',
                isNew: true
            });
        } catch (error) {
            console.error('[Merchant Controller] Register Error:', error);
            res.status(500).json({ error: 'Failed to register merchant' });
        }
    },

    /**
     * Get merchant profile
     */
    async getProfile(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;

            // Get stats
            const [productCount, orderCount, upsellCount] = await Promise.all([
                prisma.products.count({ where: { merchant_id: merchant.id } }),
                prisma.orders.count({ where: { merchant_id: merchant.id } }),
                prisma.upsell_events.count({ where: { merchant_id: merchant.id } }),
            ]);

            res.status(200).json({
                ...merchant,
                stats: {
                    products: productCount,
                    orders: orderCount,
                    upsells: upsellCount,
                },
                shopify_connected: !!merchant.shopify_shop_name && !!merchant.shopify_access_token,
            });
        } catch (error) {
            console.error('[Merchant Controller] Profile Error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    /**
     * Connect Shopify store (saves credentials)
     */
    async connectShopify(req: Request, res: Response) {
        try {
            const { shopName, accessToken, shop_name, access_token, api_key, api_secret } = req.body;
            const merchant = req.merchant;

            // Support both snake_case (frontend current) and camelCase
            const sName = shop_name || shopName;
            const aToken = access_token || accessToken;

            if (!merchant) {
                return res.status(401).json({ error: 'Merchant context not found' });
            }

            if (!sName || !aToken) {
                return res.status(400).json({ error: 'Shop name and access token are required' });
            }

            // Normalize shop name: strip https://, http://, and .myshopify.com
            const cleanShopName = sName
                .replace(/^https?:\/\//, '')
                .replace(/\.myshopify\.com\/?$/, '');

            console.log(`[Merchant] Connecting Shopify for ${cleanShopName}`);

            // 1. Verify credentials with a simple Shopify API call
            try {
                // Use the latest API version if possible, or match existing
                await axios.get(`https://${cleanShopName}.myshopify.com/admin/api/2024-04/shop.json`, {
                    headers: { 'X-Shopify-Access-Token': aToken },
                    timeout: 10000
                });
            } catch (error) {
                console.error('[Merchant] Shopify Verification Failed:', error);
                return res.status(400).json({ error: 'Invalid Shopify credentials. Please check shop name and access token.' });
            }

            // 2. Save credentials to merchant
            const updatedMerchant = await prisma.merchants.update({
                where: { id: merchant.id },
                data: {
                    shopify_shop_name: cleanShopName,
                    shopify_access_token: aToken,
                    shopify_api_key: api_key || null,
                    shopify_api_secret: api_secret || null,
                }
            });

            console.log(`[Merchant] Shopify connected for merchant ${merchant.id}: ${cleanShopName}`);

            res.status(200).json({
                message: 'Shopify store connected successfully!',
                shop_name: cleanShopName,
            });
        } catch (error) {
            console.error('[Merchant Controller] Connect Shopify Error:', error);
            res.status(500).json({ error: 'Failed to connect Shopify store' });
        }
    },

    /**
     * Sync products from merchant's Shopify store
     */
    async syncProducts(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;

            if (!merchant.shopify_shop_name || !merchant.shopify_access_token) {
                return res.status(400).json({ error: 'Shopify store not connected. Please connect first.' });
            }

            const { shopifyService } = require('../services/shopify.service');
            const shopifyProducts = await shopifyService.getProducts(
                merchant.shopify_shop_name,
                merchant.shopify_access_token
            );
            let syncedCount = 0;
            const results: { name: string; category: string; price: string }[] = [];

            for (const sp of shopifyProducts) {
                const price = sp.variants?.[0]?.price || 0;
                const imageUrl = sp.images?.[0]?.src || null;
                const category = sp.product_type || inferCategory(sp.title);

                await prisma.products.upsert({
                    where: { shopify_id: BigInt(sp.id) },
                    update: {
                        name: sp.title,
                        category,
                        price,
                        image_url: imageUrl,
                        merchant_id: merchant.id,
                    },
                    create: {
                        shopify_id: BigInt(sp.id),
                        name: sp.title,
                        category,
                        price,
                        image_url: imageUrl,
                        merchant_id: merchant.id,
                    },
                });
                syncedCount++;
                results.push({ name: sp.title, category, price });
                console.log(`[Merchant Sync] ✅ ${sp.title} → ${category}`);
            }

            res.status(200).json({
                success: true,
                message: `Successfully synced ${syncedCount} products.`,
                count: syncedCount,
                products: results
            });

            // Invalidate product caches after sync
            await cacheService.invalidate(cacheService.key(merchant.id, 'products'));
            await cacheService.invalidate(cacheService.key(merchant.id, 'product-stats'));
        } catch (error: any) {
            console.error('[Merchant Controller] Sync Error:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to sync products' });
        }
    },

    /**
     * Register webhooks for merchant's Shopify store
     * Registers: orders/create + carts/create + carts/update
     */
    async registerWebhook(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;
            const { webhook_base_url } = req.body;

            if (!merchant.shopify_shop_name || !merchant.shopify_access_token) {
                return res.status(400).json({ error: 'Shopify store not connected.' });
            }

            const apiUrl = `https://${merchant.shopify_shop_name}.myshopify.com/admin/api/2024-04/webhooks.json`;
            const headers = {
                'X-Shopify-Access-Token': merchant.shopify_access_token,
                'Content-Type': 'application/json',
            };

            // Register all webhook topics
            const webhookTopics = [
                { topic: 'orders/create', path: 'orders/create' },
                { topic: 'carts/create', path: 'carts/create' },
                { topic: 'carts/update', path: 'carts/update' },
                { topic: 'checkouts/create', path: 'checkouts/create' },
                { topic: 'checkouts/update', path: 'checkouts/update' },
            ];

            const results = [];
            for (const wh of webhookTopics) {
                try {
                    const response = await axios.post(apiUrl, {
                        webhook: {
                            topic: wh.topic,
                            address: `${webhook_base_url}/api/v1/shopify/webhooks/${wh.path}`,
                            format: 'json'
                        }
                    }, { headers, timeout: 10000 });

                    results.push({ topic: wh.topic, status: 'registered', id: response.data.webhook?.id });
                    console.log(`[Merchant] ✅ Webhook registered: ${wh.topic}`);
                } catch (whErr: any) {
                    // Skip if already registered (422 error)
                    if (whErr.response?.status === 422) {
                        results.push({ topic: wh.topic, status: 'already_registered' });
                        console.log(`[Merchant] ⏩ Webhook already exists: ${wh.topic}`);
                    } else {
                        results.push({ topic: wh.topic, status: 'failed', error: whErr.message });
                        console.error(`[Merchant] ❌ Failed to register: ${wh.topic}`, whErr.response?.data);
                    }
                }
            }

            // Save the order webhook ID (primary)
            const orderWebhook = results.find(r => r.topic === 'orders/create' && r.id);
            if (orderWebhook?.id) {
                await prisma.merchants.update({
                    where: { id: merchant.id },
                    data: { webhook_id: orderWebhook.id.toString() }
                });
            }

            console.log(`[Merchant] Webhooks registered for merchant ${merchant.id}`);

            res.status(200).json({
                message: 'Webhooks registered successfully!',
                webhooks: results,
            });
        } catch (error: any) {
            console.error('[Merchant Controller] Webhook Error:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to register webhooks' });
        }
    },

    /**
     * Disconnect Shopify store
     */
    async disconnectShopify(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;

            await prisma.merchants.update({
                where: { id: merchant.id },
                data: {
                    shopify_shop_name: null,
                    shopify_access_token: null,
                    shopify_api_key: null,
                    shopify_api_secret: null,
                    webhook_id: null,
                }
            });

            res.status(200).json({ message: 'Shopify store disconnected.' });
        } catch (error) {
            console.error('[Merchant Controller] Disconnect Error:', error);
            res.status(500).json({ error: 'Failed to disconnect' });
        }
    },

    /**
 * Update merchant settings (Email templates, Discount range, etc.)
 */
    async updateSettings(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;
            const { email_subject, email_body, discount_min, discount_max, shipping_threshold, progress_bar_active } = req.body;

            const updated = await prisma.merchants.update({
                where: { id: merchant.id },
                data: {
                    email_subject: email_subject !== undefined ? email_subject : merchant.email_subject,
                    email_body: email_body !== undefined ? email_body : merchant.email_body,
                    discount_min: discount_min !== undefined ? Number(discount_min) : undefined,
                    discount_max: discount_max !== undefined ? Number(discount_max) : undefined,
                    shipping_threshold: shipping_threshold !== undefined ? Number(shipping_threshold) : undefined,
                    progress_bar_active: progress_bar_active !== undefined ? Boolean(progress_bar_active) : undefined,
                }
            });

            console.log(`[Merchant] Settings updated for merchant ${merchant.id}`);

            res.status(200).json({
                message: 'Settings updated successfully!',
                merchant: updated
            });
        } catch (error) {
            console.error('[Merchant Controller] Update Settings Error:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    }
};

