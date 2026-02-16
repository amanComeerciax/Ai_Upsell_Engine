import { useState, useEffect } from 'react'
import { Mail, MailOpen, MousePointerClick, TrendingUp, DollarSign, Target, Download, Zap, ArrowUpRight, Activity, Loader2 } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'
import apiClient from '@/lib/api-client'

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [simulating, setSimulating] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/analytics/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateOrder = async () => {
        try {
            setSimulating(true);

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

            await apiClient.post('/shopify/webhooks/orders/create', mockOrder);
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

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-[2px] bg-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">System Live</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">Command Center</h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">
                        Real-time intelligence pipeline for your store's upsell ecosystem.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSimulateOrder}
                        disabled={simulating}
                        variant="outline"
                        className="border-blue-500/20 bg-blue-500/[0.02] text-blue-500 hover:bg-blue-500/10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                        {simulating ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Zap className="h-3 w-3 mr-2 fill-current" />}
                        Simulate Shopify Order
                    </Button>
                    <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold uppercase tracking-widest text-[10px] px-6">
                        <Download className="h-3.5 w-3.5 mr-2" />
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
                    label="AI Opt-in Rate"
                    value={`${stats?.conversionRates.openRate}%`}
                    change="+5.2%"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart - Keep mock for now as it needs complex date grouping */}
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
                        <div className="h-[300px] w-full flex items-center justify-center bg-foreground/[0.01] border border-dashed border-foreground/5 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Historical Trajectory Mapping...</p>
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
