import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, Filter, Zap, Smartphone, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { Campaign } from '@/types/dashboard'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function CampaignsPage() {
    const navigate = useNavigate()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [retriggering, setRetriggering] = useState<number | null>(null)

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await apiClient.get('/upsells');
                setCampaigns(res.data);
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter((campaign) => {
        const matchesSearch =
            campaign.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.campaignId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.productName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleRowAction = async (action: string, row: Campaign) => {
        if (action === 'view') {
            navigate('/dashboard/analytics')
        } else if (action === 'resend') {
            if (row.status === 'converted') {
                toast.info(`Campaign already converted — no need to retrigger.`)
                return
            }
            if (!confirm(`Retrigger upsell to ${row.customerEmail}?\n\nProduct: ${row.productName}\nDiscount: ${row.discountPercent}%`)) return

            setRetriggering(row.id)
            try {
                await apiClient.post(`/upsells/${row.id}/resend`)
                toast.success(`✅ Upsell campaign re-triggered for ${row.customerEmail}!`)
                const res = await apiClient.get('/upsells')
                setCampaigns(res.data)
            } catch (err: any) {
                const msg = err?.response?.data?.error || 'Could not retrigger campaign'
                toast.error(`❌ ${msg}`)
            } finally {
                setRetriggering(null)
            }
        }
    }

    const columns: Column<Campaign>[] = [
        {
            key: 'campaignId',
            header: 'ID',
            sortable: true,
            render: (row) => <span className="font-mono text-[10px] font-black uppercase text-blue-500">{row.campaignId}</span>
        },
        {
            key: 'customerEmail',
            header: 'Recipient',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="font-bold text-xs">{row.customerEmail}</div>
                    <div className="text-[10px] text-muted-foreground">{row.customerName}</div>
                </div>
            )
        },
        {
            key: 'productName',
            header: 'Recommended',
            render: (row) => (
                <div className="flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-tight">
                        {row.productName}
                    </span>
                </div>
            ),
        },
        {
            key: 'discountPercent',
            header: 'Discount',
            render: (row) => (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-black">
                    -{row.discountPercent}%
                </span>
            ),
        },
        {
            key: 'impressionCount' as any,
            header: 'Views',
            sortable: true,
            render: (row: any) => (
                <span className={`text-[10px] font-black ${row.impressionCount > 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                    {row.impressionCount > 0 ? `👁 ${row.impressionCount}` : '—'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'State',
            sortable: true,
            render: (row) => {
                const colors: Record<string, string> = {
                    active: 'bg-blue-500/10 text-blue-600',
                    converted: 'bg-emerald-500/10 text-emerald-600',
                    expired: 'bg-red-500/10 text-red-500',
                }
                return (
                    <div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight ${colors[row.status] || 'bg-muted text-muted-foreground'}`}>
                            {row.status}
                        </span>
                        {row.timeRemaining && (
                            <div className="text-[9px] text-red-400 font-bold mt-0.5">⏰ {row.timeRemaining}</div>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'revenue',
            header: 'Yield',
            sortable: true,
            render: (row) => row.revenue
                ? <span className="font-black text-emerald-500 text-xs">₹{row.revenue.toLocaleString()}</span>
                : <span className="text-muted-foreground text-[10px]">-</span>,
        },
    ]

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-600 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Real-time Deployment</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">Autonomous Pipeline</h1>
                    <p className="text-muted-foreground mt-1 font-medium underline decoration-blue-500/30 underline-offset-4 tracking-tight">
                        Orchestrate and monitor your AI-driven upsell campaigns.
                    </p>
                </div>
                <Button className="h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] px-8 shadow-xl shadow-blue-500/20">
                    <Plus className="h-4 w-4 mr-2" />
                    New Integration
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Metrics and Filters */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Advanced Filters */}
                    <Card className="border-foreground/[0.04] bg-foreground/[0.01]">
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search by fingerprint..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none pl-12 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all font-medium text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40 bg-transparent border-none h-12 font-black uppercase text-[10px] tracking-widest focus:ring-0">
                                        <SelectValue placeholder="State" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-foreground/[0.08] bg-background/95 backdrop-blur-xl">
                                        <SelectItem value="all">All States</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="converted">Converted</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" className="h-10 w-10 border-foreground/[0.08] rounded-xl flex items-center justify-center p-0">
                                        <Filter className="h-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <div className="border border-foreground/[0.04] rounded-3xl overflow-hidden bg-foreground/[0.01] shadow-2xl shadow-foreground/[0.02]">
                        {loading ? (
                            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">Loading campaigns...</span>
                            </div>
                        ) : (
                            <DataTable
                                data={filteredCampaigns}
                                columns={columns}
                                rowActions={[
                                    { label: '📊 In-depth Analytics', value: 'view' },
                                    { label: retriggering ? '⏳ Retriggering...' : '🔄 Retrigger', value: 'resend' },
                                ]}
                                onRowAction={handleRowAction}
                                pageSize={8}
                            />
                        )}
                    </div>
                </div>

                {/* Live Preview Side */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-2 px-2">
                        <Smartphone className="h-5 w-5 text-blue-500" />
                        <h2 className="text-xl font-black uppercase tracking-tight">Live Widget Preview</h2>
                    </div>

                    <div className="relative group">
                        <div className="rounded-[3rem] border-8 border-foreground/[0.08] bg-background shadow-2xl overflow-hidden relative aspect-[9/16] max-w-[320px] mx-auto transition-transform duration-500 group-hover:scale-[1.02]">
                            <div className="absolute top-0 inset-x-0 h-10 flex items-center justify-between px-8 z-10">
                                <span className="text-[10px] font-bold">9:41</span>
                                <div className="flex gap-1.5 items-center">
                                    <div className="h-2 w-2 rounded-full border border-foreground/20" />
                                    <div className="h-2 w-3.5 rounded-sm border border-foreground/30" />
                                </div>
                            </div>
                            <div className="pt-16 pb-6 px-6 h-full overflow-y-auto bg-foreground/[0.01]">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <Sparkles className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Order Successful</span>
                                    </div>
                                    <div className="h-32 w-full rounded-2xl bg-foreground/[0.03] animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-3/4 rounded-lg bg-foreground/[0.05]" />
                                        <div className="h-3 w-1/2 rounded-lg bg-foreground/[0.03]" />
                                    </div>
                                    <div className="mt-8 relative animate-fade-in-up">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                            <span className="bg-blue-600 text-[9px] font-black uppercase tracking-widest text-white px-3 py-1 rounded-full shadow-lg shadow-blue-500/50">
                                                AI Smart Offer
                                            </span>
                                        </div>
                                        <Card className="border-blue-500/30 bg-blue-500/[0.02] shadow-xl shadow-blue-500/5 rounded-3xl overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="p-5 flex flex-col items-center gap-4 text-center">
                                                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-foreground/5">
                                                        <img src="/airpods_reco.png" alt="Recommendation" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110 duration-500" />
                                                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">Save 15%</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-black uppercase leading-tight">AirPods Pro Gen 2</h4>
                                                        <p className="text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-2">
                                                            <span className="line-through opacity-50">₹24,900</span>
                                                            <span className="text-blue-500 font-bold">₹21,165</span>
                                                        </p>
                                                    </div>
                                                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 group/btn">
                                                        Add to Order
                                                        <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-6 top-1/4 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />
                        <div className="absolute -left-6 bottom-1/4 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-10 py-6 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Real-time Matching</p>
                <div className="h-1 w-1 rounded-full bg-foreground" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Zero-Latency Logic</p>
            </div>
        </div>
    )
}
