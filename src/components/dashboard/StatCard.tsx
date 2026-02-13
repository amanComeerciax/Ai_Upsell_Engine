import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    label: string
    value: string | number
    change?: string
    icon: LucideIcon
    iconBg?: string
    iconColor?: string
    trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({
    label,
    value,
    change,
    icon: Icon,
    iconBg = 'bg-primary/20',
    iconColor = 'text-primary',
    trend = 'neutral',
}: StatCardProps) {
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'

    return (
        <div className="group rounded-2xl border border-border/50 bg-secondary/50 p-5 hover:bg-secondary/70 hover:border-border/70 transition-all duration-200">
            <div className="flex items-center justify-between">
                <div className={cn('rounded-full p-2.5', iconBg)}>
                    <Icon className={cn('h-5 w-5', iconColor)} />
                </div>
                {change && (
                    <span className={cn('text-xs font-medium', trendColor)}>{change}</span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
        </div>
    )
}
