import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Mail,
    BarChart3,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', path: '/dashboard/campaigns', icon: Mail },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                'h-screen border-r border-border/40 bg-secondary/30 transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
                {!isCollapsed && (
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">AI Upsell Engine</h2>
                        <p className="text-[10px] text-muted-foreground">Admin Dashboard</p>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"
                >
                    <ChevronLeft
                        className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            isCollapsed && 'rotate-180'
                        )}
                    />
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-4 left-0 right-0 px-3">
                <button
                    className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors'
                    )}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    )
}
