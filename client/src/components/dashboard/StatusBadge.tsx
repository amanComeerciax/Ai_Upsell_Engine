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
        bg: 'bg-cyan-50',
        text: 'text-[#06B6D4]',
        label: 'Active',
    },
    sent: {
        bg: 'bg-cyan-50',
        text: 'text-[#06B6D4]',
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
        bg: 'bg-slate-50',
        text: 'text-slate-500',
        label: status,
    }

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                config.bg,
                config.text,
                className
            )}
        >
            {config.label}
        </span>
    )
}
