import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.products.count();
    const products = await prisma.products.findMany({
        take: 5,
        select: {
            id: true,
            name: true,
            shopify_id: true,
            merchant_id: true
        }
    });
    console.log('Total Products:', count);
    console.log('Sample Products:', JSON.stringify(products, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
