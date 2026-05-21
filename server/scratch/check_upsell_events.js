const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.upsell_events.findMany({
    orderBy: { id: 'desc' },
    take: 10,
    include: {
      orders: true,
      products: true,
      users: true
    }
  });

  console.log('--- RECENT 10 UPSELL EVENTS ---');
  events.forEach(e => {
    console.log(`Event ID: ${e.id}`);
    console.log(`  Merchant ID: ${e.merchant_id}`);
    console.log(`  User: ${e.users?.email} (${e.users?.name})`);
    console.log(`  Order ID: ${e.order_id} (Shopify Order ID: ${e.orders?.shopify_id})`);
    console.log(`  Recommended Product: ${e.products?.name} (Price: ${e.products?.price})`);
    console.log(`  Discount: ${e.discount_percent}%`);
    console.log(`  Converted: ${e.converted}`);
    console.log(`  Shown At: ${e.shown_at}`);
    console.log(`  Test Group: ${e.test_group}`);
    console.log(`  Event Type: ${e.event_type}`);
    console.log('------------------------------');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
