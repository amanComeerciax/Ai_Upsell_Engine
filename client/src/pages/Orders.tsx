import { useState, useEffect } from 'react'
import { Search, Loader2, CalendarPlus, ShoppingBag, Filter, TrendingUp, Package, ArrowUpRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Order } from '@/types/dashboard'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiClient.get('/orders');
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter((order) => {
        const matchesSearch = order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.upsellStatus === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleRowAction = (action: string, row: Order) => {
        if (action === 'view') {
            setViewingOrder(row)
        } else if (action === 'schedule') {
            alert(`🚀 Manual Upsell Scheduling\n\nThis will queue a manual upsell campaign for:\n👤 ${row.customerName} (${row.customerEmail})\n📦 Products: ${row.products.join(', ')}\n\n⚡ Feature coming in the next release.`)
        }
    }

    // Summary stats
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((acc, o) => acc + (o.amount || 0), 0)
    const scheduledCount = orders.filter(o => o.upsellStatus === 'scheduled' || o.upsellStatus === 'sent').length

    const columns: Column<Order>[] = [
        {
            key: 'id',
            header: 'Order ID',
            sortable: true,
            render: (row) => <span className="font-mono text-xs font-semibold text-violet-500">{row.id}</span>
        },
        {
            key: 'customerName',
            header: 'Customer',
            sortable: true,
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-sm text-gray-700">{row.customerName}</p>
                    <p className="text-xs text-gray-400">{row.customerEmail}</p>
                </div>
            ),
        },
        {
            key: 'products',
            header: 'Products',
            render: (row) => (
                <div className="flex gap-1.5 flex-wrap">
                    {row.products.slice(0, 2).map((product, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-medium">
                            {product}
                        </span>
                    ))}
                    {row.products.length > 2 && (
                        <span className="text-xs text-gray-300 font-medium">+{row.products.length - 2}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            sortable: true,
            render: (row) => <span className="font-bold text-sm text-gray-800">₹{row.amount.toLocaleString()}</span>,
        },
        {
            key: 'orderDate',
            header: 'Date',
            sortable: true,
            render: (row) => (
                <span className="text-xs font-medium text-gray-400">
                    {new Date(row.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
            ),
        },
        {
            key: 'upsellStatus',
            header: 'Status',
            sortable: true,
            render: (row) => <StatusBadge status={row.upsellStatus} />,
        },
    ]

    return (
        <div className="space-y-5 animate-fade-in pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <ShoppingBag className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-semibold text-violet-500">Transaction Ledger</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium max-w-lg">
                        Manage transactions and <span className="text-gray-700 font-semibold">orchestrate</span> upsell recovery strategies.
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Total Orders</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{totalOrders}</p>
                    </div>
                    <ShoppingBag className="h-4 w-4 text-violet-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Revenue</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">With Upsell</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{scheduledCount}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-blue-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Products</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{orders.reduce((acc, o) => acc + o.products.length, 0)}</p>
                    </div>
                    <Package className="h-4 w-4 text-amber-400" />
                </div>
            </div>

            <div className="space-y-4">
                {/* Filters */}
                <div className="glass-card p-4 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by customer or order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/60 border-gray-200 pl-10 h-10 rounded-xl text-sm focus-visible:ring-violet-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40 bg-white/60 border-gray-200 h-10 text-xs font-semibold rounded-xl">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-200 bg-white shadow-lg">
                                <SelectItem value="all" className="text-xs font-medium">All Statuses</SelectItem>
                                <SelectItem value="scheduled" className="text-xs font-medium">Scheduled</SelectItem>
                                <SelectItem value="sent" className="text-xs font-medium">Sent</SelectItem>
                                <SelectItem value="none" className="text-xs font-medium">No Upsell</SelectItem>
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
                            <span className="text-sm font-medium text-gray-400">Loading orders...</span>
                        </div>
                    ) : (
                        <DataTable
                            data={filteredOrders}
                            columns={columns}
                            rowActions={[
                                { label: '👁️ View Details', value: 'view' },
                                { label: '🚀 Schedule Upsell', value: 'schedule' },
                            ]}
                            onRowAction={handleRowAction}
                            pageSize={10}
                        />
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {viewingOrder && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setViewingOrder(null) }}
                >
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-xl space-y-6 shadow-glass-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <ShoppingBag className="h-24 w-24 text-gray-400" />
                        </div>

                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                                <p className="text-xs font-medium text-gray-400 mt-1 font-mono">ID: {viewingOrder.id}</p>
                            </div>
                            <StatusBadge status={viewingOrder.upsellStatus} />
                        </div>

                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Customer</p>
                                <p className="font-semibold text-gray-800">{viewingOrder.customerName}</p>
                                <p className="text-sm text-gray-500">{viewingOrder.customerEmail}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date</p>
                                <p className="font-semibold text-gray-800">{new Date(viewingOrder.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Amount</p>
                                <p className="font-bold text-2xl text-emerald-500">₹{viewingOrder.amount.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Upsell Status</p>
                                <StatusBadge status={viewingOrder.upsellStatus} />
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Products</p>
                            <div className="flex flex-wrap gap-2">
                                {viewingOrder.products.map((p, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-xl bg-violet-50 text-violet-600 text-xs font-medium border border-violet-100">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2 relative z-10">
                            {viewingOrder.upsellStatus === 'none' && (
                                <Button
                                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/20"
                                    onClick={() => {
                                        setViewingOrder(null)
                                        alert(`🚀 Manual upsell scheduling for ${viewingOrder.customerName} — coming soon!`)
                                    }}
                                >
                                    <CalendarPlus className="h-4 w-4 mr-2" />
                                    Schedule Upsell
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setViewingOrder(null)}
                                className="flex-1 h-11 rounded-xl border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
