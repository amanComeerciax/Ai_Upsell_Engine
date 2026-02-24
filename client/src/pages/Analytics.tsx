import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Shield, Database, LayoutGrid, Calendar, Sparkles } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { StatCard } from '@/components/dashboard/StatCard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROIStats } from '@/components/ROIStats'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null)
    const [insights, setInsights] = useState<any[]>([])
    const [insightsLoading, setInsightsLoading] = useState(true)
    const [dataLoading, setDataLoading] = useState(true)
    const [period, setPeriod] = useState('30')

    // Fetch time-series + top products (re-fetches on period change)
    useEffect(() => {
        const fetchAnalytics = async () => {
            setDataLoading(true)
            try {
                const res = await apiClient.get(`/analytics/detailed?days=${period}`)
                setData(res.data)
            } catch (error) {
                console.error('Failed to fetch analytics:', error)
            } finally {
                setDataLoading(false)
            }
        }
        fetchAnalytics()
    }, [period])

    // Fetch AI insights once on mount (cached for 1hr on server)
    useEffect(() => {
        const fetchInsights = async () => {
            setInsightsLoading(true)
            try {
                const res = await apiClient.get('/analytics/insights')
                setInsights(res.data.insights || [])
            } catch (error) {
                console.error('Failed to fetch insights:', error)
            } finally {
                setInsightsLoading(false)
            }
        }
        fetchInsights()
    }, [])

    const kpis = data?.kpis || {}
    const timeSeries = data?.timeSeries || []
    const topProducts = data?.topProducts || []

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Telemetry Active</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">Intelligence Suite</h1>
                    <p className="text-muted-foreground mt-1 font-medium underline decoration-blue-500/30 underline-offset-4">
                        Deep-dive metrics across the autonomous upsell infrastructure.
                    </p>
                </div>

                <Tabs value={period} onValueChange={setPeriod} className="bg-foreground/[0.03] p-1 rounded-xl border border-foreground/[0.04]">
                    <TabsList className="bg-transparent h-10 gap-1">
                        <TabsTrigger value="7" className="text-[10px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background">7D</TabsTrigger>
                        <TabsTrigger value="30" className="text-[10px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background">30D</TabsTrigger>
                        <TabsTrigger value="90" className="text-[10px] font-black uppercase tracking-widest px-4 rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background">90D</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* AI Insights Card */}
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <CardHeader className="px-8 py-6 border-b border-blue-500/10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">AI Insights</CardTitle>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Powered by Z.ai GLM · Auto-refreshes every hour</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {insightsLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-start gap-4 animate-pulse">
                                    <div className="h-10 w-10 rounded-xl bg-foreground/[0.05] shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-32 bg-foreground/[0.05] rounded" />
                                        <div className="h-3 w-full bg-foreground/[0.05] rounded" />
                                        <div className="h-3 w-3/4 bg-foreground/[0.05] rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {insights.map((item: any, i: number) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.04] hover:border-blue-500/20 transition-colors">
                                    <div className="text-2xl shrink-0">{item.icon}</div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1">{item.title}</p>
                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.insight}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {dataLoading ? (
                <div className="h-48 flex flex-col items-center justify-center gap-4 border border-foreground/[0.04] rounded-3xl bg-foreground/[0.01]">
                    <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Telemetry...</p>
                </div>
            ) : (
                <>
                    {/* A/B Testing ROI Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-[2px] bg-blue-600" />
                            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">ROI Performance (A/B Test)</h2>
                        </div>
                        <ROIStats />
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Dispatched"
                            value={kpis.totalSent?.toLocaleString() ?? '0'}
                            icon={Database}
                            iconBg="bg-blue-500/10"
                            iconColor="text-blue-500"
                        />
                        <StatCard
                            label="Conversion Rate"
                            value={`${kpis.conversionRate ?? 0}%`}
                            icon={Shield}
                            iconBg="bg-emerald-500/10"
                            iconColor="text-emerald-500"
                        />
                        <StatCard
                            label="Gross Yield"
                            value={`₹${((kpis.totalRevenue || 0) / 1000).toFixed(1)}K`}
                            icon={TrendingUp}
                            iconBg="bg-blue-600/10"
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            label="Avg Response Time"
                            value={kpis.avgResponseHrs != null ? `${kpis.avgResponseHrs} hrs` : 'N/A'}
                            icon={Clock}
                            iconBg="bg-purple-500/10"
                            iconColor="text-purple-500"
                        />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Conversion Funnel */}
                        <Card className="border-foreground/[0.04] bg-foreground/[0.01]">
                            <CardHeader className="px-8 py-6 border-b border-foreground/[0.04]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Conversion Mesh</CardTitle>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Upsells sent vs converted per day</p>
                                    </div>
                                    <LayoutGrid className="h-4 w-4 text-muted-foreground/30" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                {timeSeries.length === 0 ? (
                                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm font-bold">
                                        No upsell data yet for this period
                                    </div>
                                ) : (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={timeSeries}>
                                                <defs>
                                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                                                <XAxis
                                                    dataKey="label"
                                                    stroke="currentColor"
                                                    opacity={0.3}
                                                    fontSize={10}
                                                    fontWeight="black"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    interval={Math.floor(timeSeries.length / 6)}
                                                />
                                                <YAxis hide />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '12px' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                                                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px', fontWeight: 'black' }}
                                                />
                                                <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" name="Sent" />
                                                <Area type="monotone" dataKey="converted" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Converted" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Revenue Over Time */}
                        <Card className="border-foreground/[0.04] bg-foreground/[0.01]">
                            <CardHeader className="px-8 py-6 border-b border-foreground/[0.04]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Revenue Dynamics</CardTitle>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Order revenue per day</p>
                                    </div>
                                    <Calendar className="h-4 w-4 text-muted-foreground/30" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                {timeSeries.length === 0 ? (
                                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm font-bold">
                                        No revenue data yet for this period
                                    </div>
                                ) : (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={timeSeries}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                                                <XAxis
                                                    dataKey="label"
                                                    stroke="currentColor"
                                                    opacity={0.3}
                                                    fontSize={10}
                                                    fontWeight="black"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    interval={Math.floor(timeSeries.length / 6)}
                                                />
                                                <YAxis hide />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '12px' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                                                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px', fontWeight: 'black' }}
                                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                                />
                                                <Bar dataKey="revenue" fill="#3b82f6" opacity={0.8} radius={[4, 4, 4, 4]} barSize={20} name="Revenue" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Products */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-[2px] bg-blue-600" />
                            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Top Performing Entities</h2>
                        </div>
                        <div className="border border-foreground/[0.04] rounded-2xl overflow-hidden bg-foreground/[0.01]">
                            <table className="w-full">
                                <thead className="bg-foreground/[0.02] border-b border-foreground/[0.04]">
                                    <tr>
                                        <th className="text-left py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Product</th>
                                        <th className="text-left py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Recommended</th>
                                        <th className="text-left py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Conv. Rate</th>
                                        <th className="text-right py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-foreground/[0.04]">
                                    {topProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-muted-foreground text-sm font-bold">
                                                No upsell data yet — place a test order to see results here
                                            </td>
                                        </tr>
                                    ) : topProducts.map((product: any) => (
                                        <tr key={product.id} className="hover:bg-foreground/[0.01] transition-colors group">
                                            <td className="py-4 px-8">
                                                <div>
                                                    <p className="font-black text-foreground group-hover:text-blue-500 transition-colors uppercase text-xs">{product.name}</p>
                                                    {product.category && (
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{product.category}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-8 text-sm font-bold text-muted-foreground tracking-tight">
                                                {product.timesRecommended}×
                                            </td>
                                            <td className="py-4 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-16 rounded-full bg-foreground/[0.05] overflow-hidden">
                                                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(product.conversionRate, 100)}%` }} />
                                                    </div>
                                                    <span className="font-black text-[11px] text-emerald-500">{product.conversionRate}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-8 text-right font-black text-foreground">
                                                ₹{product.revenueGenerated.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
