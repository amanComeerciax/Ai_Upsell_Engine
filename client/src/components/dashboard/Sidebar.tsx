import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Megaphone,
    BarChart3,
    Bot,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronLeft,
    Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useClerk } from '@clerk/react'

const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', path: '/dashboard/campaigns', icon: Megaphone },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'AI Models', path: '/dashboard/ai-models', icon: Bot },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
    { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { signOut } = useClerk()

    return (
        <aside
            className={cn(
                'glass-sidebar relative h-screen flex flex-col transition-all duration-500 ease-in-out z-50',
                isCollapsed ? 'w-20' : 'w-[260px]'
            )}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 flex-shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
                        <span className="text-white font-extrabold text-lg leading-none">U</span>
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in overflow-hidden">
                            <h2 className="text-lg font-extrabold tracking-tight leading-none">
                                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Upsell</span>
                                <span className="text-gray-800">AI</span>
                            </h2>
                            <p className="text-[9px] font-semibold text-gray-400 mt-0.5 tracking-wider uppercase">Smart Commerce Engine</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 h-6 w-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-violet-50 hover:border-violet-300 transition-all duration-300 shadow-md z-20 group"
            >
                <ChevronLeft
                    className={cn(
                        'h-3 w-3 text-gray-400 group-hover:text-violet-500 transition-transform duration-500',
                        isCollapsed && 'rotate-180'
                    )}
                />
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.name + item.path}
                            to={item.path}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative',
                                isActive
                                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                            )}
                        >
                            <Icon className={cn(
                                "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-300",
                                isActive ? "text-white" : "group-hover:scale-110"
                            )} />
                            {!isCollapsed && (
                                <span>{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Upgrade CTA */}
            {!isCollapsed && (
                <div className="px-4 pb-4">
                    <div className="px-4 py-5 rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 border border-violet-100/60 relative overflow-hidden">
                        <div className="absolute -top-2 -right-2 opacity-10">
                            <Crown className="h-16 w-16 text-violet-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-700 leading-snug">
                                Unlock <span className="text-violet-600 font-extrabold">Pro</span> features
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Advanced AI, unlimited campaigns</p>
                            <button className="mt-3 text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors bg-white/80 px-3 py-1.5 rounded-lg border border-violet-100 shadow-sm hover:shadow-md">
                                Upgrade Now
                                <span className="text-sm">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className="px-4 pb-6 flex-shrink-0 border-t border-gray-100/80 pt-4">
                <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className={cn(
                        'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group',
                        isCollapsed && 'justify-center px-0'
                    )}
                    title={isCollapsed ? 'Log Out' : undefined}
                >
                    <LogOut className="h-[18px] w-[18px] flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                    {!isCollapsed && <span>Log Out</span>}
                </button>
            </div>
        </aside>
    )
}
