import { LucideIcon, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    label: string
    value: string | number
    change?: string
    icon: LucideIcon
    iconBg?: string
    iconColor?: string
    trend?: 'up' | 'down' | 'neutral'
    progress?: number
    progressColor?: string
}

function CircularProgress({ value, color = '#06B6D4', size = 44 }: { value: number; color?: string; size?: number }) {
    const strokeWidth = 3.5
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
        <svg width={size} height={size} className="circular-progress">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f0f0f0"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy="0.35em"
                fill="#555"
                fontSize="9"
                fontWeight="700"
                style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
            >
                {value}%
            </text>
        </svg>
    )
}

export function StatCard({
    label,
    value,
    change: _change,
    icon: Icon,
    iconBg = 'bg-cyan-50',
    iconColor = 'text-[#06B6D4]',
    trend: _trend = 'neutral',
    progress = 0,
    progressColor = '#06B6D4',
}: StatCardProps) {
    return (
        <div className="glass-card p-5 group">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                        'h-12 w-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105',
                        iconBg
                    )}>
                        <Icon className={cn('h-5 w-5', iconColor)} />
                    </div>

                    {/* Value & Label */}
                    <div className="pt-0.5">
                        <p className="text-2xl font-bold text-slate-800 tracking-tight leading-none">
                            {value}
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">
                            {label}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Circular Progress */}
                    {progress > 0 && (
                        <CircularProgress value={progress} color={progressColor} />
                    )}

                    {/* Three dots */}
                    <button className="text-gray-300 hover:text-gray-500 transition-colors -mt-0.5">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
