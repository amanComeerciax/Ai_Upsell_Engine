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
  const liveBaseUrl = 'https://ai-upsell-engine.onrender.com';

  console.log(`Registering live webhooks for shop: ${shopName}...`);
  console.log(`Live Base URL: ${liveBaseUrl}`);

  const apiUrl = `https://${shopName}.myshopify.com/admin/api/2024-04/webhooks.json`;
  const headers = {
    'X-Shopify-Access-Token': token,
    'Content-Type': 'application/json',
  };

  const webhookTopics = [
    { topic: 'orders/create', path: 'orders/create' },
    { topic: 'carts/create', path: 'carts/create' },
    { topic: 'carts/update', path: 'carts/update' },
    { topic: 'checkouts/create', path: 'checkouts/create' },
    { topic: 'checkouts/update', path: 'checkouts/update' },
  ];

  for (const wh of webhookTopics) {
    const address = `${liveBaseUrl}/api/v1/shopify/webhooks/${wh.path}`;
    try {
      const response = await axios.post(apiUrl, {
        webhook: {
          topic: wh.topic,
          address: address,
          format: 'json'
        }
      }, { headers });

      console.log(`✅ Registered Topic: ${wh.topic} -> ${address} (ID: ${response.data.webhook.id})`);
    } catch (err) {
      if (err.response?.status === 422) {
        console.log(`⏩ Topic ${wh.topic} already registered for address ${address} (or duplicate limits reached).`);
      } else {
        console.error(`❌ Failed to register ${wh.topic}:`, err.response?.data || err.message);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
