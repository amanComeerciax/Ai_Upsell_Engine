import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, Filter, Zap, Loader2, Sparkles, Target, ArrowUpRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
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

    // Summary stats
    const totalCampaigns = campaigns.length
    const convertedCount = campaigns.filter(c => c.status === 'converted').length
    const activeCount = campaigns.filter(c => c.status === 'active').length
    const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0)

    const columns: Column<Campaign>[] = [
        {
            key: 'campaignId',
            header: 'ID',
            sortable: true,
            render: (row) => <span className="font-mono text-xs font-semibold text-violet-500">{row.campaignId}</span>
        },
        {
            key: 'customerEmail',
            header: 'Recipient',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <div className="font-semibold text-sm text-gray-700">{row.customerEmail}</div>
                    <div className="text-xs text-gray-400">{row.customerName}</div>
                </div>
            )
        },
        {
            key: 'productName',
            header: 'Recommended',
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-600 text-xs font-semibold">
                    {row.productName}
                </span>
            ),
        },
        {
            key: 'discountPercent',
            header: 'Discount',
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold">
                    -{row.discountPercent}%
                </span>
            ),
        },
        {
            key: 'impressionCount' as any,
            header: 'Views',
            sortable: true,
            render: (row: any) => (
                <span className={cn("text-xs font-semibold", row.impressionCount > 0 ? 'text-blue-500' : 'text-gray-300')}>
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
                    active: 'bg-blue-50 text-blue-600',
                    converted: 'bg-emerald-50 text-emerald-600',
                    expired: 'bg-red-50 text-red-500',
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
                        <Zap className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-semibold text-violet-500">Real-time Deployment</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium max-w-lg">
                        Orchestrate and monitor your <span className="text-gray-700 font-semibold">AI-driven</span> upsell campaigns.
                    </p>
                </div>
                <Button className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold px-5 h-10 shadow-lg shadow-violet-500/20">
                    <Plus className="h-4 w-4 mr-2" />
                    New Integration
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Total</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{totalCampaigns}</p>
                    </div>
                    <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Active</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{activeCount}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Converted</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{convertedCount}</p>
                    </div>
                    <Target className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Revenue</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                </div>
            </div>

            <div className="space-y-4">
                {/* Filters */}
                <div className="glass-card p-4 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by email or campaign ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/60 border-gray-200 pl-10 h-10 rounded-xl text-sm focus-visible:ring-violet-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-36 bg-white/60 border-gray-200 h-10 text-xs font-semibold rounded-xl">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-200 bg-white shadow-lg">
                                <SelectItem value="all" className="text-xs font-medium">All States</SelectItem>
                                <SelectItem value="active" className="text-xs font-medium">Active</SelectItem>
                                <SelectItem value="converted" className="text-xs font-medium">Converted</SelectItem>
                                <SelectItem value="expired" className="text-xs font-medium">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-10 w-10 border-gray-200 rounded-xl flex items-center justify-center p-0 hover:bg-violet-50">
                            <Filter className="h-4 w-4 text-gray-400" />
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
