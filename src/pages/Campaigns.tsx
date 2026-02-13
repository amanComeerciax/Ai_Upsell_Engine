import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, Column } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { mockCampaigns } from '@/data/mockCampaigns'
import { Campaign } from '@/types/dashboard'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function CampaignsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Filter campaigns
    const filteredCampaigns = mockCampaigns.filter((campaign) => {
        const matchesSearch = campaign.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const columns: Column<Campaign>[] = [
        { key: 'id', header: 'Campaign ID', sortable: true },
        { key: 'orderId', header: 'Order ID', sortable: true },
        { key: 'customerEmail', header: 'Customer Email', sortable: true },
        {
            key: 'productsRecommended',
            header: 'Products',
            render: (row) => (
                <div className="flex gap-1 flex-wrap max-w-xs">
                    {row.productsRecommended.slice(0, 2).map((product, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs"
                        >
                            {product}
                        </span>
                    ))}
                    {row.productsRecommended.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                            +{row.productsRecommended.length - 2}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'messagePreview',
            header: 'Message Preview',
            render: (row) => (
                <span className="text-muted-foreground text-xs max-w-xs truncate block">
                    {row.messagePreview}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'sentAt',
            header: 'Sent At',
            sortable: true,
            render: (row) => new Date(row.sentAt).toLocaleString(),
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
                    <h1 className="text-3xl font-bold text-foreground">Campaign Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and monitor all your upsell campaigns
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end">
                <div className="flex-1 max-w-md">
                    <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email or campaign ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="w-48">
                    <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="opened">Opened</SelectItem>
                            <SelectItem value="clicked">Clicked</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="secondary">Apply Filters</Button>
            </div>

            {/* Campaigns Table */}
            <DataTable
                data={filteredCampaigns}
                columns={columns}
                rowActions={[
                    { label: 'View Details', value: 'view' },
                    { label: 'Resend Campaign', value: 'resend' },
                    { label: 'Delete', value: 'delete' },
                ]}
                onRowAction={(action, row) => {
                    console.log(`Action: ${action} on campaign ${row.id}`)
                }}
                pageSize={10}
            />
        </div>
    )
}
