import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_VERSION = '2024-04';

export class ShopifyService {
    private getApiUrl(shopName: string) {
        // Normalize shop name for API calls
        const cleanShop = shopName.includes('.myshopify.com') ? shopName : `${shopName}.myshopify.com`;
        return `https://${cleanShop}/admin/api/${API_VERSION}`;
    }

    async getProducts(shopName: string, accessToken: string) {
        try {
            const response = await axios.get(`${this.getApiUrl(shopName)}/products.json`, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                timeout: 15000
            });
            return response.data.products;
        } catch (error: any) {
            console.error('[Shopify Service] Error fetching products:', error.response?.data || error.message);
            throw new Error('Failed to fetch products from Shopify');
        }
    }

    async createScriptTag(shopName: string, accessToken: string, scriptUrl: string) {
        try {
            // First, check if already exists to prevent duplicates
            const existing = await axios.get(`${this.getApiUrl(shopName)}/script_tags.json`, {
                headers: { 'X-Shopify-Access-Token': accessToken }
            });

            const alreadyRegistered = existing.data.script_tags.find((s: any) => s.src === scriptUrl);
            if (alreadyRegistered) {
                console.log('[Shopify Service] ScriptTag already registered for', shopName);
                return alreadyRegistered;
            }

            console.log('[Shopify Service] Registering ScriptTag for', shopName, 'URL:', scriptUrl);
            const response = await axios.post(`${this.getApiUrl(shopName)}/script_tags.json`, {
                script_tag: {
                    event: 'onload',
                    src: scriptUrl
                }
            }, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                }
            });
            return response.data.script_tag;
        } catch (error: any) {
            console.error('[Shopify Service] Error creating ScriptTag:', error.response?.data || error.message);
            throw new Error('Failed to create Shopify ScriptTag');
        }
    }

    async createOrderWebhook(shopName: string, accessToken: string, address: string) {
        try {
            const response = await axios.post(`${this.getApiUrl(shopName)}/webhooks.json`, {
                webhook: {
                    topic: 'orders/create',
                    address: address,
                    format: 'json'
                }
            }, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                }
            });
            return response.data.webhook;
        } catch (error: any) {
            console.error('[Shopify Service] Error creating webhook:', error.response?.data || error.message);
            throw new Error('Failed to create Shopify webhook');
        }
    }

    async getProductById(shopName: string, accessToken: string, productId: string) {
        try {
            const response = await axios.get(`${this.getApiUrl(shopName)}/products/${productId}.json`, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                }
            });
            return response.data.product;
        } catch (error: any) {
            console.error(`[Shopify Service] Error fetching product ${productId}:`, error.response?.data || error.message);
            return null;
        }
    }
}

export const shopifyService = new ShopifyService();
