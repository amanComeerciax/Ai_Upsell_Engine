import { useState, useEffect } from 'react'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'
import { Mail, MailOpen, MousePointerClick, TrendingUp, DollarSign, Target, Download, Zap, ArrowUpRight, Activity, Loader2, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import { useMerchant } from '@/contexts/MerchantContext'

export default function DashboardPage() {
    const { merchant } = useMerchant()
    const [stats, setStats] = useState<any>(null)
    const [abMetrics, setAbMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [simulating, setSimulating] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, abRes] = await Promise.all([
                apiClient.get('/analytics/stats'),
                apiClient.get('/analytics/ab-test')
            ]);
            setStats(statsRes.data);
            setAbMetrics(abRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateOrder = async () => {
        try {
            setSimulating(true);

            if (!merchant?.shopify_shop_name) {
                alert("Please connect your Shopify store in Settings first.");
                return;
            }

            // Get a real product from the list to make the simulation realistic
            const productsRes = await apiClient.get('/products');
            const products = productsRes.data;
            const realProduct = products.find((p: any) => p.shopifyId);

            if (!realProduct) {
                alert("Please sync products first to get real IDs for simulation.");
                return;
            }

            const mockOrder = {
                id: Math.floor(Math.random() * 1000000000),
                email: "customer@example.com",
                total_price: "450.00",
                customer: {
                    first_name: "Aman",
                    last_name: "Patel"
                },
                line_items: [
                    {
                        id: Math.floor(Math.random() * 1000000),
                        product_id: realProduct.shopifyId,
                        title: realProduct.name,
                        quantity: 1,
                        price: realProduct.price
                    }
                ]
            };

            // Pass the shop domain so the webhook controller identifies this merchant
            await apiClient.post('/shopify/webhooks/orders/create', mockOrder, {
                headers: {
                    'x-shopify-shop-domain': merchant.shopify_shop_name
                }
            });

            await fetchDashboardData();
            alert("Order Simulated! AI Recommendation generated in background.");
        } catch (error) {
            console.error("Simulation failed:", error);
            alert("Simulation failed. Check console.");
        } finally {
            setSimulating(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const columns: Column<any>[] = [
        { key: 'id', header: 'Order ID', sortable: true },
        {
            key: 'customerEmail',
            header: 'Customer',
            sortable: true,
            render: (row: any) => <span className="font-bold">{row.customerEmail}</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => <StatusBadge status={row.status} />,
        },
        {
            key: 'createdAt',
            header: 'Date',
            sortable: true,
            render: (row: any) => <span className="text-muted-foreground font-medium">{new Date(row.createdAt).toLocaleDateString()}</span>,
        },
        {
            key: 'totalAmount',
            header: 'Amount',
            sortable: true,
            render: (row: any) => <span className="font-black text-emerald-500">₹{row.totalAmount.toLocaleString()}</span>,
        },
    ]

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Dashboard...</p>
            </div>
        )
    }

    const handleExport = () => {
        if (!stats?.recentOrders?.length) {
            alert("No data available to export");
            return;
        }

        const headers = ["Order ID", "Customer", "Status", "Amount", "Date"];
        const rows = stats.recentOrders.map((o: any) => [
            o.id,
            o.customerEmail,
            o.status,
            o.totalAmount,
            new Date(o.createdAt).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((r: any[]) => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `store_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-600 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Live Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">Neural Command</h1>
                    <p className="text-muted-foreground mt-1 font-medium underline decoration-blue-500/30 underline-offset-4 tracking-tight">
                        Welcome back, {merchant?.business_name || 'Merchant'}. Monitoring {merchant?.shopify_shop_name || 'autonomous'} node.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSimulateOrder}
                        disabled={simulating || !merchant?.shopify_connected}
                        className="h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] px-8 shadow-xl shadow-blue-500/20"
                    >
                        {simulating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        Simulate Order
                    </Button>
                    <Button
                        onClick={handleExport}
                        className="h-12 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] px-8"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Orders"
                    value={stats?.counts.totalOrders || 0}
                    change="+12.3%"
                    icon={Mail}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-500"
                    trend="up"
                />
                <StatCard
                    label="Widget Impressions"
                    value={`${stats?.conversionRates.openRate}%`}
                    change={`${stats?.conversionRates.impressedCount ?? 0} shown`}
                    icon={MailOpen}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-500"
                    trend="up"
                />
                <StatCard
                    label="Click-through"
                    value={`${stats?.conversionRates.clickRate}%`}
                    change="+3.1%"
                    icon={MousePointerClick}
                    iconBg="bg-purple-500/10"
                    iconColor="text-purple-500"
                    trend="up"
                />
                <StatCard
                    label="Net Conversion"
                    value={`${stats?.conversionRates.conversionRate}%`}
                    change="-1.4%"
                    icon={TrendingUp}
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-500"
                    trend="down"
                />
            </div>

            {/* Premium Revenue Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-black">
                                <ArrowUpRight className="h-3 w-3" />
                                14%
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">Total Revenue Harvested</p>
                        <p className="text-4xl font-black tracking-tighter">
                            ₹{(stats?.counts.totalRevenue / 1000).toFixed(1)}K
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Target className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-black">
                                <ArrowUpRight className="h-3 w-3" />
                                8%
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">Avg. Ticket Expansion</p>
                        <p className="text-4xl font-black tracking-tighter">
                            ₹{Math.floor(stats?.counts.totalRevenue / (stats?.counts.totalOrders || 1)).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-black">
                                <Activity className="h-3 w-3" />
                                Stable
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-1">AI Recommendation Events</p>
                        <p className="text-4xl font-black tracking-tighter">
                            {stats?.counts.totalUpsellEvents}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI ROI Lift Summary */}
            {abMetrics && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] p-[1px] shadow-2xl shadow-blue-500/20">
                    <div className="bg-[#0a0a0a] rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative border border-white/5">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Sparkles className="h-48 w-48 text-white" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-5 w-5 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Sparkles className="h-3 w-3 text-blue-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Intelligence Performance</span>
                            </div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                                AI PERSONALIZATION IS DRIVING <span className="text-blue-400">+{abMetrics.lift}% LIFT</span>
                            </h2>
                            <p className="text-white/40 mt-4 font-bold text-sm max-w-lg leading-relaxed">
                                {abMetrics.summary} Comparing AI-personalized pitches against generic marketing control group.
                            </p>
                        </div>

                        <div className="flex items-center gap-8 shrink-0">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">AI Conversion</p>
                                <p className="text-4xl font-black text-blue-400 tracking-tighter italic">{abMetrics.groupA.rate}%</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Control Group</p>
                                <p className="text-4xl font-black text-white/40 tracking-tighter italic">{abMetrics.groupB.rate}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <Card className="lg:col-span-2 border-foreground/[0.04] bg-foreground/[0.01]">
                    <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-foreground/[0.04]">
                        <div>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Revenue Trajectory</CardTitle>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Daily Conversion Delta</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Real-time</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px] w-full">
                            {stats?.trajectory ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.trajectory}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#111',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                fontSize: '10px',
                                                fontWeight: '900'
                                            }}
                                            itemStyle={{ color: '#3b82f6' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-foreground/[0.01] border border-dashed border-foreground/5 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Calibrating Data Matrix...</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* System Status Feed */}
                <Card className="border-foreground/[0.04] bg-foreground/[0.01]">
                    <CardHeader className="px-8 py-6 border-b border-foreground/[0.04]">
                        <CardTitle className="text-lg font-black uppercase tracking-tight text-blue-500">Global Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-foreground/[0.04]">
                            {(stats?.activityFeed || []).map((item: any, i: number) => (
                                <div key={i} className="px-8 py-4 flex items-center justify-between group hover:bg-foreground/[0.01] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full shrink-0",
                                            item.type === 'success' ? 'bg-emerald-500' :
                                                item.type === 'ai' ? 'bg-blue-500' :
                                                    item.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                        )} />
                                        <p className="text-[11px] font-bold text-foreground/80 truncate max-w-[150px]">{item.msg}</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{item.time}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-4">
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/5">
                                View Full Audit Log
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Live Order Pipeline</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time sync with database orders</p>
                    </div>
                </div>
                <div className="border border-foreground/[0.04] rounded-2xl overflow-hidden bg-foreground/[0.01]">
                    <DataTable
                        data={stats?.recentOrders || []}
                        columns={columns}
                        rowActions={[
                            { label: 'View Order', value: 'view' },
                            { label: 'Refund', value: 'refund' },
                        ]}
                        onRowAction={(action, row) => console.log(action, row)}
                    />
                </div>
            </div>
        </div>
    )
}
