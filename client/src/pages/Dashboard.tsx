import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import {
    ShoppingBag, Package, Download, ChevronDown,
    MoreHorizontal, TrendingUp, ArrowUpRight, ArrowDownRight,
    Sparkles, Eye, MousePointerClick, Target, Activity,
    ExternalLink, Cpu, DollarSign, Users, ShoppingCart,
} from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import apiClient, { getCached } from '@/lib/api-client'


// Fallback chart data
const salesChartData = [
    { time: '10am', value: 30 },
    { time: '11am', value: 25 },
    { time: '12am', value: 35 },
    { time: '01pm', value: 30 },
    { time: '02pm', value: 45 },
    { time: '03pm', value: 42 },
    { time: '04pm', value: 55 },
    { time: '05pm', value: 40 },
    { time: '06pm', value: 48 },
    { time: '07pm', value: 55 },
]

const donutData = [
    { name: 'Converted', value: 45, color: '#06B6D4' },
    { name: 'Active', value: 35, color: '#22D3EE' },
    { name: 'Expired', value: 20, color: '#94A3B8' },
]

const analyticsBarData = [
    { day: 'Sun', upsells: 45, orders: 30 },
    { day: 'Mon', upsells: 75, orders: 55 },
    { day: 'Tue', upsells: 60, orders: 40 },
    { day: 'Wed', upsells: 55, orders: 42 },
    { day: 'Thu', upsells: 85, orders: 65 },
    { day: 'Fri', upsells: 70, orders: 50 },
    { day: 'Sat', upsells: 62, orders: 48 },
]

const recentOrders = [
    { id: '#9812567', product: 'Air Vapomax', status: 'complete', price: '$22.78', img: <Package className="h-4 w-4" /> },
    { id: '#9812411', product: 'Canon EOS 1500D', status: 'pending', price: '$122.8', img: <Package className="h-4 w-4" /> },
    { id: '#9812556', product: 'MI Backpack Black', status: 'cancelled', price: '$15.99', img: <Package className="h-4 w-4" /> },
    { id: '#9812619', product: 'iPhone 12 128GB', status: 'complete', price: '$4022', img: <Package className="h-4 w-4" /> },
]

// Mini sparkline component for stat cards
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const w = 80
    const h = 32
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
    return (
        <svg width={w} height={h} className="opacity-60 group-hover:opacity-100 transition-opacity">
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
    )
}

// Custom tooltip for area chart
const SalesTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0c1220]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xl border border-slate-700/30">
                <p className="text-slate-400 text-[10px] font-medium mb-0.5">Revenue</p>
                <p className="text-white font-bold text-sm">₹{payload[0].value.toLocaleString()}</p>
            </div>
        )
    }
    return null
}

const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0c1220]/95 backdrop-blur-md text-white px-4 py-3 rounded-lg text-xs shadow-xl border border-slate-700/30">
                <p className="text-slate-400 text-[10px] font-medium mb-1.5">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-500" />
                        <span className="text-slate-300">Upsells:</span>
                        <span className="font-bold">{payload[0]?.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-300" />
                        <span className="text-slate-300">Orders:</span>
                        <span className="font-bold">{payload[1]?.value}</span>
                    </div>
                </div>
            </div>
        )
    }
    return null
}

function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse bg-gray-100 rounded-xl", className)} />
}

