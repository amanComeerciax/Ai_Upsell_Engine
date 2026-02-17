import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const merchants = await prisma.merchants.findMany();
    console.log('Merchants:', JSON.stringify(merchants, null, 2));
}
main().finally(() => prisma.$disconnect());
