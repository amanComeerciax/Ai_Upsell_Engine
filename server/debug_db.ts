import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const upsells = await prisma.upsell_events.findMany({
        include: {
            users: true,
            abandoned_cart: true
        },
        orderBy: { id: 'desc' },
        take: 10
    });

    console.log(JSON.stringify(upsells.map(u => ({
        id: u.id,
        user: u.users ? u.users.email : null,
        abandoned_cart_email: (u as any).abandoned_cart ? (u as any).abandoned_cart.customer_email : null,
        abandoned_cart_id: u.abandoned_cart_id
    })), null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
