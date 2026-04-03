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
    const status = (['active', 'expired', 'converted'] as const)[Math.floor(Math.random() * 3)]
    
    return {
        id,
        campaignId: `CAMP-${String(id).padStart(4, '0')}`,
        customerEmail: generateEmail(customerName),
        customerName,
        productName,
        productImage: null, // No real images yet
        productCategory: categories[Math.floor(Math.random() * categories.length)],
        discountPercent,
        originalPrice,
        discountedPrice,
        status,
        timeRemaining: status === 'active' ? '23h 45m' : null,
        shownAt: generateRandomDate(7),
        expiresAt: generateRandomDate(-1), // Expires in the future or past depending on status
        revenue: status === 'converted' ? discountedPrice : 0,
    }
}

export const mockCampaigns: Campaign[] = Array.from({ length: 55 }, (_, i) => generateCampaign(i + 1))