function DashboardSkeleton() {
    return (
        <div className="space-y-5 animate-fade-in pb-8">
            <div className="flex items-center gap-3 justify-end">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-10 w-10" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className="xl:col-span-8 glass-card p-6 h-[380px]">
                    <Skeleton className="h-6 w-48 mb-6" />
                    <Skeleton className="h-[280px] w-full" />
                </div>
                <div className="xl:col-span-4 space-y-5">
                    <div className="glass-card p-5 h-[160px]">
                        <Skeleton className="h-5 w-32 mb-4" />
                        <div className="flex gap-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex-1 space-y-4 py-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="glass-card p-4 h-[80px]"><Skeleton className="h-full w-full" /></div>)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const navigate = useNavigate()

    const [stats, setStats] = useState<any>(null)
    const [upsells, setUpsells] = useState<any[]>([])
    const [loading, setLoading] = useState(true)


    const fetchDashboardData = async () => {
        try {
            // Use getCached which returns data immediately from cache 
            // OR fetches it fresh if expired. 
            const [cachedStats, cachedUpsells] = await Promise.all([
                getCached('/analytics/stats', 60000).catch(() => null),
                getCached('/upsells', 60000).catch(() => ({ data: [] }))
            ]);

            if (cachedStats) {
                setStats(cachedStats);
                setUpsells(Array.isArray(cachedUpsells) ? cachedUpsells.slice(0, 5) : []);
                setLoading(false);
            } else {
                // If not even in cache, we show skeleton and fetch directly
                setLoading(true);
                const [statsRes, upsellsRes] = await Promise.all([
                    apiClient.get('/analytics/stats'),
                    apiClient.get('/upsells').catch(() => ({ data: [] })),
                ]);
                setStats(statsRes.data);
                setUpsells(upsellsRes.data?.slice?.(0, 5) || []);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => { 
        fetchDashboardData(); 
        
        // Handle payment redirects
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            toast.success('Subscription active! Welcome to Velocity Pro.', {
                duration: 5000,
            });
            // Clean up URL
            window.history.replaceState({}, '', '/dashboard');
        } else if (params.get('payment') === 'cancel') {
            toast.error('Checkout cancelled.');
            window.history.replaceState({}, '', '/dashboard');
        }
    }, []);

    const handleExport = () => {
        if (!stats?.recentOrders?.length) { alert("No data to export"); return; }
        const headers = ["Order ID", "Customer", "Status", "Amount", "Date"];
        const rows = stats.recentOrders.map((o: any) => [o.id, o.customerEmail, o.status, o.totalAmount, new Date(o.createdAt).toLocaleDateString()]);
        const csv = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
        link.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const chartData = useMemo(() => stats?.trajectory?.map((d: any) => ({ time: d.day, value: d.revenue })) || salesChartData, [stats?.trajectory]);

    const apiOrders = useMemo(() => stats?.recentOrders?.slice(0, 4).map((o: any) => ({
        id: `#${o.id?.toString().slice(-7) || '0000000'}`,
        product: o.customerEmail || 'Product',
        status: o.status || 'pending',
        price: `₹${o.totalAmount?.toLocaleString() || '0'}`,
        img: '📦',
    })) || recentOrders, [stats?.recentOrders]);

    const { convRates, activityFeed, sparkData } = useMemo(() => ({
        convRates: stats?.conversionRates || {},
        activityFeed: stats?.activityFeed || [],
        sparkData: (stats?.trajectory?.map((d: any) => d.revenue) || chartData.map((d: any) => d.value))
    }), [stats, chartData]);

    if (loading && !stats) {
        return <DashboardSkeleton />
    }

    return (
        <div className="space-y-5 animate-fade-in pb-8">
            {/* ──── Top Bar: Actions ──── */}
            <div className="flex items-center gap-3 justify-end">
                {/* 
                <Button onClick={handleSimulateOrder} disabled={simulating || !merchant?.shopify_connected}
                    className="h-9 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] disabled:bg-[#06B6D4] disabled:opacity-100 text-white text-xs font-bold px-5 shadow-lg shadow-cyan-500/30 transition-all disabled:cursor-not-allowed">
                    {simulating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Zap className="h-3.5 w-3.5 mr-2" />}
                    Simulate Order
                </Button>
                */}
                <Button onClick={handleExport} variant="outline" className="h-9 rounded-lg border-slate-200 bg-white text-xs font-semibold px-5 text-slate-600 hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5 mr-2" /> Export
                </Button>
            </div>

            {/* ──── ROW 1: 4 Stat Cards with Sparklines (no height mismatch) ──── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-[#06B6D4]" />
                        </div>
                        <MiniSparkline data={sparkData.length ? sparkData : [10, 20, 15, 30, 25, 35]} color="#06B6D4" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{(stats?.counts?.totalRevenue || 0).toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-slate-400">Total Revenue</p>
                        <div className="flex items-center gap-0.5 text-emerald-500">
                            <ArrowUpRight className="h-3 w-3" />
                            <span className="text-[10px] font-bold">+12.5%</span>
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-[#06B6D4]" />
                        </div>
                        <MiniSparkline data={[20, 35, 28, 40, 45, 38, 50]} color="#06B6D4" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats?.counts?.totalOrders || 0}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-slate-400">Total Orders</p>
                        <div className="flex items-center gap-0.5 text-emerald-500">
                            <ArrowUpRight className="h-3 w-3" />
                            <span className="text-[10px] font-bold">+8.3%</span>
                        </div>
                    </div>
                </div>

                {/* AI Upsell Events (Insights Card - High Impact) */}
                <div className="bg-[#06B6D4] p-5 rounded-lg group cursor-pointer shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1 text-[#06B6D4] bg-white px-2 py-0.5 rounded-md">
                            <Activity className="h-3 w-3" /><span className="text-[10px] font-black">LIVE</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">{stats?.counts?.totalUpsellEvents || 0}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-white/80">AI Upsells Triggered</p>
                        <span className="text-[10px] font-bold text-white">{convRates.conversionRate || '0'}% CVR</span>
                    </div>
                </div>

                {/* Products Synced */}
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <Package className="h-5 w-5 text-[#06B6D4]" />
                        </div>
                        <MiniSparkline data={[15, 22, 18, 25, 30, 28, 32]} color="#06B6D4" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats?.counts?.totalProducts || 0}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-slate-400">Products Synced</p>
                        <div className="flex items-center gap-0.5 text-emerald-500">
                            <ArrowUpRight className="h-3 w-3" />
                            <span className="text-[10px] font-bold">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ──── ROW 2: Revenue Chart (8) + Donut + Bar (4) ──── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                {/* Revenue Line Chart */}
                <div className="xl:col-span-8 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Revenue Overview</h3>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">Last 7 days trajectory</p>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            Weekly <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                                        <stop offset="50%" stopColor="#22D3EE" stopOpacity={0.08} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} dx={-10} />
                                <Tooltip content={<SalesTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)"
                                    dot={{ fill: '#06B6D4', strokeWidth: 2, stroke: '#fff', r: 4 }}
                                    activeDot={{ fill: '#06B6D4', strokeWidth: 3, stroke: '#fff', r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Donut + Summary */}
                <div className="xl:col-span-4 space-y-5">
                    {/* Upsell Funnel Donut */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-800">Upsell Funnel</h3>
                            <button className="text-gray-300 hover:text-gray-500 transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <PieChart width={120} height={120}>
                                    <Pie data={donutData} cx={60} cy={60} innerRadius={38} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                        {donutData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                    </Pie>
                                </PieChart>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">{convRates.conversionRate || '0'}%</span>
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                {donutData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[11px] font-medium text-gray-500">{item.name}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-700">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upsell Metrics Mini Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">Impressions</span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">{convRates.impressedCount || 0}</p>
                            <p className="text-[10px] text-blue-500 font-medium mt-0.5">{convRates.openRate || 0}% rate</p>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MousePointerClick className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">CTR</span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">{convRates.clickRate || '0.0'}%</p>
                            <p className="text-[10px] text-amber-500 font-medium mt-0.5">Click-through</p>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">CVR</span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">{convRates.conversionRate || '0.0'}%</p>
                            <p className="text-[10px] text-emerald-500 font-medium mt-0.5">Conversion</p>
                        </div>
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ShoppingBag className="h-3.5 w-3.5 text-rose-500" />
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">Abandoned</span>
                            </div>
                            <p className="text-lg font-bold text-gray-800">{stats?.abandonedCarts?.totalAbandoned || 0}</p>
                            <p className="text-[10px] text-rose-500 font-medium mt-0.5">{stats?.abandonedCarts?.recovered || 0} recovered</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ──── ROW 3: Analytics Bar Chart (8) + Quick Actions (4) ──── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <div className="xl:col-span-8 glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Upsell vs Orders</h3>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium">Weekly comparison</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-cyan-500" /><span className="text-slate-500 font-medium">Upsells</span></div>
                            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-cyan-200" /><span className="text-slate-500 font-medium">Orders</span></div>
                        </div>
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsBarData} barGap={3} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} />
                                <Tooltip cursor={{ fill: 'rgba(6, 182, 212, 0.04)' }} content={<BarTooltip />} />
                                <Bar dataKey="upsells" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="orders" fill="#A5F3FC" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions + AI Activity */}
                <div className="xl:col-span-4 glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-4 w-4 text-[#06B6D4]" />
                        <h3 className="text-sm font-bold text-slate-900">AI Activity Feed</h3>
                    </div>
                    {activityFeed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Activity className="h-5 w-5 text-slate-300 mb-2" />
                            <p className="text-xs text-slate-400">No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                            {activityFeed.slice(0, 6).map((event: any, i: number) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${event.type === 'ai' ? 'bg-cyan-500' : event.type === 'success' ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-slate-600 leading-snug">{event.msg}</p>
                                        <p className="text-[9px] text-slate-400">{event.time}</p>
                                    </div>
                                    {event.type === 'ai' && <Sparkles className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
                        <button onClick={() => navigate('/dashboard/campaigns')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-cyan-50 transition-colors text-left group">
                            <div className="h-6 w-6 rounded-lg bg-cyan-50 flex items-center justify-center"><Sparkles className="h-3 w-3 text-[#06B6D4]" /></div>
                            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-[#06B6D4] transition-colors">View All Campaigns</span>
                        </button>
                        <button onClick={() => navigate('/dashboard/analytics')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-cyan-50 transition-colors text-left group">
                            <div className="h-6 w-6 rounded-lg bg-cyan-50 flex items-center justify-center"><TrendingUp className="h-3 w-3 text-blue-500" /></div>
                            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-[#06B6D4] transition-colors">Full Analytics Report</span>
                        </button>
                        <button onClick={() => navigate('/dashboard/ai-models')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-cyan-50 transition-colors text-left group">
                            <div className="h-6 w-6 rounded-lg bg-cyan-50 flex items-center justify-center"><Cpu className="h-3 w-3 text-emerald-500" /></div>
                            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-[#06B6D4] transition-colors">AI Model Config</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── ROW 4: Recent Orders (8) + Recent Upsell Campaigns (4) ──── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                {/* Recent Orders Table */}
                <div className="xl:col-span-7 glass-card p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
                        <button onClick={() => navigate('/dashboard/orders')}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-cyan-50 hover:border-cyan-200 transition-colors bg-white">
                            See more
                        </button>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar -mx-2 px-2">
                        <div className="min-w-[600px]">
                            <div className="grid grid-cols-12 gap-3 px-3 py-2.5 text-[10px] font-semibold text-slate-400 border-b border-slate-100 bg-slate-50 rounded-t-lg uppercase tracking-wider">
                                <div className="col-span-3">Tracking ID</div>
                                <div className="col-span-4">Product</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-3 text-right">Amount</div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {apiOrders.map((order: any, i: number) => (
                                    <div key={i} className="grid grid-cols-12 gap-3 px-3 py-3.5 items-center hover:bg-cyan-50/50 transition-colors rounded-lg group">
                                        <div className="col-span-3 text-xs font-semibold text-slate-700">{order.id}</div>
                                        <div className="col-span-4 flex items-center gap-2">
                                            <span className="text-sm">{order.img}</span>
                                            <span className="text-xs font-medium text-slate-700 group-hover:text-[#06B6D4] transition-colors truncate">{order.product}</span>
                                        </div>
                                        <div className="col-span-2"><StatusBadge status={order.status} /></div>
                                        <div className="col-span-3 text-xs font-bold text-slate-900 text-right">{order.price}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Upsell Campaigns */}
                <div className="xl:col-span-5 glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-[#06B6D4] flex items-center justify-center">
                                <span className="text-xs">🤖</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Recent Upsells</h3>
                                <p className="text-[9px] text-slate-400 font-medium">AI recommendations</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/dashboard/campaigns')} className="text-xs font-semibold text-[#06B6D4] hover:text-[#0891B2] flex items-center gap-1 transition-colors">
                            View All <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                    {upsells.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="h-12 w-12 rounded-lg bg-cyan-50 flex items-center justify-center mb-3">
                                <span className="text-xl">✨</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 mb-0.5">No upsells yet</p>
                            <p className="text-[10px] text-slate-400 max-w-[200px]">Simulate an order to trigger AI recommendations.</p>
                        </div>
                    ) : (
                        <div className="space-y-0 divide-y divide-slate-50">
                            {Array.isArray(upsells) && upsells.map((u: any, i: number) => (
                                <div key={u.id || i} className="flex items-center gap-3 py-3 hover:bg-cyan-50/50 px-2 -mx-2 rounded-lg transition-colors group">
                                    <div className="h-9 w-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0 border border-cyan-100/50">
                                        <span className="text-sm">🛍️</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-[#06B6D4] transition-colors">
                                            {u.productName || 'AI Recommendation'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">{u.customerEmail || 'customer'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${u.status === 'converted' ? 'bg-emerald-50 text-emerald-600' :
                                            u.status === 'active' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-500'
                                            }`}>{u.status || 'pending'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ──── ROW 5: Bottom Summary Strip ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Today</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">₹{stats?.counts?.todayRevenue?.toLocaleString() || '0'}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">AI CVR</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">{convRates.conversionRate || '0'}%</p>
                    </div>
                    <Target className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Recovered</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">{stats?.abandonedCarts?.recovered || 0}</p>
                    </div>
                    <Users className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Pending</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">{stats?.abandonedCarts?.pending || 0}</p>
                    </div>
                    <ArrowDownRight className="h-4 w-4 text-amber-500" />
                </div>
            </div>
        </div>
    )
}
