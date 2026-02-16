import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with premium Shopify-style data...');

    // 1. Create a dummy user (Merchant)
    const user = await prisma.users.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            email: 'merchant@velocity.ai',
            name: 'Aman Commercials',
        },
    });

    // 2. Clear existing entries to avoid duplication (Delete in order to respect constraints)
    await prisma.upsell_events.deleteMany({});
    await prisma.upsell_rules.deleteMany({});
    await prisma.order_items.deleteMany({});
    await prisma.orders.deleteMany({});
    await prisma.products.deleteMany({});

    // 3. Create sample products (Diverse Categories)
    const productsData = [
        // Electronics
        { name: 'iPhone 15 Pro', category: 'Electronics', price: 129900.00 },
        { name: 'MagSafe Leather Wallet', category: 'Accessories', price: 5900.00 },
        { name: 'AirPods Pro Gen 2', category: 'Electronics', price: 24900.00 },
        { name: 'MacBook Air M3 13"', category: 'Electronics', price: 114900.00 },

        // Lifestyle/Fashion
        { name: 'Premium Cotton Hoodie', category: 'Apparel', price: 3499.00 },
        { name: 'Urban Explorer Backpack', category: 'Travel', price: 5999.00 },
        { name: 'Polarized Wayfarer', category: 'Accessories', price: 8900.00 },
        { name: 'Stainless Steel Water Bottle', category: 'Home', price: 1299.00 },

        // Premium Home
        { name: 'Smart Ambient Lamp', category: 'Home Decor', price: 4500.00 },
        { name: 'Ergonomic Mesh Chair', category: 'Office', price: 18500.00 },
        { name: 'Mechanical Keyboard (RGB)', category: 'Gaming', price: 12900.00 },
        { name: 'Noise Cancelling Headphones', category: 'Electronics', price: 29900.00 },
    ];

    const createdProducts = [];
    for (const p of productsData) {
        const product = await prisma.products.create({
            data: {
                name: p.name,
                category: p.category,
                price: p.price,
            }
        });
        createdProducts.push(product);
    }

    // 4. Create Mock Orders to simulate sales history
    console.log('📦 Generating mock orders...');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    for (let i = 0; i < 20; i++) {
        // Random date within the last month
        const orderDate = new Date(oneMonthAgo.getTime() + Math.random() * (new Date().getTime() - oneMonthAgo.getTime()));

        // Pick 1-2 random products
        const numItems = Math.floor(Math.random() * 2) + 1;
        const selectedProducts = [...createdProducts].sort(() => 0.5 - Math.random()).slice(0, numItems);

        const totalAmount = selectedProducts.reduce((sum, p) => sum + Number(p.price || 0), 0);

        const order = await prisma.orders.create({
            data: {
                user_id: user.id,
                total_amount: totalAmount,
                created_at: orderDate,
            }
        });

        for (const product of selectedProducts) {
            await prisma.order_items.create({
                data: {
                    order_id: order.id,
                    product_id: product.id,
                    quantity: 1
                }
            });
        }
    }

    console.log(`✅ Seed complete! Created ${createdProducts.length} products and 20 mock orders.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
