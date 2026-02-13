import { useState } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import { mockAnalytics, aggregatedStats, conversionRates } from '@/data/mockAnalytics'
import { topProducts } from '@/data/mockProducts'
import { StatCard } from '@/components/dashboard/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    Legend,
} from 'recharts'

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('30')

    const periodData = period === '7' ? mockAnalytics.slice(-7) : mockAnalytics

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Detailed performance insights and metrics
                </p>
            </div>

            {/* Time Period Tabs */}
            <Tabs value={period} onValueChange={setPeriod}>
                <TabsList>
                    <TabsTrigger value="7">7 Days</TabsTrigger>
                    <TabsTrigger value="30">30 Days</TabsTrigger>
                    <TabsTrigger value="90">90 Days</TabsTrigger>
                    <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Sent"
                    value={aggregatedStats.totalSent}
                    icon={BarChart3}
                    iconBg="bg-blue-500/20"
                    iconColor="text-blue-400"
                />
                <StatCard
                    label="Delivery Rate"
                    value="98.5%"
                    icon={TrendingUp}
                    iconBg="bg-green-500/20"
                    iconColor="text-green-400"
                />
                <StatCard
                    label="Total Revenue"
                    value={`₹${(aggregatedStats.totalRevenue / 1000).toFixed(1)}K`}
                    icon={TrendingUp}
                    iconBg="bg-emerald-500/20"
                    iconColor="text-emerald-400"
                />
                <StatCard
                    label="Avg Time to Convert"
                    value="2.4 hrs"
                    icon={TrendingUp}
                    iconBg="bg-amber-500/20"
                    iconColor="text-amber-400"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        Conversion Funnel
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={periodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--secondary))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="sent" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Sent" />
                            <Area type="monotone" dataKey="opened" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Opened" />
                            <Area type="monotone" dataKey="clicked" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Clicked" />
                            <Area type="monotone" dataKey="converted" stackId="4" stroke="#10b981" fill="#059669" fillOpacity={0.8} name="Converted" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Over Time */}
                <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        Revenue Over Time
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={periodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--secondary))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products */}
            <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Top Performing Products
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-border/40">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Product</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Recommended</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Conversion Rate</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {topProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{product.timesRecommended}</td>
                                    <td className="py-3 px-4 text-green-400">{product.conversionRate}%</td>
                                    <td className="py-3 px-4 text-foreground font-medium">₹{product.revenueGenerated.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
