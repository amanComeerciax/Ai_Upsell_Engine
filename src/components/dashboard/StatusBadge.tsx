import { cn } from '@/lib/utils'

type BadgeVariant = 'sent' | 'opened' | 'clicked' | 'converted' | 'scheduled' | 'none'

interface StatusBadgeProps {
    status: BadgeVariant
    children?: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
    sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    opened: 'bg-green-500/20 text-green-400 border-green-500/30',
    clicked: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    converted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    scheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    none: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                variantStyles[status]
            )}
        >
            {children || status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}
