const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Ensure we are using the local prisma client
const prisma = new PrismaClient();

async function main() {
  const merchants = await prisma.merchants.findMany();
  console.log('JSON_START');
  console.log(JSON.stringify(merchants.map(m => ({
      id: m.id,
      business_name: m.business_name,
      clerk_user_id: m.clerk_user_id,
      shopify_shop_name: m.shopify_shop_name,
      shopify_connected: !!m.shopify_shop_name && !!m.shopify_access_token
  })), (key, value) => typeof value === 'bigint' ? value.toString() : value));
  console.log('JSON_END');
}

main()
  .catch(e => {
      console.error('ERROR_START');
      console.error(e);
      console.error('ERROR_END');
      process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
