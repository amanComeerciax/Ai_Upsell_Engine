import { useState, useEffect } from 'react'
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
    ShoppingBag, Package, Loader2, Zap, Download, ChevronDown,
    MoreHorizontal, TrendingUp, ArrowUpRight, ArrowDownRight,
    Sparkles, Eye, MousePointerClick, Target, Activity,
    ExternalLink, Cpu, DollarSign, Users, ShoppingCart,
} from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'

import apiClient from '@/lib/api-client'
import { useMerchant } from '@/contexts/MerchantContext'

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
    { name: 'Converted', value: 45, color: '#7C3AED' },
    { name: 'Active', value: 35, color: '#34D399' },
    { name: 'Expired', value: 20, color: '#F87171' },
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
    { id: '#9812567', product: 'Air Vapomax', status: 'complete', price: '$22.78', img: '👟' },
    { id: '#9812411', product: 'Canon EOS 1500D', status: 'pending', price: '$122.8', img: '📷' },
    { id: '#9812556', product: 'MI Backpack Black', status: 'cancelled', price: '$15.99', img: '🎒' },
    { id: '#9812619', product: 'iPhone 12 128GB', status: 'complete', price: '$4022', img: '📱' },
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
            <div className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-gray-700/50">
                <p className="text-gray-400 text-[10px] font-medium mb-0.5">Revenue</p>
                <p className="text-white font-bold text-sm">₹{payload[0].value.toLocaleString()}</p>
            </div>
        )
    }
    return null
}

