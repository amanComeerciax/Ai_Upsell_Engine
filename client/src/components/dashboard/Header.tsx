import { Search, Bell, Sun, Moon, Package, ShoppingCart, Sparkles, Eye, Trash2, CheckCheck, Menu } from 'lucide-react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@/components/theme-provider'
import { useNotifications, Notification } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/campaigns': 'Campaigns',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/ai-models': 'AI Models',
    '/dashboard/inventory': 'Inventory',
    '/dashboard/orders': 'Orders',
    '/dashboard/settings': 'Settings',
}

const notifIcons: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
    order: { icon: ShoppingCart, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    upsell: { icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
    conversion: { icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    impression: { icon: Eye, color: 'text-slate-500', bg: 'bg-slate-50' },
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

function NotificationItem({ n }: { n: Notification }) {
    const config = notifIcons[n.type] || notifIcons.order
    const Icon = config.icon
    return (
        <div className={cn(
            "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
            !n.read && "bg-cyan-50/30 dark:bg-cyan-900/20"
        )}>
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.bg, "dark:bg-white/5")}>
                <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold text-slate-700 dark:text-slate-200 truncate", !n.read && "text-slate-900 dark:text-white")}>
                    {n.title}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{n.description}</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">{timeAgo(n.timestamp)}</p>
            </div>
            {!n.read && (
                <div className="h-2 w-2 rounded-full bg-[#06B6D4] mt-2 flex-shrink-0" />
            )}
        </div>
    )
}

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [showNotifs, setShowNotifs] = useState(false)
    const { user } = useUser()
    const location = useLocation()
    const { toggleTheme, isDark } = useTheme()
    const { notifications, unreadCount, markAllRead, clearAll } = useNotifications()
    const dropdownRef = useRef<HTMLDivElement>(null)

    const pageTitle = pageTitles[location.pathname] || 'Dashboard'

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowNotifs(false)
            }
        }
        if (showNotifs) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showNotifs])

    const handleBellClick = () => {
        setShowNotifs(!showNotifs)
        if (!showNotifs && unreadCount > 0) {
            // Mark as read after a short delay so user sees the unread state
            setTimeout(() => markAllRead(), 2000)
        }
    }

    return (
        <header className="glass-header h-[72px] px-4 md:px-8 flex items-center justify-between gap-4 md:gap-6 flex-shrink-0 z-40">
            {/* Page Title & Mobile Menu */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </button>
                <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight truncate max-w-[150px] sm:max-w-none">
                    {pageTitle}
                </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Search Bar */}
                <div className="hidden md:flex relative group max-w-xs xl:max-w-md w-full">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 h-10 pl-4 pr-12 bg-white/80 dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-700/50 rounded-xl text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 focus:border-cyan-200 dark:focus:border-cyan-800/50 transition-all"
                    />
                    <button className="absolute right-1 h-8 w-8 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                        <Search className="h-3.5 w-3.5 text-white" />
                    </button>
                </div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative h-10 w-10 rounded-lg bg-white/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-center hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-300 group overflow-hidden"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <Sun className={`h-4 w-4 text-amber-500 absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                    <Moon className={`h-4 w-4 text-[#06B6D4] absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
                </button>

                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={handleBellClick}
                        className={cn(
                            "relative h-10 w-10 rounded-lg bg-white/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-center hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors",
                            showNotifs && "bg-cyan-50 dark:bg-cyan-900/40 border-cyan-200 dark:border-cyan-800"
                        )}
                    >
                        <Bell className={cn("h-4 w-4", showNotifs ? "text-[#06B6D4]" : "text-slate-500 dark:text-slate-400")} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            </span>
                        )}
                        {unreadCount === 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-rose-500 rounded-full border-2 border-white opacity-0" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifs && (
                        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden z-50 animate-fade-in">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded-md">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {notifications.length > 0 && (
                                        <>
                                            <button
                                                onClick={markAllRead}
                                                className="h-7 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                                                title="Mark all read"
                                            >
                                                <CheckCheck className="h-3 w-3 text-gray-400" />
                                            </button>
                                            <button
                                                onClick={clearAll}
                                                className="h-7 px-2 rounded-lg hover:bg-red-50 flex items-center gap-1 transition-colors"
                                                title="Clear all"
                                            >
                                                <Trash2 className="h-3 w-3 text-gray-400" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 px-4">
                                        <Bell className="h-8 w-8 text-slate-200 mb-2" />
                                        <p className="text-xs font-medium text-slate-400">No notifications yet</p>
                                        <p className="text-[10px] text-slate-300 mt-0.5">Events will appear here in real-time</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <NotificationItem key={n.id} n={n} />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200/50 dark:border-slate-700/50">
                    <div className="p-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <UserButton
                            appearance={{
                                variables: {
                                    colorPrimary: '#06B6D4',
                                    colorBackground: '#0d0d1a',
                                    colorText: 'white',
                                    colorTextSecondary: 'rgba(255,255,255,0.5)',
                                    colorNeutral: 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontFamily: "'Inter', system-ui, sans-serif",
                                },
                                elements: {
                                    userButtonAvatarBox: 'h-9 w-9 rounded-full',
                                    userButtonTrigger: 'focus:shadow-none focus:ring-0',
                                    userButtonPopoverCard: {
                                        background: '#0d0d1a',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                                    },
                                    userButtonPopoverActions: {
                                        background: '#0d0d1a',
                                    },
                                    userButtonPopoverActionButton: {
                                        color: 'white',
                                        transition: 'background 0.2s',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.05)',
                                        }
                                    },
                                    userButtonPopoverActionButtonText: {
                                        color: 'white',
                                    },
                                    userButtonPopoverActionButtonIcon: {
                                        color: '#06B6D4',
                                    },
                                    userButtonPopoverFooter: {
                                        background: '#0d0d1a',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[100px]">
                            {user?.firstName || 'User'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Merchant</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
