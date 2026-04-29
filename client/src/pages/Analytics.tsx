import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Database, Calendar, Sparkles, Loader2, ArrowUpRight, Eye, Target } from 'lucide-react'
import apiClient, { getCached } from '@/lib/api-client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

// Dark rounded tooltips
const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white px-4 py-3 rounded-xl text-xs shadow-xl border border-gray-700/50">
                <p className="text-gray-400 text-[10px] font-medium mb-1.5">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill }} />
                        <span className="text-gray-300">{p.name}:</span>
                        <span className="font-bold">{typeof p.value === 'number' && p.name === 'Revenue' ? `₹${p.value.toLocaleString()}` : p.value}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null)
    const [insights, setInsights] = useState<any[]>([])
    const [insightsLoading, setInsightsLoading] = useState(true)
    const [dataLoading, setDataLoading] = useState(true)
    const [period, setPeriod] = useState('30')

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Check cache first
                const cached = await getCached(`/analytics/detailed?days=${period}`, 60000).catch(() => null);
                if (cached) {
                    setData(cached);
                    setDataLoading(false);
                } else {
                    setDataLoading(true);
                }

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

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                // Check cache first
                const cached = await getCached('/analytics/insights', 300000).catch(() => null);
                if (cached) {
                    setInsights(cached.insights || []);
                    setInsightsLoading(false);
                } else {
                    setInsightsLoading(true);
                }

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
        <div className="space-y-5 animate-fade-in pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <BarChart3 className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-semibold text-violet-500">Live Analytics</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        Deep-dive into your <span className="text-gray-700 font-semibold">upsell performance</span> metrics.
                    </p>
                </div>
                <Tabs value={period} onValueChange={setPeriod} className="bg-white/80 p-1 rounded-xl border border-gray-200 shadow-sm">
                    <TabsList className="bg-transparent h-9 gap-1">
                        <TabsTrigger value="7" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm">7D</TabsTrigger>
                        <TabsTrigger value="30" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm">30D</TabsTrigger>
                        <TabsTrigger value="90" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm">90D</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* AI Insights Card */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800">AI Insights</h3>
                        <p className="text-xs text-gray-400 font-medium">Powered by Groq · Auto-refreshes every hour</p>
                    </div>
                </div>
                {insightsLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-start gap-4 animate-pulse">
                                <div className="h-10 w-10 rounded-xl bg-gray-100 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 bg-gray-100 rounded" />
                                    <div className="h-3 w-full bg-gray-100 rounded" />
                                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {insights.map((item: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-50/80 to-indigo-50/50 border border-violet-100/50 hover:border-violet-200 hover:shadow-md transition-all">
                                <div className="text-2xl shrink-0">{item.icon}</div>
                                <div>
                                    <p className="text-xs font-bold text-violet-600 mb-1">{item.title}</p>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.insight}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {dataLoading ? (
                <div className="h-48 flex flex-col items-center justify-center gap-4 glass-card">
                    <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                    <p className="text-xs font-medium text-gray-400">Loading analytics data...</p>
                </div>
            ) : (
                <>
                    {/* KPI Metric Cards — modern inline style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-violet-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center">
                                    <Database className="h-5 w-5 text-violet-500" />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-2xl font-bold text-gray-800 tracking-tight">{kpis.totalSent?.toLocaleString() ?? '0'}</p>
                            <p className="text-xs font-medium text-gray-400 mt-1">Total Dispatched</p>
                        </div>
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center">
                                    <Target className="h-5 w-5 text-emerald-500" />
                                </div>
                                {kpis.conversionRate > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">+{kpis.conversionRate}%</span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-800 tracking-tight">{kpis.conversionRate ?? 0}%</p>
                            <p className="text-xs font-medium text-gray-400 mt-1">Conversion Rate</p>
                        </div>
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-purple-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800 tracking-tight">₹{((kpis.totalRevenue || 0) / 1000).toFixed(1)}K</p>
                            <p className="text-xs font-medium text-gray-400 mt-1">Gross Revenue</p>
                        </div>
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-amber-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800 tracking-tight">{kpis.avgResponseHrs != null ? `${kpis.avgResponseHrs} hrs` : 'N/A'}</p>
                            <p className="text-xs font-medium text-gray-400 mt-1">Avg Response</p>
                        </div>
                    </div>

                    {/* A/B Testing ROI */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full" />
                            <h2 className="text-lg font-bold text-gray-800">ROI Performance (A/B Test)</h2>
                        </div>
                        <ROIStats />
                    </div>

                    {/* Charts Grid — 8/4 layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                        {/* Conversion Funnel */}
                        <div className="xl:col-span-8 glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="text-base font-bold text-gray-800">Conversion Funnel</h3>
                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Upsells sent vs converted per day</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-violet-500" /><span className="text-gray-500 font-medium">Sent</span></div>
                                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-gray-500 font-medium">Converted</span></div>
                                </div>
                            </div>
                            {timeSeries.length === 0 ? (
                                <div className="h-[280px] flex flex-col items-center justify-center text-center">
                                    <Eye className="h-6 w-6 text-gray-300 mb-2" />
                                    <p className="text-gray-400 text-sm font-medium">No upsell data yet for this period</p>
                                </div>
                            ) : (
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={timeSeries}>
                                            <defs>
                                                <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }} interval={Math.floor(timeSeries.length / 6)} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area type="monotone" dataKey="sent" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#gSent)" name="Sent"
                                                dot={{ fill: '#7C3AED', strokeWidth: 2, stroke: '#fff', r: 3 }} />
                                            <Area type="monotone" dataKey="converted" stroke="#10B981" fill="#10B981" fillOpacity={0.08} strokeWidth={2} name="Converted"
                                                dot={{ fill: '#10B981', strokeWidth: 2, stroke: '#fff', r: 3 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Revenue Over Time */}
                        <div className="xl:col-span-4 glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="text-base font-bold text-gray-800">Revenue</h3>
                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Per day</p>
                                </div>
                                <Calendar className="h-4 w-4 text-gray-300" />
                            </div>
                            {timeSeries.length === 0 ? (
                                <div className="h-[280px] flex flex-col items-center justify-center text-center">
                                    <TrendingUp className="h-6 w-6 text-gray-300 mb-2" />
                                    <p className="text-gray-400 text-sm font-medium">No revenue data yet</p>
                                </div>
                            ) : (
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={timeSeries}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }} interval={Math.floor(timeSeries.length / 6)} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={16} name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full" />
                            <h2 className="text-lg font-bold text-gray-800">Top Performing Products</h2>
                        </div>
                        <div className="glass-card overflow-hidden p-0">
                            <table className="w-full">
                                <thead className="bg-gray-50/80 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                                        <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Recommended</th>
                                        <th className="text-left py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Conv. Rate</th>
                                        <th className="text-right py-3 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {topProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-400 text-sm font-medium">
                                                No upsell data yet — place a test order to see results here
                                            </td>
                                        </tr>
                                    ) : topProducts.map((product: any) => (
                                        <tr key={product.id} className="hover:bg-violet-50/30 transition-colors group">
                                            <td className="py-3.5 px-6">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-700 group-hover:text-violet-600 transition-colors">{product.name}</p>
                                                    {product.category && (
                                                        <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-sm font-medium text-gray-500">{product.timesRecommended}×</td>
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(product.conversionRate, 100)}%` }} />
                                                    </div>
                                                    <span className="font-bold text-xs text-emerald-500">{product.conversionRate}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-right font-bold text-sm text-gray-700">
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
