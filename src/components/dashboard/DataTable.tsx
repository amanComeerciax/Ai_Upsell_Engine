import { useState } from 'react'
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface Column<T> {
    key: string
    header: string
    sortable?: boolean
    render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    onRowAction?: (action: string, row: T) => void
    rowActions?: { label: string; value: string }[]
    pageSize?: number
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    onRowAction,
    rowActions,
    pageSize = 10,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [currentPage, setCurrentPage] = useState(1)

    // Sorting logic
    const sortedData = [...data].sort((a, b) => {
        if (!sortKey) return 0
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
    })

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = sortedData.slice(startIndex, endIndex)

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-xl border border-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border/40">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={cn(
                                            'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                                            column.sortable && 'cursor-pointer hover:text-foreground transition-colors'
                                        )}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.header}
                                            {column.sortable && sortKey === column.key && (
                                                sortDirection === 'asc' ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                )
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {rowActions && <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-secondary/30 transition-colors"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-4 py-3 text-sm text-foreground"
                                        >
                                            {column.render ? column.render(row) : row[column.key]}
                                        </td>
                                    ))}
                                    {rowActions && (
                                        <td className="px-4 py-3 text-sm text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {rowActions.map((action) => (
                                                        <DropdownMenuItem
                                                            key={action.value}
                                                            onClick={() => onRowAction?.(action.value, row)}
                                                        >
                                                            {action.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
