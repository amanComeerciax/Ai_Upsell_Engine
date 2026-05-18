const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const products = await prisma.products.findMany({ where: { merchant_id: 1 } });
    console.log(`Merchant 1 has ${products.length} products.`);
    products.forEach(p => console.log(` - ${p.name} (Shopify ID: ${p.shopify_id})`));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
