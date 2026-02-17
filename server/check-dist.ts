import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const counts = await prisma.products.groupBy({
        by: ['merchant_id'],
        _count: { _all: true }
    });
    console.log('Product counts by merchant:', JSON.stringify(counts, null, 2));
}
main().finally(() => prisma.$disconnect());
