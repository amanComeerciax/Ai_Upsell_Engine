import { Campaign } from '@/types/dashboard'

const customerNames = [
    'John Doe', 'Sarah Smith', 'Michael Johnson', 'Emily Brown', 'David Wilson',
    'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Garcia', 'Jessica Rodriguez',
    'James Hernandez', 'Amanda Lopez', 'Christopher Gonzalez', 'Ashley Perez', 'Daniel Lee',
    'Melissa Turner', 'Matthew Hall', 'Kimberly Allen', 'Joshua Young', 'Nicole King',
]

const productNames = [
    'Premium Headphones', 'Wireless Mouse', 'Mechanical Keyboard', 'USB-C Hub',
    'Laptop Stand', 'Monitor Arm', 'Webcam HD', 'LED Desk Lamp', 'Ergonomic Chair Cushion',
    'Phone Case Pro', 'Screen Protector', 'Charging Cable', 'Power Bank', 'Bluetooth Speaker',
]

const categories = ['Electronics', 'Accessories', 'Furniture', 'Mobile']

function generateRandomDate(daysAgo: number): string {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
    return date.toISOString()
}

function generateEmail(name: string): string {
    const cleanName = name.toLowerCase().replace(' ', '.')
    return `${cleanName}@example.com`
}

function generateCampaign(id: number): Campaign {
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]
    const productName = productNames[Math.floor(Math.random() * productNames.length)]
    const originalPrice = Math.floor(Math.random() * 5000) + 1000
    const discountPercent = Math.floor(Math.random() * 30) + 5
    const discountedPrice = Math.floor(originalPrice * (1 - discountPercent / 100))
    const randomStatus = (['active', 'expired', 'converted', 'sent', 'opened', 'clicked'] as const)[Math.floor(Math.random() * 6)]
    
    const productsRecommended = Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => productNames[Math.floor(Math.random() * productNames.length)]
    )

    const sentAtStr = generateRandomDate(7)

    return {
        id: `CAMP-${String(id).padStart(4, '0')}`,
        campaignId: `CMP-${String(id).padStart(3, '0')}`,
        orderId: `ORD-${String(id * 2).padStart(4, '0')}`,
        customerEmail: generateEmail(customerName),
        customerName,
        productName,
        productImage: null,
        productCategory: categories[Math.floor(Math.random() * categories.length)],
        discountPercent,
        originalPrice,
        discountedPrice,
        status: (randomStatus === 'sent' || randomStatus === 'opened' || randomStatus === 'clicked') ? 'active' : randomStatus as any,
        timeRemaining: randomStatus === 'active' ? '23h 45m' : null,
        shownAt: sentAtStr,
        expiresAt: generateRandomDate(-1),
        revenue: randomStatus === 'converted' ? discountedPrice : 0,
        productsRecommended,
        messagePreview: `Hi ${customerName.split(' ')[0]}, based on your recent purchase, we think you'll love...`,
        converted: randomStatus === 'converted',
        sentAt: new Date(sentAtStr),
    }
}

export const mockCampaigns: Campaign[] = Array.from({ length: 55 }, (_, i) => generateCampaign(i + 1))
