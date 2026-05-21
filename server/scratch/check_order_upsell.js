const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.orders.findFirst({
    where: { shopify_id: BigInt('6532877287484') },
    include: {
      upsell_events: {
        include: {
          products: true,
          users: true
        }
      },
      users: true
    }
  });

  if (!order) {
    console.log('❌ Order 6532877287484 not found in database!');
    return;
  }

  console.log('Order Found:');
  console.log(`- ID: ${order.id}`);
  console.log(`- Shopify ID: ${order.shopify_id}`);
  console.log(`- Amount: ${order.total_amount}`);
  console.log(`- User: ${order.users?.email} (${order.users?.name})`);
  console.log(`- Upsell Events Count: ${order.upsell_events.length}`);
  
  order.upsell_events.forEach(e => {
    console.log(`\nUpsell Event ID: ${e.id}`);
    console.log(`  Recommended Product: ${e.products?.name} (ID: ${e.products?.id})`);
    console.log(`  Discount: ${e.discount_percent}%`);
    console.log(`  Pitch: ${e.pitch}`);
    console.log(`  Shown At: ${e.shown_at}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
