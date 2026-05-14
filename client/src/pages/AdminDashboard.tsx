import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
    Users, 
    CreditCard, 
    TrendingUp, 
    ArrowUpRight, 
    ExternalLink,
    Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

interface AdminStats {
    merchants: {
        total: number;
        pro: number;
        free: number;
    };
    performance: {
        totalOrders: number;
        totalUpsells: number;
        convertedUpsells: number;
        conversionRate: number;
    };
    revenue: {
        total: number;
    };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/admin/stats')
                setStats(res.data)
            } catch (err) {
                console.error('[Admin] Fetch stats failed:', err)
                toast.error('Failed to load global statistics')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="p-8 space-y-6 animate-pulse">
                <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-[#06B6D4]" />
                    SaaS Control Center
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Global overview of system health and revenue.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Merchants" 
                    value={stats?.merchants.total || 0} 
                    icon={Users} 
                    color="cyan"
                    description={`${stats?.merchants.pro} Pro / ${stats?.merchants.free} Free`}
                />
                <StatCard 
                    title="Total Revenue (All Time)" 
                    value={`₹${stats?.revenue.total.toLocaleString()}`} 
                    icon={CreditCard} 
                    color="emerald"
                    description="Gross merchandise volume"
                />
                <StatCard 
                    title="Global Conversion" 
                    value={`${stats?.performance.conversionRate}%`} 
                    icon={TrendingUp} 
                    color="cyan"
                    description={`${stats?.performance.convertedUpsells} converted upsells`}
                />
                <StatCard 
                    title="Active Subscriptions" 
                    value={stats?.merchants.pro || 0} 
                    icon={ArrowUpRight} 
                    color="cyan"
                    description="Merchants on Pro Plan"
                />
            </div>

            {/* Detailed Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-2xl font-bold">
                 <Card className="glass-card col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">System Performance</CardTitle>
                        <CardDescription>Real-time processing metrics across all linked stores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <PerformanceMetric label="Total Orders Processed" value={stats?.performance.totalOrders || 0} />
                            <PerformanceMetric label="AI Upsells Generated" value={stats?.performance.totalUpsells || 0} />
                            <PerformanceMetric label="Success Rate" value={`${stats?.performance.conversionRate}%`} highlight />
                        </div>
                    </CardContent>
                 </Card>

                 <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Administrative Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link to="/admin/merchants" className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-all font-semibold text-slate-700">
                           Manage Merchants <ArrowUpRight className="h-4 w-4 text-cyan-500" />
                        </Link>
                        <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-all font-semibold text-slate-700">
                           Stripe Dashboard <ExternalLink className="h-4 w-4 text-cyan-500" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-white hover:bg-rose-50 transition-all font-semibold text-rose-500">
                           System Health Log
                        </button>
                    </CardContent>
                 </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, description }: any) {
    const colors: any = {
        cyan: 'from-cyan-500/10 to-cyan-600/10 text-cyan-600 border-cyan-100',
        emerald: 'from-emerald-500/10 to-emerald-600/10 text-emerald-600 border-emerald-100',
    }

    return (
        <Card className={`glass-card border bg-gradient-to-br ${colors[color]}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{title}</p>
                    <div className="h-8 w-8 rounded-lg bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                    {description && (
                        <p className="text-[10px] font-semibold mt-1 opacity-60 uppercase tracking-tight">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function PerformanceMetric({ label, value, highlight }: any) {
    return (
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
            <span className="text-sm font-semibold text-slate-500">{label}</span>
            <span className={cn(
                "font-bold",
                highlight ? "text-[#06B6D4] text-lg" : "text-slate-800"
            )}>{value}</span>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
