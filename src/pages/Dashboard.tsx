import { Mail, MailOpen, MousePointerClick, TrendingUp, DollarSign, Target, Download, Plus } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Button } from '@/components/ui/button'
import { mockCampaigns } from '@/data/mockCampaigns'
import { aggregatedStats, conversionRates, last7DaysAnalytics } from '@/data/mockAnalytics'
import { Campaign } from '@/types/dashboard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
    // Get recent campaigns (last 5)
    const recentCampaigns = mockCampaigns.slice(0, 5)

    // Table columns
    const columns: Column<Campaign>[] = [
        { key: 'id', header: 'Campaign ID', sortable: true },
        { key: 'customerEmail', header: 'Customer', sortable: true },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'sentAt',
            header: 'Sent Date',
            sortable: true,
            render: (row) => new Date(row.sentAt).toLocaleDateString(),
        },
        {
            key: 'revenue',
            header: 'Revenue',
            sortable: true,
            render: (row) => row.revenue ? `₹${row.revenue.toLocaleString()}` : '-',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Overview of your AI upsell campaigns
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                    </Button>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Campaigns"
                    value={aggregatedStats.totalSent}
                    change="+12.3%"
                    icon={Mail}
                    iconBg="bg-blue-500/20"
                    iconColor="text-blue-400"
                    trend="up"
                />
                <StatCard
                    label="Open Rate"
                    value={`${conversionRates.openRate}%`}
                    change="+5.2%"
                    icon={MailOpen}
                    iconBg="bg-green-500/20"
                    iconColor="text-green-400"
                    trend="up"
                />
                <StatCard
                    label="Click Rate"
                    value={`${conversionRates.clickRate}%`}
                    change="+3.1%"
                    icon={MousePointerClick}
                    iconBg="bg-purple-500/20"
                    iconColor="text-purple-400"
                    trend="up"
                />
                <StatCard
                    label="Conversion Rate"
                    value={`${conversionRates.conversionRate}%`}
                    change="-1.4%"
                    icon={TrendingUp}
                    iconBg="bg-amber-500/20"
                    iconColor="text-amber-400"
                    trend="down"
                />
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full p-3 bg-primary/20">
                            <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                        ₹{(aggregatedStats.totalRevenue / 1000).toFixed(1)}K
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full p-3 bg-green-500/20">
                            <Target className="h-6 w-6 text-green-400" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                        ₹{Math.floor(aggregatedStats.totalRevenue / aggregatedStats.totalConverted).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Average Order Value</p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full p-3 bg-emerald-500/20">
                            <TrendingUp className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                        {aggregatedStats.totalConverted}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Total Conversions</p>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6 hover:bg-secondary/70 transition-all duration-200">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Conversion Rate - Last 7 Days
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={last7DaysAnalytics}>
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
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Line
                            type="monotone"
                            dataKey="converted"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Campaigns Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Recent Campaigns</h2>
                    <Button variant="link" size="sm">
                        View All →
                    </Button>
                </div>
                <DataTable
                    data={recentCampaigns}
                    columns={columns}
                    rowActions={[
                        { label: 'View Details', value: 'view' },
                        { label: 'Resend', value: 'resend' },
                        { label: 'Delete', value: 'delete' },
                    ]}
                    onRowAction={(action, row) => {
                        console.log(`Action: ${action} on campaign ${row.id}`)
                    }}
                />
            </div>
        </div>
    )
}
