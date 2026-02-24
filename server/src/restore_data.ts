import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    const shopName = process.env.SHOPIFY_SHOP_NAME;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopName || !accessToken) {
        console.error('❌ SHOPIFY_SHOP_NAME or SHOPIFY_ACCESS_TOKEN missing in .env');
        return;
    }

    console.log(`🛠️ Restoring data for shop: ${shopName}`);

    // 1. Update/Create Merchant
    const merchant = await prisma.merchants.upsert({
        where: { id: 1 },
        update: {
            shopify_shop_name: shopName.replace('.myshopify.com', ''),
            shopify_access_token: accessToken,
            is_active: true
        },
        create: {
            id: 1,
            clerk_user_id: 'default_user',
            shopify_shop_name: shopName.replace('.myshopify.com', ''),
            shopify_access_token: accessToken,
            is_active: true
        }
    });

    console.log(`✅ Merchant restored: ID ${merchant.id}`);

    // 2. Sync Products
    console.log('🔄 Syncing products from Shopify...');
    const cleanShop = shopName.includes('.myshopify.com') ? shopName : `${shopName}.myshopify.com`;
    const response = await axios.get(`https://${cleanShop}/admin/api/2024-04/products.json?limit=50`, {
        headers: { 'X-Shopify-Access-Token': accessToken }
    });

    const products = response.data.products || [];
    console.log(`📦 Found ${products.length} products. Saving to DB...`);

    for (const p of products) {
        await prisma.products.upsert({
            where: { shopify_id: BigInt(p.id) },
            update: {
                name: p.title,
                handle: p.handle,
                category: p.product_type || 'General',
                price: p.variants?.[0]?.price || 0,
                image_url: p.image?.src || null,
                merchant_id: merchant.id
            },
            create: {
                shopify_id: BigInt(p.id),
                name: p.title,
                handle: p.handle,
                category: p.product_type || 'General',
                price: p.variants?.[0]?.price || 0,
                image_url: p.image?.src || null,
                merchant_id: merchant.id
            }
        });
    }

    console.log('🚀 Data restoration complete. AI Recommendation engine should be operational.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
