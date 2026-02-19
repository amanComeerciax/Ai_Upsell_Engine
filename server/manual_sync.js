const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const https = require('https');
const prisma = new PrismaClient();

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const shopName = process.env.SHOPIFY_SHOP_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function manualSync() {
    console.log('Starting manual sync...');
    const url = `https://${shopName}/admin/api/2024-04/products.json?limit=250`;

    try {
        const response = await axios.get(url, {
            headers: { 'X-Shopify-Access-Token': accessToken },
            httpsAgent
        });

        const products = response.data.products;
        console.log(`Fetched ${products.length} products`);

        for (const sp of products) {
            await prisma.products.upsert({
                where: { shopify_id: BigInt(sp.id) },
                update: {
                    handle: sp.handle,
                    name: sp.title,
                    shopify_variant_id: sp.variants?.[0]?.id ? BigInt(sp.variants[0].id) : null,
                    description: sp.body_html
                },
                create: {
                    shopify_id: BigInt(sp.id),
                    name: sp.title,
                    handle: sp.handle,
                    shopify_variant_id: sp.variants?.[0]?.id ? BigInt(sp.variants[0].id) : null,
                    description: sp.body_html
                }
            });
            console.log(`Updated ${sp.title} -> ${sp.handle}`);
        }
        console.log('Sync complete!');
    } catch (e) {
        console.error('Sync failed:', e.response?.data || e.message);
    } finally {
        await prisma.$disconnect();
    }
}

manualSync();
