import { Search, Bell, ChevronDown, Sun, Moon, Package, ShoppingCart, Sparkles, Eye, Trash2, CheckCheck } from 'lucide-react'
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
    order: { icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
    upsell: { icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50' },
    conversion: { icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    impression: { icon: Eye, color: 'text-amber-500', bg: 'bg-amber-50' },
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
            "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50/80",
            !n.read && "bg-violet-50/30"
        )}>
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold text-gray-700 truncate", !n.read && "text-gray-900")}>
                    {n.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{n.description}</p>
                <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.timestamp)}</p>
            </div>
            {!n.read && (
                <div className="h-2 w-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
            )}
        </div>
    )
}

export function DashboardHeader() {
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
        <header className="glass-header h-[72px] px-8 flex items-center justify-between gap-6 flex-shrink-0 z-40">
            {/* Page Title */}
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                {pageTitle}
            </h1>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 h-10 pl-4 pr-12 bg-white/80 border border-gray-200/80 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
                    />
                    <button className="absolute right-1 h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                        <Search className="h-3.5 w-3.5 text-white" />
                    </button>
                </div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative h-10 w-10 rounded-xl bg-white/80 border border-gray-200/80 flex items-center justify-center hover:bg-violet-50 transition-all duration-300 group overflow-hidden"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <Sun className={`h-4 w-4 text-amber-500 absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                    <Moon className={`h-4 w-4 text-violet-400 absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
                </button>

                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={handleBellClick}
                        className={cn(
                            "relative h-10 w-10 rounded-xl bg-white/80 border border-gray-200/80 flex items-center justify-center hover:bg-violet-50 transition-colors",
                            showNotifs && "bg-violet-50 border-violet-200"
                        )}
                    >
                        <Bell className={cn("h-4 w-4", showNotifs ? "text-violet-500" : "text-gray-500")} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-[9px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            </span>
                        )}
                        {unreadCount === 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-rose-500 rounded-full border-2 border-white opacity-0" />
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifs && (
                        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden z-50 animate-fade-in">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold text-gray-700">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {notifications.length > 0 && (
                                        <>
                                            <button
                                                onClick={markAllRead}
                                                className="h-7 px-2 rounded-lg hover:bg-gray-100 flex items-center gap-1 transition-colors"
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
                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 px-4">
                                        <Bell className="h-8 w-8 text-gray-200 mb-2" />
                                        <p className="text-xs font-medium text-gray-400">No notifications yet</p>
                                        <p className="text-[10px] text-gray-300 mt-0.5">Events will appear here in real-time</p>
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
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200/50">
                    <div className="p-0.5 rounded-full border border-gray-200 bg-white shadow-sm">
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: 'h-9 w-9 rounded-full',
                                    userButtonTrigger: 'focus:shadow-none focus:ring-0',
                                }
                            }}
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 cursor-pointer group">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-violet-600 transition-colors">
                            {user?.fullName || 'User'}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                </div>
            </div>
        </header>
    )
}
