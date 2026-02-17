import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Zap,
    BarChart3,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronLeft,
    Package,
    Cpu,
    Store
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useMerchant } from '@/contexts/MerchantContext'
import { useClerk } from '@clerk/clerk-react'

const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', path: '/dashboard/campaigns', icon: Zap },
    { name: 'AI Models', path: '/dashboard/ai-models', icon: Cpu },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { merchant, isShopifyConnected } = useMerchant()
    const { signOut } = useClerk()

    return (
        <aside
            className={cn(
                'relative h-screen border-r border-foreground/[0.04] bg-background/50 backdrop-blur-xl transition-all duration-500 ease-in-out z-50',
                isCollapsed ? 'w-20' : 'w-72'
            )}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-foreground/[0.04]">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 animate-fade-in">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Zap className="h-5 w-5 text-white fill-current" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-tight text-foreground uppercase">{merchant?.business_name || 'Velocity'}</h2>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">AI Engine</p>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="mx-auto h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Zap className="h-5 w-5 text-white fill-current" />
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 h-6 w-6 rounded-full border border-foreground/[0.08] bg-background flex items-center justify-center hover:bg-secondary/80 transition-colors shadow-sm"
                >
                    <ChevronLeft
                        className={cn(
                            'h-3 w-3 text-muted-foreground transition-transform duration-300',
                            isCollapsed && 'rotate-180'
                        )}
                    />
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1.5 flex-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden',
                                isActive
                                    ? 'bg-foreground text-background shadow-lg shadow-foreground/5'
                                    : 'text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground'
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 flex-shrink-0 transition-transform duration-300",
                                isActive ? "scale-110" : "group-hover:scale-110"
                            )} />
                            {!isCollapsed && <span className="tracking-tight">{item.name}</span>}

                            {isActive && !isCollapsed && (
                                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* System Status - Bottom Area */}
            <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
                {!isCollapsed && (
                    <>
                        <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.04]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn('h-2 w-2 rounded-full', isShopifyConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                    {isShopifyConnected ? 'Shopify Live' : 'Not Connected'}
                                </span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">
                                        {isShopifyConnected ? merchant?.shopify_shop_name : 'Go to Settings'}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {isShopifyConnected ? `${merchant?.stats.products || 0} products synced` : 'Connect your store'}
                                    </p>
                                </div>
                                <Store className={cn('h-4 w-4', isShopifyConnected ? 'text-emerald-500/50' : 'text-amber-500/50')} />
                            </div>
                        </div>
                    </>
                )}

                <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className={cn(
                        'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500/70 hover:bg-red-500/5 hover:text-red-500 transition-all duration-200'
                    )}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="tracking-tight italic uppercase text-[11px] tracking-[0.1em]">Terminate Session</span>}
                </button>
            </div>
        </aside>
    )
}

