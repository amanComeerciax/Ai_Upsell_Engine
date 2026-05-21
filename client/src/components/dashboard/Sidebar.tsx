import { Link, useLocation } from 'react-router-dom'
import { UpsellLogo } from '@/components/Logo'
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

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
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
                'glass-sidebar fixed lg:relative h-screen flex flex-col transition-all duration-500 ease-in-out z-50',
                isCollapsed ? 'w-20' : 'w-[260px]',
                'lg:translate-x-0', // Always show on desktop
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0' // Slide on mobile
            )}
        >
            {/* Close button for mobile */}
            <button 
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Logo Section */}
            <div className={cn(
                "h-20 flex items-center flex-shrink-0 transition-all duration-500",
                isCollapsed ? "justify-center" : "px-6"
            )}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-7 w-7 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <UpsellLogo className="w-full h-full drop-shadow-md" />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in overflow-hidden">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                                Upsell<span className="text-cyan-500">.ai</span>
                            </h2>
                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5 tracking-wider uppercase">Smart Commerce Engine</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 shadow-md z-20 group"
            >
                <ChevronLeft
                    className={cn(
                        'h-3 w-3 text-slate-400 group-hover:text-[#06B6D4] transition-transform duration-500',
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
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 group relative',
                                isActive
                                    ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-l-2 border-[#06B6D4]'
                                    : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                            )}
                        >
                            <Icon className={cn(
                                "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-300",
                                isActive ? "text-[#06B6D4]" : "group-hover:scale-110"
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
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 group relative mt-2',
                            location.pathname === '/dashboard/team'
                                ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-l-2 border-[#06B6D4]'
                                : 'text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
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
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 group relative mt-4 border border-cyan-100 dark:border-cyan-900/30 bg-cyan-50/30 dark:bg-cyan-900/10',
                            location.pathname.startsWith('/admin')
                                ? 'bg-[#06B6D4] text-white shadow-lg shadow-cyan-500/25'
                                : 'text-[#06B6D4] hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
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
                    <div className="px-4 py-5 rounded-lg bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30 relative overflow-hidden group/cta">
                        <div className="absolute -top-2 -right-2 opacity-10 group-hover/cta:scale-110 group-hover/cta:rotate-12 transition-transform duration-500">
                            <Crown className="h-16 w-16 text-[#06B6D4]" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug">
                                Unlock <span className="text-[#06B6D4] font-extrabold">Pro</span> features
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Advanced AI, unlimited campaigns</p>
                            <button 
                                onClick={handleUpgrade}
                                className="mt-3 w-full flex items-center justify-between text-xs font-bold text-white bg-[#06B6D4] px-4 py-2 rounded-lg shadow-lg shadow-cyan-500/20 hover:bg-[#0891B2] hover:-translate-y-0.5 transition-all duration-300"
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
                    <div className="px-4 py-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Crown className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Pro Plan Active</p>
                            <p className="text-[9px] text-emerald-600/70 dark:text-emerald-500/60">Unlimited Power</p>
                        </div>
                    </div>
                 </div>
            )}

            {/* Logout */}
            <div className="px-4 pb-6 flex-shrink-0 border-t border-slate-100 pt-4">
                <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className={cn(
                        'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group',
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
