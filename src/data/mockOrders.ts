import { Order } from '@/types/dashboard'

const customerNames = [
    'John Doe', 'Sarah Smith', 'Michael Johnson', 'Emily Brown', 'David Wilson',
    'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Garcia', 'Jessica Rodriguez',
    'James Hernandez', 'Amanda Lopez', 'Christopher Gonzalez', 'Ashley Perez', 'Daniel Lee',
    'Melissa Turner', 'Matthew Hall', 'Kimberly Allen', 'Joshua Young', 'Nicole King',
    'Kevin White', 'Laura Harris', 'Ryan Clark', 'Michelle Lewis', 'Brandon Robinson',
    'Stephanie Walker', 'Kenneth Green', 'Angela Adams', 'Brian Baker', 'Donna Nelson',
]

const products = [
    'Premium Headphones', 'Wireless Mouse', 'Mechanical Keyboard', 'USB-C Hub',
    'Laptop Stand', 'Monitor Arm', 'Webcam HD', 'LED Desk Lamp', 'Ergonomic Chair Cushion',
    'Phone Case Pro', 'Screen Protector', 'Charging Cable', 'Power Bank', 'Bluetooth Speaker',
    'Portable SSD', 'Gaming Mouse Pad', 'HDMI Cable', 'Cable Organizer', 'Laptop Sleeve',
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

function generateOrder(id: number): Order {
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]
    const numProducts = Math.floor(Math.random() * 3) + 1
    const orderProducts = Array.from(
        { length: numProducts },
        () => products[Math.floor(Math.random() * products.length)]
    )

    const upsellStatuses: Order['upsellStatus'][] = ['scheduled', 'sent', 'none']

    return {
        id: `ORD-${String(id).padStart(4, '0')}`,
        customerName,
        customerEmail: generateEmail(customerName),
        products: orderProducts,
        amount: Math.floor(Math.random() * 18000) + 2000, // ₹2000 to ₹20000
        orderDate: generateRandomDate(45),
        upsellStatus: upsellStatuses[Math.floor(Math.random() * upsellStatuses.length)],
    }
}

export const mockOrders: Order[] = Array.from({ length: 35 }, (_, i) => generateOrder(i + 1))
