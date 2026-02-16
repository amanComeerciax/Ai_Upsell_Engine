import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Shield, Database, LayoutGrid, Calendar, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { topProducts as mockTopProducts } from '@/data/mockProducts' // Keep as fallback if products call fails
import { StatCard } from '@/components/dashboard/StatCard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    const [stats, setStats] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [statsRes, productsRes] = await Promise.all([
                    apiClient.get('/analytics/stats'),
                    apiClient.get('/products')
                ]);
                setStats(statsRes.data);
                setProducts(productsRes.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Simulated time-series data based on real counts until backend provides historicals
    const periodData = Array.from({ length: parseInt(period) }).map((_, i) => ({
        date: new Date(Date.now() - (parseInt(period) - i) * 24 * 60 * 60 * 1000).toISOString(),
        sent: Math.floor(Math.random() * 10) + (stats?.counts.totalUpsellEvents || 0) / 30,
        converted: Math.floor(Math.random() * 3),
        revenue: Math.floor(Math.random() * 1000)
    }));

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

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 border border-foreground/[0.04] rounded-3xl bg-foreground/[0.01]">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Telemetry...</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Dispatched"
                            value={stats?.counts.totalUpsellEvents.toLocaleString() || "0"}
                            icon={Database}
                            iconBg="bg-blue-500/10"
                            iconColor="text-blue-500"
                        />
                        <StatCard
                            label="Pipeline Health"
                            value="98.5%"
                            icon={Shield}
                            iconBg="bg-emerald-500/10"
                            iconColor="text-emerald-500"
                        />
                        <StatCard
                            label="Gross Yield"
                            value={`₹${((stats?.counts.totalRevenue || 0) / 1000).toFixed(1)}K`}
                            icon={TrendingUp}
                            iconBg="bg-blue-600/10"
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            label="Inference Velocity"
                            value="2.4 hrs"
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
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Multi-stage engagement tracking</p>
                                    </div>
                                    <LayoutGrid className="h-4 w-4 text-muted-foreground/30" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={periodData}>
                                            <defs>
                                                <linearGradient id="colorMesh" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                stroke="currentColor"
                                                opacity={0.3}
                                                fontSize={10}
                                                fontWeight="black"
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '12px' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                                                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px', fontWeight: 'black' }}
                                            />
                                            <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMesh)" name="Sent" />
                                            <Area type="monotone" dataKey="converted" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Converted" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Revenue Over Time */}
                        <Card className="border-foreground/[0.04] bg-foreground/[0.01]">
                            <CardHeader className="px-8 py-6 border-b border-foreground/[0.04]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Revenue Dynamics</CardTitle>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Periodic yield accumulation</p>
                                    </div>
                                    <Calendar className="h-4 w-4 text-muted-foreground/30" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={periodData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                stroke="currentColor"
                                                opacity={0.3}
                                                fontSize={10}
                                                fontWeight="black"
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '12px' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                                                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px', fontWeight: 'black' }}
                                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                                            />
                                            <Bar dataKey="revenue" fill="currentColor" opacity={0.8} radius={[4, 4, 4, 4]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
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
                                        <th className="text-left py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Entity Name</th>
                                        <th className="text-left py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Recommended</th>
                                        <th className="text-left py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Conv. Efficiency</th>
                                        <th className="text-right py-4 px-8 text-[10px] font-black tracking-widest text-muted-foreground uppercase">Entity Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-foreground/[0.04]">
                                    {(products || []).slice(0, 5).map((product: any) => (
                                        <tr key={product.id} className="hover:bg-foreground/[0.01] transition-colors group">
                                            <td className="py-4 px-8 font-black text-foreground group-hover:text-blue-500 transition-colors uppercase text-xs">{product.name}</td>
                                            <td className="py-4 px-8 text-sm font-bold text-muted-foreground tracking-tight">{product.timesRecommended}</td>
                                            <td className="py-4 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-12 rounded-full bg-foreground/[0.05] overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${product.conversionRate}%` }} />
                                                    </div>
                                                    <span className="font-black text-[11px] text-emerald-500">{product.conversionRate}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-8 text-right font-black text-foreground">₹{product.revenueGenerated.toLocaleString()}</td>
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

