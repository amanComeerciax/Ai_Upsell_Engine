/**
 * One-time script to sync Shopify product handles & variant IDs into our database
 * Run: node server/scratch/sync_handles.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SHOP = process.env.SHOPIFY_SHOP_NAME;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function main() {
    console.log(`\n🔄 Syncing handles & variant IDs from Shopify: ${SHOP}\n`);

    // 1. Fetch all products from Shopify
    const url = `https://${SHOP}/admin/api/2024-01/products.json?limit=250`;
    const { data } = await axios.get(url, {
        headers: { 'X-Shopify-Access-Token': TOKEN }
    });

    const shopifyProducts = data.products;
    console.log(`📦 Found ${shopifyProducts.length} products on Shopify\n`);

    let updated = 0;
    let skipped = 0;

    for (const sp of shopifyProducts) {
        const shopifyId = BigInt(sp.id);
        const handle = sp.handle;
        const variantId = sp.variants && sp.variants.length > 0 ? BigInt(sp.variants[0].id) : null;

        // Find matching product in our DB
        const existing = await prisma.products.findFirst({
            where: { shopify_id: shopifyId }
        });

        if (!existing) {
            console.log(`  ⏭️  Skip: "${sp.title}" — not in DB (shopify_id: ${sp.id})`);
            skipped++;
            continue;
        }

        // Update handle + variant_id
        await prisma.products.update({
            where: { id: existing.id },
            data: {
                handle: handle,
                shopify_variant_id: variantId,
            }
        });

        const hadHandle = existing.handle ? '✅' : '🔧';
        const hadVariant = existing.shopify_variant_id ? '✅' : '🔧';
        console.log(`  ${hadHandle} handle | ${hadVariant} variant_id → "${sp.title}" (handle: ${handle}, variant: ${variantId})`);
        updated++;
    }

    console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
    console.log(`📊 Total products in Shopify: ${shopifyProducts.length}\n`);

    // Verify: show all products with their handle and variant_id status
    const allProducts = await prisma.products.findMany({
        select: { id: true, name: true, handle: true, shopify_id: true, shopify_variant_id: true }
    });
    
    console.log('─── Verification ───');
    let missing = 0;
    for (const p of allProducts) {
        const status = p.handle && p.shopify_variant_id ? '✅' : '❌';
        if (!p.handle || !p.shopify_variant_id) missing++;
        console.log(`  ${status} ID:${p.id} | handle: ${p.handle || 'NULL'} | variant: ${p.shopify_variant_id || 'NULL'} | "${p.name}"`);
    }
    
    if (missing > 0) {
        console.log(`\n⚠️  ${missing} products still missing handle/variant_id`);
    } else {
        console.log(`\n🎉 All products have valid handle and variant_id!`);
    }
}

main()
    .catch(e => { console.error('❌ Error:', e.message); })
    .finally(() => prisma.$disconnect());
