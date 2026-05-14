import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '@/lib/api-client'
import {
    ArrowLeft, Package, TrendingUp, Target, DollarSign, Eye,
    Loader2, Beaker, BarChart3, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────
interface ProductAnalytics {
    product: {
        id: number; name: string; category: string; price: number;
        imageUrl: string | null; shopifyId: string | null;
    }
    summary: {
        totalCampaigns: number; converted: number; active: number; expired: number;
        totalRevenue: number; avgDiscount: number; impressions: number; conversionRate: number;
    }
    funnel: { sent: number; shown: number; converted: number }
    discountAnalysis: { discount: number; campaigns: number; converted: number; rate: number }[]
    abTest: {
        groupA: { campaigns: number; converted: number; rate: number; revenue: number }
        groupB: { campaigns: number; converted: number; rate: number; revenue: number }
    }
    revenueTimeline: { date: string; revenue: number; conversions: number }[]
    campaigns: {
        id: number; customerEmail: string; customerName: string; discount: number;
        status: string; revenue: number; shownAt: string; expiresAt: string;
        testGroup: string; impressions: number;
    }[]
}

export default function ProductDetailPage() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<ProductAnalytics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient.get(`/products/${productId}/analytics`)
                setData(res.data)
            } catch (error) {
                console.error('Failed to fetch product analytics:', error)
            } finally {
                setLoading(false)
            }
        }
        if (productId) fetchData()
    }, [productId])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                <span className="text-sm font-medium text-gray-400">Loading product analytics...</span>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Package className="h-12 w-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-400">Product not found</p>
                <Button variant="outline" onClick={() => navigate('/dashboard/inventory')} className="rounded-xl text-xs">
                    ← Back to Inventory
                </Button>
            </div>
        )
    }

    const { product, summary, funnel, discountAnalysis, abTest, revenueTimeline, campaigns } = data

    // Format timeline labels
    const formattedTimeline = revenueTimeline.map(d => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }))

    // Funnel percentages
    const funnelSteps = [
        { label: 'Sent', value: funnel.sent, pct: 100, color: 'from-cyan-500 to-[#06B6D4]' },
        { label: 'Shown', value: funnel.shown, pct: funnel.sent > 0 ? Math.round((funnel.shown / funnel.sent) * 100) : 0, color: 'from-blue-500 to-cyan-500' },
        { label: 'Converted', value: funnel.converted, pct: funnel.sent > 0 ? Math.round((funnel.converted / funnel.sent) * 100) : 0, color: 'from-emerald-500 to-green-500' },
    ]

    const abWinner = abTest.groupA.rate > abTest.groupB.rate ? 'A' : abTest.groupB.rate > abTest.groupA.rate ? 'B' : null

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* ── HEADER ───────────────────────────────────── */}
            <div className="flex items-start gap-5">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-lg border-slate-200 hover:bg-cyan-50 flex-shrink-0 mt-1"
                    onClick={() => navigate('/dashboard/inventory')}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-500" />
                </Button>
                <div className="flex items-center gap-4 flex-1">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-2" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-7 w-7 text-slate-300" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{product.name}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-cyan-50 text-cyan-600 text-xs font-semibold">
                                {product.category}
                            </span>
                            <span className="text-sm font-bold text-slate-600">₹{product.price.toLocaleString()}</span>
                            {product.shopifyId && (
                                <span className="text-[10px] text-slate-400 font-mono">SKU_{product.shopifyId}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI CARDS ────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 group hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-[#06B6D4]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#06B6D4] bg-cyan-50 px-2 py-0.5 rounded-lg">
                            {summary.active} active
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 tracking-tight">{summary.totalCampaigns}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Total Campaigns</p>
                </div>

                <div className="glass-card p-5 group hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Target className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">
                            {summary.conversionRate}% CVR
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 tracking-tight">{summary.converted}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Converted</p>
                </div>

                <div className="glass-card p-5 group hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-[#06B6D4]" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 tracking-tight">₹{summary.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Revenue Generated</p>
                </div>

                <div className="glass-card p-5 group hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-[#06B6D4]" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 tracking-tight">{summary.impressions}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Widget Impressions</p>
                </div>
            </div>

            {/* ── REVENUE TIMELINE + FUNNEL ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Revenue Timeline</h3>
                    <p className="text-[10px] text-slate-400 font-medium mb-4">Last 30 days</p>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedTimeline}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={50} tickFormatter={(v) => `₹${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, backgroundColor: '#ffffff' }}
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={2} fill="url(#revenueGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Conversion Funnel</h3>
                    <p className="text-[10px] text-slate-400 font-medium mb-5">Campaign → Widget → Sale</p>
                    <div className="space-y-4">
                        {funnelSteps.map((step, i) => (
                            <div key={step.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-600">{step.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-800">{step.value}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{step.pct}%</span>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full bg-gradient-to-r", step.color)}
                                        style={{ width: `${step.pct}%`, transition: 'width 0.8s ease-out' }}
                                    />
                                </div>
                                {i < funnelSteps.length - 1 && (
                                    <div className="flex justify-center my-1">
                                        <div className="text-[10px] text-slate-200">▼</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── DISCOUNT ANALYSIS + A/B TEST ─────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Discount Analysis */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-[#06B6D4]" />
                            <h3 className="text-sm font-bold text-slate-700">Discount Performance</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mb-4">Which discount converts best?</p>
                        {discountAnalysis.length > 0 ? (
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={discountAnalysis}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="discount" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, backgroundColor: '#ffffff' }}
                                            formatter={(value: number, name: string) => [
                                                name === 'rate' ? `${value}%` : value,
                                                name === 'rate' ? 'CVR' : name === 'campaigns' ? 'Campaigns' : 'Converted'
                                            ]}
                                        />
                                        <Bar dataKey="campaigns" fill="#bae6fd" radius={[4, 4, 0, 0]} name="campaigns" />
                                        <Bar dataKey="converted" fill="#06B6D4" radius={[4, 4, 0, 0]} name="converted" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-xs text-slate-400">No discount data yet</div>
                        )}
                    </div>

                    {/* A/B Test Results */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Beaker className="h-4 w-4 text-[#06B6D4]" />
                            <h3 className="text-sm font-bold text-slate-700">A/B Test Results</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mb-4">
                            Group A (AI Pitch) vs Group B (Generic)
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {(['groupA', 'groupB'] as const).map((group) => {
                                const g = abTest[group]
                                const label = group === 'groupA' ? 'A — AI Pitch' : 'B — Generic'
                                const isWinner = (group === 'groupA' && abWinner === 'A') || (group === 'groupB' && abWinner === 'B')
                                return (
                                    <div key={group} className={cn(
                                        "rounded-lg border p-4 transition-all",
                                        isWinner
                                            ? "border-cyan-200 bg-cyan-50/50 shadow-sm shadow-cyan-500/10"
                                            : "border-slate-100 bg-slate-50/50"
                                    )}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-0.5 rounded-lg",
                                                isWinner ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {label}
                                            </span>
                                            {isWinner && <span className="text-[10px] font-bold text-cyan-500">🏆 Winner</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[10px] text-slate-400 font-medium">Campaigns</span>
                                                <span className="text-xs font-bold text-slate-700">{g.campaigns}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[10px] text-slate-400 font-medium">Converted</span>
                                                <span className="text-xs font-bold text-slate-700">{g.converted}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[10px] text-slate-400 font-medium">CVR</span>
                                                <span className={cn("text-xs font-bold", isWinner ? "text-cyan-500" : "text-slate-700")}>
                                                    {g.rate}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-1 border-t border-slate-100">
                                                <span className="text-[10px] text-slate-400 font-medium">Revenue</span>
                                                <span className="text-xs font-bold text-emerald-500">₹{g.revenue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── CAMPAIGN HISTORY TABLE ────────────────── */}
                <div className="glass-card overflow-hidden p-0">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#06B6D4]" />
                        <h3 className="text-sm font-bold text-slate-700">Campaign History</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg ml-1">
                            {campaigns.length}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-6">Customer</TableHead>
                                    <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Discount</TableHead>
                                    <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Views</TableHead>
                                    <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Group</TableHead>
                                    <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right px-6">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16">
                                            <p className="text-sm font-medium text-slate-400">No campaigns yet for this product</p>
                                        </TableCell>
                                    </TableRow>
                                ) : campaigns.map((c) => (
                                    <TableRow key={c.id} className="border-slate-50 hover:bg-cyan-50/30 transition-colors">
                                        <TableCell className="py-3.5 px-6">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-700">{c.customerEmail}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{c.customerName}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                                -{c.discount}%
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold',
                                                c.status === 'converted' ? 'bg-emerald-50 text-emerald-600' :
                                                    c.status === 'active' ? 'bg-cyan-50 text-cyan-600' :
                                                        'bg-rose-50 text-rose-500'
                                            )}>
                                                {c.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn("text-xs font-semibold", c.impressions > 0 ? 'text-cyan-500' : 'text-slate-300')}>
                                                {c.impressions > 0 ? `👁 ${c.impressions}` : '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-lg",
                                                c.testGroup === 'A' ? "bg-cyan-50 text-cyan-600" :
                                                    c.testGroup === 'B' ? "bg-amber-50 text-amber-600" :
                                                        "bg-slate-50 text-slate-400"
                                            )}>
                                                {c.testGroup}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            {c.revenue > 0
                                                ? <span className="text-xs font-bold text-emerald-500">₹{c.revenue.toLocaleString()}</span>
                                                : <span className="text-xs text-slate-300">—</span>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                </div>
            </div>
        </div>
    )
}
