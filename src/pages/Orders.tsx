import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { mockOrders } from '@/data/mockOrders'
import { Order } from '@/types/dashboard'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredOrders = mockOrders.filter((order) => {
        const matchesSearch = order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.upsellStatus === statusFilter
        return matchesSearch && matchesStatus
    })

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
                        <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs"
                        >
                            {product}
                        </span>
                    ))}
                    {row.products.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                            +{row.products.length - 2}
                        </span>
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
            <DataTable
                data={filteredOrders}
                columns={columns}
                rowActions={[
                    { label: 'View Order Details', value: 'view' },
                    { label: 'Schedule Upsell', value: 'schedule' },
                ]}
                onRowAction={(action, row) => {
                    console.log(`Action: ${action} on order ${row.id}`)
                }}
                pageSize={10}
            />
        </div>
    )
}
