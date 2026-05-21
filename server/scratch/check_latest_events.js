const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- LATEST 5 UPSELL EVENTS ---');
  const events = await prisma.upsell_events.findMany({
    orderBy: { id: 'desc' },
    take: 5,
    include: {
      products: true,
      users: true,
      orders: true
    }
  });

  events.forEach(e => {
    console.log(`Event ID: ${e.id}`);
    console.log(`- Created At: ${e.created_at}`);
    console.log(`- Customer: ${e.users?.email}`);
    console.log(`- Trigger Order: ${e.orders?.id} (Shopify Order ID: ${e.orders?.shopify_order_id})`);
    console.log(`- Recommended Product: ${e.products?.name}`);
    console.log(`- Discount: ${e.discount_percent}%`);
    console.log(`- Pitch: ${e.pitch}`);
    console.log(`- Converted: ${e.converted}`);
    console.log('-----------------------------');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
