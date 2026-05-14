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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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
            <div className="rounded-lg border border-slate-100 overflow-hidden bg-white">
                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider text-slate-400 py-3",
                                        column.sortable && 'cursor-pointer hover:text-slate-600 transition-colors'
                                    )}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && sortKey === column.key && (
                                            sortDirection === 'asc' ? (
                                                <ChevronUp className="h-3 w-3 text-[#06B6D4]" />
                                            ) : (
                                                <ChevronDown className="h-3 w-3 text-[#06B6D4]" />
                                            )
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                            {rowActions && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right px-6">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="border-slate-50 hover:bg-cyan-50/30 transition-colors">
                                {columns.map((column) => (
                                    <TableCell key={column.key} className="py-3.5">
                                        <div className="text-sm font-medium text-slate-700">
                                            {column.render ? column.render(row) : row[column.key]}
                                        </div>
                                    </TableCell>
                                ))}
                                {rowActions && (
                                    <TableCell className="text-right px-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-lg p-2">
                                                {rowActions.map((action) => (
                                                    <DropdownMenuItem
                                                        key={action.value}
                                                        onClick={() => onRowAction?.(action.value, row)}
                                                        className="text-xs font-semibold rounded-md"
                                                    >
                                                        {action.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} records
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-4 text-[10px] font-bold uppercase tracking-tight rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-[10px] font-black tracking-widest text-slate-400">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-4 text-[10px] font-bold uppercase tracking-tight rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
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
