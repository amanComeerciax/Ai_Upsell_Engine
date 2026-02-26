import { useState, useEffect } from 'react'
import { Search, Loader2, CalendarPlus } from 'lucide-react'
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
            alert(`🚀 Manual Upsell Scheduling\n\nThis will queue a manual upsell campaign for:\n👤 ${row.customerName} (${row.customerEmail})\n📦 Products: ${row.products.join(', ')}\n\n⚡ Feature coming in the next release — this will allow you to trigger AI-powered upsells for non-automated orders.`)
        }
    }

    const columns: Column<Order>[] = [
        { key: 'id', header: 'Order ID', sortable: true },
        {
            key: 'customerName',
            header: 'Customer',
            sortable: true,
            render: (row) => (
                <div>
                    <p className="font-medium text-foreground">{row.customerName}</p>
                    <p className="text-xs text-muted-foreground">{row.customerEmail}</p>
                </div>
            ),
        },
        {
            key: 'products',
            header: 'Products',
            render: (row) => (
                <div className="flex gap-1 flex-wrap max-w-xs">
                    {row.products.slice(0, 2).map((product, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs">
                            {product}
                        </span>
                    ))}
                    {row.products.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{row.products.length - 2}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'Order Amount',
            sortable: true,
            render: (row) => `₹${row.amount.toLocaleString()}`,
        },
        {
            key: 'orderDate',
            header: 'Order Date',
            sortable: true,
            render: (row) => new Date(row.orderDate).toLocaleDateString(),
        },
        {
            key: 'upsellStatus',
            header: 'Upsell Status',
            sortable: true,
            render: (row) => <StatusBadge status={row.upsellStatus} />,
        },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Orders</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage orders and schedule upsell campaigns
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end">
                <div className="flex-1 max-w-md">
                    <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by customer or order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="w-48">
                    <label className="text-sm font-medium text-foreground mb-2 block">Upsell Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="none">No Upsell</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="secondary">Apply Filters</Button>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Loading orders...</span>
                </div>
            ) : (
                <DataTable
                    data={filteredOrders}
                    columns={columns}
                    rowActions={[
                        { label: '👁️ View Order Details', value: 'view' },
                        { label: '🚀 Schedule Upsell', value: 'schedule' },
                    ]}
                    onRowAction={handleRowAction}
                    pageSize={10}
                />
            )}

            {/* ── Order Details Modal ── */}
            {viewingOrder && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setViewingOrder(null) }}
                >
                    <div className="bg-background border border-border rounded-3xl p-8 w-full max-w-lg space-y-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Order Details</h2>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{viewingOrder.id}</p>
                            </div>
                            <StatusBadge status={viewingOrder.upsellStatus} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</p>
                                <p className="font-bold text-sm">{viewingOrder.customerName}</p>
                                <p className="text-xs text-muted-foreground">{viewingOrder.customerEmail}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Date</p>
                                <p className="font-bold text-sm">{new Date(viewingOrder.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Amount</p>
                                <p className="font-black text-xl text-emerald-500">₹{viewingOrder.amount.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upsell Status</p>
                                <StatusBadge status={viewingOrder.upsellStatus} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Products Ordered</p>
                            <div className="flex flex-wrap gap-2">
                                {viewingOrder.products.map((p, i) => (
                                    <span key={i} className="px-3 py-1 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] text-xs font-bold">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {viewingOrder.upsellStatus === 'none' && (
                                <Button
                                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 rounded-xl font-black uppercase tracking-widest text-[11px]"
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
                                className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[11px] border-foreground/[0.08]"
                                onClick={() => setViewingOrder(null)}
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
