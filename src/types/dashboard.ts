export interface Campaign {
    id: string
    orderId: string
    customerEmail: string
    customerName: string
    productsRecommended: string[]
    messagePreview: string
    status: 'sent' | 'opened' | 'clicked' | 'converted'
    sentAt: Date
    openedAt?: Date
    clickedAt?: Date
    converted: boolean
    revenue?: number
}

export interface Order {
    id: string
    customerName: string
    customerEmail: string
    products: string[]
    amount: number
    orderDate: Date
    upsellStatus: 'scheduled' | 'sent' | 'none'
}

export interface AnalyticsData {
    date: string
    sent: number
    opened: number
    clicked: number
    converted: number
    revenue: number
}

export interface Product {
    id: string
    name: string
    category: string
    price: number
    timesRecommended: number
    conversionRate: number
    revenueGenerated: number
}

export interface KPI {
    label: string
    value: string | number
    change?: string
    trend?: 'up' | 'down' | 'neutral'
}
