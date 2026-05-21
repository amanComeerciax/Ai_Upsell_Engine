const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const IORedis = require('ioredis');

async function main() {
  console.log('--- CHECKING DATABASE ---');
  
  const merchants = await prisma.merchants.findMany();
  console.log(`Total Merchants: ${merchants.length}`);
  merchants.forEach(m => {
    console.log(`- Merchant ID ${m.id}: ${m.business_name || 'No Name'} (${m.shopify_shop_name || 'No Shop connected'})`);
  });

  const orders = await prisma.orders.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log(`\nTotal Orders in DB: ${await prisma.orders.count()}`);
  console.log('Recent 5 Orders:');
  orders.forEach(o => {
    console.log(`- Order ID ${o.id} / Shopify ID ${o.shopify_id}: Amount ${o.total_amount}, Created At: ${o.created_at}`);
  });

  const upsellEvents = await prisma.upsell_events.findMany({
    orderBy: { shown_at: 'desc' },
    take: 5
  });
  console.log(`\nTotal Upsell Events in DB: ${await prisma.upsell_events.count()}`);
  console.log('Recent 5 Upsell Events:');
  upsellEvents.forEach(ue => {
    console.log(`- Event ID ${ue.id}: Order ID ${ue.order_id}, Status: ${ue.status}, Clicked: ${ue.clicked}, Converted: ${ue.converted}`);
  });

  const campaigns = await prisma.campaigns.findMany();
  console.log(`\nTotal Campaigns in DB: ${campaigns.length}`);
  campaigns.forEach(c => {
    console.log(`- Campaign ID ${c.id}: ${c.name}, Trigger Product: ${c.trigger_product_id}, Active: ${c.is_active}`);
  });

  console.log('\n--- CHECKING REDIS ---');
  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  console.log(`Connecting to Redis URL: ${REDIS_URL.substring(0, 30)}...`);
  try {
    const isTLS = REDIS_URL.startsWith('rediss://');
    const redis = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 5000,
      ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
    });
    
    const ping = await redis.ping();
    console.log(`Redis Ping Response: ${ping}`);
    
    // Check queue keys
    const keys = await redis.keys('bullet:*') || await redis.keys('bull:*');
    console.log(`Bull Queue Keys count: ${keys.length}`);
    if (keys.length > 0) {
      console.log('Sample keys:', keys.slice(0, 5));
    }
    redis.disconnect();
  } catch (err) {
    console.error('Redis connection failed:', err.message);
  }
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
