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
    Shield,
    Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import { useMerchant } from '@/contexts/MerchantContext'
import { toast } from 'sonner'

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
    const { merchant, createCheckoutSession, isAdmin, isOwner } = useMerchant()

    const handleUpgrade = async () => {
        try {
            await createCheckoutSession()
        } catch (err: any) {
            toast.error(err.message || 'Failed to start checkout')
        }
    }

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

                {/* Team Management - Owner only */}
                {isOwner && (
                    <Link
                        to="/dashboard/team"
                        title={isCollapsed ? 'Team' : undefined}
                        className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative mt-2',
                            location.pathname === '/dashboard/team'
                                ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                        )}
                    >
                        <Users className="h-[18px] w-[18px] flex-shrink-0" />
                        {!isCollapsed && <span>Team</span>}
                    </Link>
                )}

                {isAdmin && (
                    <Link
                        to="/admin"
                        className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative mt-4 border border-indigo-100 bg-indigo-50/30',
                            location.pathname.startsWith('/admin')
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'text-indigo-600 hover:bg-indigo-50'
                        )}
                    >
                        <Shield className="h-[18px] w-[18px] flex-shrink-0" />
                        {!isCollapsed && <span>Admin Panel</span>}
                    </Link>
                )}
            </nav>

            {/* Upgrade CTA */}
            {!isCollapsed && merchant?.plan !== 'pro' && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="px-4 py-5 rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 border border-violet-100/60 relative overflow-hidden group/cta">
                        <div className="absolute -top-2 -right-2 opacity-10 group-hover/cta:scale-110 group-hover/cta:rotate-12 transition-transform duration-500">
                            <Crown className="h-16 w-16 text-violet-500" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-700 leading-snug">
                                Unlock <span className="text-violet-600 font-extrabold">Pro</span> features
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Advanced AI, unlimited campaigns</p>
                            <button 
                                onClick={handleUpgrade}
                                className="mt-3 w-full flex items-center justify-between text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <span>Upgrade Now</span>
                                <span className="text-sm">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isCollapsed && merchant?.plan === 'pro' && (
                 <div className="px-4 pb-4">
                    <div className="px-4 py-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Crown className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-700">Pro Plan Active</p>
                            <p className="text-[9px] text-emerald-600/70">Unlimited Power</p>
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
