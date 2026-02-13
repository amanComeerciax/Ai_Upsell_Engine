import { AnalyticsData } from '@/types/dashboard'

function generateDayData(daysAgo: number): AnalyticsData {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    const sent = Math.floor(Math.random() * 50) + 30
    const opened = Math.floor(sent * (Math.random() * 0.3 + 0.5)) // 50-80% open rate
    const clicked = Math.floor(opened * (Math.random() * 0.3 + 0.3)) // 30-60% click rate
    const converted = Math.floor(clicked * (Math.random() * 0.25 + 0.15)) // 15-40% conversion rate
    const revenue = converted * (Math.random() * 3000 + 1000) // ₹1000-₹4000 per conversion

    return {
        date: date.toISOString().split('T')[0],
        sent,
        opened,
        clicked,
        converted,
        revenue: Math.floor(revenue),
    }
}

// Last 30 days of data
export const mockAnalytics: AnalyticsData[] = Array.from({ length: 30 }, (_, i) =>
    generateDayData(29 - i)
)

// Last 7 days specifically
export const last7DaysAnalytics = mockAnalytics.slice(-7)

// Aggregated stats
export const aggregatedStats = {
    totalSent: mockAnalytics.reduce((sum, day) => sum + day.sent, 0),
    totalOpened: mockAnalytics.reduce((sum, day) => sum + day.opened, 0),
    totalClicked: mockAnalytics.reduce((sum, day) => sum + day.clicked, 0),
    totalConverted: mockAnalytics.reduce((sum, day) => sum + day.converted, 0),
    totalRevenue: mockAnalytics.reduce((sum, day) => sum + day.revenue, 0),
}

// Calculate rates
export const conversionRates = {
    openRate: ((aggregatedStats.totalOpened / aggregatedStats.totalSent) * 100).toFixed(1),
    clickRate: ((aggregatedStats.totalClicked / aggregatedStats.totalOpened) * 100).toFixed(1),
    conversionRate: ((aggregatedStats.totalConverted / aggregatedStats.totalClicked) * 100).toFixed(1),
    overallConversionRate: ((aggregatedStats.totalConverted / aggregatedStats.totalSent) * 100).toFixed(1),
}
