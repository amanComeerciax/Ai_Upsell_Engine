import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, Filter, Zap, Loader2, Sparkles, Target, ArrowUpRight } from 'lucide-react'
import apiClient, { getCached } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { Campaign } from '@/types/dashboard'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function CampaignsPage() {
    const navigate = useNavigate()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [retriggering, setRetriggering] = useState<number | string | null>(null)

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                // Returns data from cache if fresh, otherwise fetches with background revalidation
                const cached = await getCached('/upsells', 60000).catch(() => null);
                
                if (cached) {
                    setCampaigns(cached);
                    setLoading(false);
                } else {
                    setLoading(true);
                    // Standard fetch if cache is empty
                    const res = await apiClient.get('/upsells');
                    setCampaigns(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((campaign) => {
            const searchQueryLower = searchQuery.toLowerCase();
            const matchesSearch =
                campaign.customerEmail.toLowerCase().includes(searchQueryLower) ||
                campaign.campaignId.toLowerCase().includes(searchQueryLower) ||
                campaign.productName.toLowerCase().includes(searchQueryLower)
            const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
            return matchesSearch && matchesStatus
        });
    }, [campaigns, searchQuery, statusFilter]);

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

    // Summary stats
    const { totalCampaigns, convertedCount, activeCount, totalRevenue } = useMemo(() => {
        const total = campaigns.length;
        const converted = campaigns.filter(c => c.status === 'converted').length;
        const active = campaigns.filter(c => c.status === 'active').length;
        const revenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
        return { totalCampaigns: total, convertedCount: converted, activeCount: active, totalRevenue: revenue };
    }, [campaigns]);

    const columns: Column<Campaign>[] = [
        {
            key: 'campaignId',
            header: 'ID',
            sortable: true,
            render: (row) => <span className="font-mono text-xs font-semibold text-[#06B6D4]">{row.campaignId}</span>
        },
        {
            key: 'customerEmail',
            header: 'Recipient',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <div className="font-semibold text-sm text-slate-700">{row.customerEmail}</div>
                    <div className="text-xs text-slate-400">{row.customerName}</div>
                </div>
            )
        },
        {
            key: 'productName',
            header: 'Recommended',
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-[#06B6D4] text-xs font-semibold">
                    {row.productName}
                </span>
            ),
        },
        {
            key: 'discountPercent',
            header: 'Discount',
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    -{row.discountPercent}%
                </span>
            ),
        },
        {
            key: 'impressionCount' as any,
            header: 'Views',
            sortable: true,
            render: (row: any) => (
                <span className={cn("text-xs font-semibold", row.impressionCount > 0 ? 'text-[#06B6D4]' : 'text-slate-300')}>
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
                    active: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
                    converted: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                    expired: 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400',
                }
                return (
                    <div className="flex flex-col gap-1">
                        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', colors[row.status] || 'bg-gray-50 text-gray-500')}>
                            {row.status}
                        </span>
                        {row.timeRemaining && (
                            <div className="text-[10px] text-red-400 font-medium ml-1 flex items-center gap-1">
                                <span className="animate-pulse">⏰</span> {row.timeRemaining}
                            </div>
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
                ? <span className="font-bold text-emerald-500 text-sm">₹{row.revenue.toLocaleString()}</span>
                : <span className="text-gray-300 text-xs">—</span>,
        },
    ]

    return (
        <div className="space-y-5 animate-fade-in pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Zap className="h-4 w-4 text-[#06B6D4]" />
                        <span className="text-xs font-semibold text-[#06B6D4]">Real-time Deployment</span>
                    </div>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium max-w-lg">
                        Orchestrate and monitor your <span className="text-slate-700 dark:text-slate-200 font-semibold">AI-driven</span> upsell campaigns.
                    </p>
                </div>
                <Button className="rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold px-5 h-10 shadow-lg shadow-cyan-500/20">
                    <Plus className="h-4 w-4 mr-2" />
                    New Integration
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">{totalCampaigns}</p>
                    </div>
                    <Sparkles className="h-4 w-4 text-[#06B6D4]" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">{activeCount}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Converted</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">{convertedCount}</p>
                    </div>
                    <Target className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Revenue</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                </div>
            </div>

            <div className="space-y-4">
                {/* Filters */}
                <div className="glass-card p-4 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by email or campaign ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-10 h-10 rounded-lg text-sm focus-visible:ring-cyan-200 dark:focus-visible:ring-cyan-900/30"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 text-xs font-semibold rounded-lg">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-slate-200 bg-white shadow-lg">
                                <SelectItem value="all" className="text-xs font-medium">All States</SelectItem>
                                <SelectItem value="active" className="text-xs font-medium">Active</SelectItem>
                                <SelectItem value="converted" className="text-xs font-medium">Converted</SelectItem>
                                <SelectItem value="expired" className="text-xs font-medium">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-10 w-10 border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center p-0 hover:bg-cyan-50 dark:hover:bg-cyan-900/20">
                            <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-24 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                            <span className="text-sm font-medium text-gray-400">Loading campaigns...</span>
                        </div>
                    ) : (
                        <DataTable
                            data={filteredCampaigns}
                            columns={columns}
                            rowActions={[
                                { label: '📊 Analytics', value: 'view' },
                                { label: retriggering ? '⏳ Retriggering...' : '🔄 Retrigger', value: 'resend' },
                            ]}
                            onRowAction={handleRowAction}
                            pageSize={10}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
