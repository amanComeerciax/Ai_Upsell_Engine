import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    status: string
    className?: string
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    completed: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        label: 'Complete',
    },
    complete: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        label: 'Complete',
    },
    converted: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        label: 'Complete',
    },
    pending: {
        bg: 'bg-orange-50',
        text: 'text-orange-500',
        label: 'Pending',
    },
    cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-500',
        label: 'Cancelled',
    },
    failed: {
        bg: 'bg-red-50',
        text: 'text-red-500',
        label: 'Cancelled',
    },
    active: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        label: 'Active',
    },
    sent: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        label: 'Sent',
    },
    in_stock: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        label: 'In Stock',
    },
    low_stock: {
        bg: 'bg-orange-50',
        text: 'text-orange-500',
        label: 'Low Stock',
    },
    out_of_stock: {
        bg: 'bg-red-50',
        text: 'text-red-500',
        label: 'Out of Stock',
    },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status?.toLowerCase()?.replace(/\s+/g, '_')
    const config = statusConfig[normalizedStatus] || {
        bg: 'bg-gray-50',
        text: 'text-gray-500',
        label: status,
    }

    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                config.bg,
                config.text,
                className
            )}
        >
            {config.label}
        </span>
    )
}
