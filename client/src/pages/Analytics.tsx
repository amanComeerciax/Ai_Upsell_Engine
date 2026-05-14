import { useState, useEffect } from 'react'
import { 
    Search, 
    Bell, 
    BarChart3, 
    TrendingUp, 
    Sparkles, 
    Calendar, 
    Filter, 
    ArrowUpRight, 
    ChevronRight, 
    ChevronLeft,
    Zap,
    Target,
    Eye,
    DollarSign,
    Database,
    Clock,
    Loader2
} from 'lucide-react'
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
            <div className="bg-[#0c1220]/95 backdrop-blur-md text-white px-4 py-3 rounded-lg text-xs shadow-xl border border-slate-700/30">
                <p className="text-slate-400 text-[10px] font-medium mb-1.5">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill }} />
                        <span className="text-slate-300">{p.name}:</span>
                        <span className="font-bold">{typeof p.value === 'number' && p.name === 'Revenue' ? `₹${p.value.toLocaleString()}` : p.value}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

const insightIconMap: Record<string, any> = {
    '📊': TrendingUp,
    '🔥': Zap,
    '🎯': Target,
    '💡': Sparkles,
    '🚀': ArrowUpRight,
    '📈': TrendingUp,
    '📉': TrendingUp,
    'visibility': Eye,
    'revenue': DollarSign,
    'potential': Zap,
    'conversion': Target
}

function InsightIcon({ icon, title }: { icon: string, title: string }) {
    const titleLower = title.toLowerCase();
    const Icon = insightIconMap[icon] || 
                 (titleLower.includes('visibility') ? Eye : 
                  titleLower.includes('revenue') ? DollarSign :
                  titleLower.includes('conversion') ? Target :
                  titleLower.includes('potential') ? Zap : Sparkles);
                  
    return (
        <div className="h-12 w-12 rounded-2xl bg-cyan-50/50 dark:bg-cyan-900/20 flex items-center justify-center shrink-0 shadow-sm border border-cyan-100 dark:border-cyan-800/30 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-[#06B6D4]" />
        </div>
    )
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
                        <BarChart3 className="h-4 w-4 text-[#06B6D4]" />
                        <span className="text-xs font-semibold text-[#06B6D4]">Live Analytics</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Deep-dive into your <span className="text-slate-700 font-semibold">upsell performance</span> metrics.
                    </p>
                </div>
                <Tabs value={period} onValueChange={setPeriod} className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <TabsList className="bg-transparent h-9 gap-1">
                        <TabsTrigger value="7" className="text-xs font-semibold px-4 rounded-md data-[state=active]:bg-[#06B6D4] data-[state=active]:text-white data-[state=active]:shadow-sm">7D</TabsTrigger>
                        <TabsTrigger value="30" className="text-xs font-semibold px-4 rounded-md data-[state=active]:bg-[#06B6D4] data-[state=active]:text-white data-[state=active]:shadow-sm">30D</TabsTrigger>
                        <TabsTrigger value="90" className="text-xs font-semibold px-4 rounded-md data-[state=active]:bg-[#06B6D4] data-[state=active]:text-white data-[state=active]:shadow-sm">90D</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* AI Insights Card */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                    <div className="h-9 w-9 rounded-xl bg-[#06B6D4] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Insights</h3>
                        <p className="text-xs text-slate-400 font-medium">Powered by Groq · Auto-refreshes every hour</p>
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
                            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-cyan-200 dark:hover:border-cyan-900/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group">
                                <InsightIcon icon={item.icon} title={item.title} />
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{item.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.insight}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {dataLoading ? (
                <div className="h-48 flex flex-col items-center justify-center gap-4 glass-card">
                    <Loader2 className="h-6 w-6 text-[#06B6D4] animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading analytics data...</p>
                </div>
            ) : (
                <>
                    {/* KPI Metric Cards — modern inline style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <Database className="h-5 w-5 text-[#06B6D4]" />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpis.totalSent?.toLocaleString() ?? '0'}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Total Dispatched</p>
                        </div>
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <Target className="h-5 w-5 text-[#06B6D4]" />
                                </div>
                                {kpis.conversionRate > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">+{kpis.conversionRate}%</span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpis.conversionRate ?? 0}%</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Conversion Rate</p>
                        </div>
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-[#06B6D4]" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{((kpis.totalRevenue || 0) / 1000).toFixed(1)}K</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Gross Revenue</p>
                        </div>
                        <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-[#06B6D4]" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpis.avgResponseHrs != null ? `${kpis.avgResponseHrs} hrs` : 'N/A'}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Avg Response</p>
                        </div>
                    </div>

                    {/* A/B Testing ROI */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-[#06B6D4] rounded-full" />
                            <h2 className="text-lg font-bold text-slate-800">ROI Performance (A/B Test)</h2>
                        </div>
                        <ROIStats />
                    </div>

                    {/* Charts Grid — 8/4 layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                        {/* Conversion Funnel */}
                        <div className="xl:col-span-8 glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Conversion Funnel</h3>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Upsells sent vs converted per day</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-cyan-500" /><span className="text-slate-500 font-medium">Sent</span></div>
                                    <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-slate-500 font-medium">Converted</span></div>
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
                                                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} interval={Math.floor(timeSeries.length / 6)} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area type="monotone" dataKey="sent" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#gSent)" name="Sent"
                                                dot={{ fill: '#06B6D4', strokeWidth: 2, stroke: '#fff', r: 3 }} />
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
                                    <h3 className="text-base font-bold text-slate-900">Revenue</h3>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Per day</p>
                                </div>
                                <Calendar className="h-4 w-4 text-slate-300" />
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
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} interval={Math.floor(timeSeries.length / 6)} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="revenue" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={16} name="Revenue" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1.5 bg-[#06B6D4] rounded-full" />
                            <h2 className="text-lg font-bold text-slate-900">Top Performing Products</h2>
                        </div>
                        <div className="glass-card overflow-hidden p-0">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="text-left py-3 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                                        <th className="text-left py-3 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recommended</th>
                                        <th className="text-left py-3 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Conv. Rate</th>
                                        <th className="text-right py-3 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {topProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">
                                                No upsell data yet — place a test order to see results here
                                            </td>
                                        </tr>
                                    ) : topProducts.map((product: any) => (
                                        <tr key={product.id} className="hover:bg-cyan-50/50 transition-colors group">
                                            <td className="py-3.5 px-6">
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-700 group-hover:text-[#06B6D4] transition-colors">{product.name}</p>
                                                    {product.category && (
                                                        <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-sm font-medium text-slate-500">{product.timesRecommended}×</td>
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(product.conversionRate, 100)}%` }} />
                                                    </div>
                                                    <span className="font-bold text-xs text-emerald-500">{product.conversionRate}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-right font-bold text-sm text-slate-900">
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