const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white px-4 py-3 rounded-xl text-xs shadow-xl border border-gray-700/50">
                <p className="text-gray-400 text-[10px] font-medium mb-1.5">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-500" />
                        <span className="text-gray-300">Upsells:</span>
                        <span className="font-bold">{payload[0]?.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-300" />
                        <span className="text-gray-300">Orders:</span>
                        <span className="font-bold">{payload[1]?.value}</span>
                    </div>
                </div>
            </div>
        )
    }
    return null
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const { merchant } = useMerchant()
    const [stats, setStats] = useState<any>(null)
    const [upsells, setUpsells] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [simulating, setSimulating] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, upsellsRes] = await Promise.all([
                apiClient.get('/analytics/stats'),
                apiClient.get('/upsells').catch(() => ({ data: [] })),
            ]);
            setStats(statsRes.data);
            setUpsells(upsellsRes.data?.slice?.(0, 5) || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateOrder = async () => {
        try {
            setSimulating(true);
            if (!merchant?.shopify_shop_name) { alert("Please connect your Shopify store in Settings first."); return; }
            const productsRes = await apiClient.get('/products');
            const realProduct = productsRes.data.find((p: any) => p.shopifyId);
            if (!realProduct) { alert("Please sync products first."); return; }
            await apiClient.post('/shopify/webhooks/orders/create', {
                id: Math.floor(Math.random() * 1000000000),
                email: "customer@example.com", total_price: "450.00",
                customer: { first_name: "Aman", last_name: "Patel" },
                line_items: [{ id: Math.floor(Math.random() * 1000000), product_id: realProduct.shopifyId, title: realProduct.name, quantity: 1, price: realProduct.price }]
            }, { headers: { 'x-shopify-shop-domain': merchant.shopify_shop_name } });
            await fetchDashboardData();
            alert("Order Simulated! AI Recommendation generated.");
        } catch (error) { console.error("Simulation failed:", error); alert("Simulation failed."); }
        finally { setSimulating(false); }
    }

    useEffect(() => { fetchDashboardData(); }, []);

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

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
                </div>
                <p className="text-sm font-medium text-gray-400">Loading dashboard...</p>
            </div>
        )
    }

    const chartData = Array.isArray(stats?.trajectory) ? stats.trajectory.map((d: any) => ({ time: d.day, value: d.revenue })) : salesChartData
    const apiOrders = Array.isArray(stats?.recentOrders) ? stats.recentOrders.slice(0, 4).map((o: any) => ({
        id: `#${o.id?.toString().slice(-7) || '0000000'}`,
        product: o.customerEmail || 'Product',
        status: o.status || 'pending',
        price: `₹${o.totalAmount?.toLocaleString() || '0'}`,
        img: '📦',
    })) : recentOrders
    const convRates = stats?.conversionRates || {}
    const activityFeed = Array.isArray(stats?.activityFeed) ? stats.activityFeed : []
    const sparkData = chartData.map((d: any) => d.value)

    return (
        <div className="space-y-5 animate-fade-in pb-8">
            {/* ──── Top Bar: Actions ──── */}
            <div className="flex items-center gap-3 justify-end">
                <Button onClick={handleSimulateOrder} disabled={simulating || !merchant?.shopify_connected}
                    className="h-9 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold px-5 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all">
                    {simulating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Zap className="h-3.5 w-3.5 mr-2" />}
                    Simulate Order
                </Button>
                <Button onClick={handleExport} variant="outline" className="h-9 rounded-xl border-gray-200 text-xs font-semibold px-5 text-gray-600 hover:bg-white/60">
                    <Download className="h-3.5 w-3.5 mr-2" /> Export
                </Button>
            </div>

            {/* ──── ROW 1: 4 Stat Cards with Sparklines (no height mismatch) ──── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-violet-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-violet-500" />
                        </div>
                        <MiniSparkline data={sparkData.length ? sparkData : [10, 20, 15, 30, 25, 35]} color="#7C3AED" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">₹{(stats?.counts?.totalRevenue || 0).toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-gray-400">Total Revenue</p>
                        <div className="flex items-center gap-0.5 text-emerald-500">
                            <ArrowUpRight className="h-3 w-3" />
                            <span className="text-[10px] font-bold">+12.5%</span>
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-blue-500" />
                        </div>
                        <MiniSparkline data={[20, 35, 28, 40, 45, 38, 50]} color="#3B82F6" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{stats?.counts?.totalOrders || 0}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-gray-400">Total Orders</p>
                        <div className="flex items-center gap-0.5 text-emerald-500">
                            <ArrowUpRight className="h-3 w-3" />
                            <span className="text-[10px] font-bold">+8.3%</span>
                        </div>
                    </div>
                </div>

                {/* AI Upsell Events */}
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-1 text-violet-500 bg-violet-50 px-2 py-0.5 rounded-lg">
                            <Activity className="h-3 w-3" /><span className="text-[10px] font-bold">LIVE</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{stats?.counts?.totalUpsellEvents || 0}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-gray-400">AI Upsells Triggered</p>
                        <span className="text-[10px] font-bold text-violet-500">{convRates.conversionRate || '0'}% CVR</span>
                    </div>
                </div>

                {/* Products Synced */}
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-amber-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center">
                            <Package className="h-5 w-5 text-amber-500" />
                        </div>
                        <MiniSparkline data={[15, 22, 18, 25, 30, 28, 32]} color="#F59E0B" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{stats?.counts?.totalProducts || 0}</p>
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-medium text-gray-400">Products Synced</p>
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
                            <h3 className="text-base font-bold text-gray-800">Revenue Overview</h3>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Last 7 days trajectory</p>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-violet-50 hover:border-violet-200 transition-colors">
                            Weekly <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                                        <stop offset="50%" stopColor="#818CF8" stopOpacity={0.08} />
                                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }} dx={-10} />
                                <Tooltip content={<SalesTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)"
                                    dot={{ fill: '#7C3AED', strokeWidth: 2, stroke: '#fff', r: 4 }}
                                    activeDot={{ fill: '#7C3AED', strokeWidth: 3, stroke: '#fff', r: 6 }} />
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
                            <h3 className="text-base font-bold text-gray-800">Upsell vs Orders</h3>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Weekly comparison</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-violet-500" /><span className="text-gray-500 font-medium">Upsells</span></div>
                            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-violet-300" /><span className="text-gray-500 font-medium">Orders</span></div>
                        </div>
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsBarData} barGap={3} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }} />
                                <Tooltip content={<BarTooltip />} />
                                <Bar dataKey="upsells" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="orders" fill="#C4B5FD" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions + AI Activity */}
                <div className="xl:col-span-4 glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-4 w-4 text-violet-500" />
                        <h3 className="text-sm font-bold text-gray-800">AI Activity Feed</h3>
                    </div>
                    {Array.isArray(activityFeed) && activityFeed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Activity className="h-5 w-5 text-gray-300 mb-2" />
                            <p className="text-xs text-gray-400">No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                            {Array.isArray(activityFeed) && activityFeed.slice(0, 6).map((event: any, i: number) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${event.type === 'ai' ? 'bg-violet-500' : event.type === 'success' ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-gray-600 leading-snug">{event.msg}</p>
                                        <p className="text-[9px] text-gray-400">{event.time}</p>
                                    </div>
                                    {event.type === 'ai' && <Sparkles className="h-3 w-3 text-violet-400 shrink-0 mt-0.5" />}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
                        <button onClick={() => navigate('/dashboard/campaigns')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-violet-50/50 transition-colors text-left group">
                            <div className="h-6 w-6 rounded-lg bg-violet-50 flex items-center justify-center"><Sparkles className="h-3 w-3 text-violet-500" /></div>
                            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-violet-600 transition-colors">View All Campaigns</span>
                        </button>
                        <button onClick={() => navigate('/dashboard/analytics')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50/50 transition-colors text-left group">
                            <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center"><TrendingUp className="h-3 w-3 text-blue-500" /></div>
                            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">Full Analytics Report</span>
                        </button>
                        <button onClick={() => navigate('/dashboard/ai-models')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50/50 transition-colors text-left group">
                            <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center"><Cpu className="h-3 w-3 text-emerald-500" /></div>
                            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-emerald-600 transition-colors">AI Model Config</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── ROW 4: Recent Orders (8) + Recent Upsell Campaigns (4) ──── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                {/* Recent Orders Table */}
                <div className="xl:col-span-7 glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-gray-800">Recent Orders</h3>
                        <button onClick={() => navigate('/dashboard/orders')}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-violet-50 hover:border-violet-200 transition-colors bg-white/80">
                            See more
                        </button>
                    </div>
                    <div className="grid grid-cols-12 gap-3 px-3 py-2.5 text-[10px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50 rounded-t-xl uppercase tracking-wider">
                        <div className="col-span-3">Tracking ID</div>
                        <div className="col-span-4">Product</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-3">Amount</div>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {Array.isArray(apiOrders) && apiOrders.map((order: any, i: number) => (
                            <div key={i} className="grid grid-cols-12 gap-3 px-3 py-3.5 items-center hover:bg-violet-50/30 transition-colors rounded-lg group">
                                <div className="col-span-3 text-xs font-semibold text-gray-700">{order.id}</div>
                                <div className="col-span-4 flex items-center gap-2">
                                    <span className="text-sm">{order.img}</span>
                                    <span className="text-xs font-medium text-gray-700 group-hover:text-violet-600 transition-colors truncate">{order.product}</span>
                                </div>
                                <div className="col-span-2"><StatusBadge status={order.status} /></div>
                                <div className="col-span-3 text-xs font-bold text-gray-800">{order.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Upsell Campaigns */}
                <div className="xl:col-span-5 glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-xs">🤖</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Recent Upsells</h3>
                                <p className="text-[9px] text-gray-400 font-medium">AI recommendations</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/dashboard/campaigns')} className="text-xs font-semibold text-violet-500 hover:text-violet-700 flex items-center gap-1 transition-colors">
                            View All <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                    {upsells.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                                <span className="text-xl">✨</span>
                            </div>
                            <p className="text-xs font-semibold text-gray-700 mb-0.5">No upsells yet</p>
                            <p className="text-[10px] text-gray-400 max-w-[200px]">Simulate an order to trigger AI recommendations.</p>
                        </div>
                    ) : (
                        <div className="space-y-0 divide-y divide-gray-50">
                            {Array.isArray(upsells) && upsells.map((u: any, i: number) => (
                                <div key={u.id || i} className="flex items-center gap-3 py-3 hover:bg-violet-50/30 px-2 -mx-2 rounded-xl transition-colors group">
                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center shrink-0 border border-violet-200/30">
                                        <span className="text-sm">🛍️</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-violet-600 transition-colors">
                                            {u.productName || 'AI Recommendation'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 truncate">{u.customerEmail || 'customer'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${u.status === 'converted' ? 'bg-emerald-50 text-emerald-600' :
                                            u.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
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
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Today</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">₹{stats?.counts?.todayRevenue?.toLocaleString() || '0'}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">AI CVR</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{convRates.conversionRate || '0'}%</p>
                    </div>
                    <Target className="h-4 w-4 text-violet-500" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Recovered</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{stats?.abandonedCarts?.recovered || 0}</p>
                    </div>
                    <Users className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Pending</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{stats?.abandonedCarts?.pending || 0}</p>
                    </div>
                    <ArrowDownRight className="h-4 w-4 text-amber-500" />
                </div>
            </div>
        </div>
    )
}
