import { Campaign } from '@/types/dashboard'

const statuses: Campaign['status'][] = ['sent', 'opened', 'clicked', 'converted']
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

function generateRandomDate(daysAgo: number): Date {
    const date = new Date()
    date.setDate(date.getDate() - Math.random() * daysAgo)
    return date
}

function generateEmail(name: string): string {
    const cleanName = name.toLowerCase().replace(' ', '.')
    return `${cleanName}@example.com`
}

function generateCampaign(id: number): Campaign {
    const sentAt = generateRandomDate(30)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]

    const productsRecommended = Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => productNames[Math.floor(Math.random() * productNames.length)]
    )

    const campaign: Campaign = {
        id: `CAMP-${String(id).padStart(4, '0')}`,
        campaignId: `CMP-${String(id).padStart(3, '0')}`, // Added missing field
        orderId: `ORD-${String(id * 2).padStart(4, '0')}`,
        customerEmail: generateEmail(customerName),
        customerName,
        productName: productsRecommended[0], // Added missing field (using first recommendation)
        productsRecommended,
        messagePreview: `Hi ${customerName.split(' ')[0]}, based on your recent purchase, we think you'll love...`,
        status: (status === 'sent' || status === 'opened' || status === 'clicked') ? 'active' : status as any, // Map to UI status
        sentAt,
        converted: status === 'converted',
    }

    if (status === 'opened' || status === 'clicked' || status === 'converted') {
        campaign.openedAt = new Date(sentAt.getTime() + Math.random() * 86400000) // Within 24h
    }

    if (status === 'clicked' || status === 'converted') {
        campaign.clickedAt = new Date((campaign.openedAt?.getTime() || sentAt.getTime()) + Math.random() * 3600000) // Within 1h
    }

    if (status === 'converted') {
        campaign.revenue = Math.floor(Math.random() * 4500) + 500 // ₹500 to ₹5000
    }

    return campaign
}

export const mockCampaigns: Campaign[] = Array.from({ length: 55 }, (_, i) => generateCampaign(i + 1))
