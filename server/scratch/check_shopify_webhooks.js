const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

async function main() {
  const merchant = await prisma.merchants.findUnique({
    where: { id: 1 }
  });

  if (!merchant || !merchant.shopify_shop_name || !merchant.shopify_access_token) {
    console.error('Merchant 1 or Shopify credentials not found.');
    return;
  }

  const shopName = merchant.shopify_shop_name;
  const token = merchant.shopify_access_token;
  console.log(`Querying webhooks for shop: ${shopName}...`);

  const apiUrl = `https://${shopName}.myshopify.com/admin/api/2024-04/webhooks.json`;
  try {
    const res = await axios.get(apiUrl, {
      headers: { 'X-Shopify-Access-Token': token }
    });

    console.log('\n--- ACTIVE WEBHOOKS IN SHOPIFY ---');
    if (res.data.webhooks.length === 0) {
      console.log('No webhooks registered.');
    } else {
      res.data.webhooks.forEach(wh => {
        console.log(`Topic: ${wh.topic}`);
        console.log(`  ID: ${wh.id}`);
        console.log(`  Address: ${wh.address}`);
        console.log(`  Format: ${wh.format}`);
        console.log('----------------------------------');
      });
    }
  } catch (err) {
    console.error('Failed to fetch webhooks:', err.response?.data || err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
