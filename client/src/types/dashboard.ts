export interface Campaign {
    id: number
    campaignId: string
    customerEmail: string
    customerName: string
    productName: string
    productImage: string | null
    productCategory: string
    discountPercent: number
    originalPrice: number
    discountedPrice: number
    status: 'active' | 'expired' | 'converted'
    timeRemaining: string | null
    shownAt: string | null
    expiresAt: string | null
    revenue: number
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
    shopifyId?: string
    name: string
    category: string
    price: number
    imageURL?: string
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
