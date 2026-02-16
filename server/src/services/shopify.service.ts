import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_VERSION = '2024-04';

export class ShopifyService {
    private baseUrl: string;

    constructor() {
        const shopName = process.env.SHOPIFY_SHOP_NAME;
        const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

        console.log('[Shopify Service] Initializing with Shop:', shopName);
        if (!shopName || !accessToken) {
            console.error('[Shopify Service] CRITICAL: Shopify credentials missing in .env');
        }

        this.baseUrl = `https://${shopName}/admin/api/${API_VERSION}`;
    }

    async getProducts() {
        try {
            const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
            const response = await axios.get(`${this.baseUrl}/products.json`, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10s timeout
            });
            return response.data.products;
        } catch (error: any) {
            console.error('[Shopify Service] Error fetching products:', error.response?.data || error.message);
            throw new Error('Failed to fetch products from Shopify');
        }
    }

    async getWebhooks() {
        try {
            const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
            const response = await axios.get(`${this.baseUrl}/webhooks.json`, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                },
                timeout: 7000
            });
            return response.data.webhooks;
        } catch (error: any) {
            console.error('[Shopify Service] Error fetching webhooks:', error.response?.data || error.message);
            throw new Error('Failed to fetch webhooks from Shopify');
        }
    }

    async createOrderWebhook(address: string) {
        try {
            const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
            const response = await axios.post(`${this.baseUrl}/webhooks.json`, {
                webhook: {
                    topic: 'orders/create',
                    address: address,
                    format: 'json'
                }
            }, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                timeout: 7000
            });
            return response.data.webhook;
        } catch (error: any) {
            console.error('[Shopify Service] Error creating webhook:', error.response?.data || error.message);
            throw new Error('Failed to create Shopify webhook');
        }
    }
}

export const shopifyService = new ShopifyService();
