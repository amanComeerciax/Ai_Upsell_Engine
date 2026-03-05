import { Search, Bell, ChevronDown, Sun, Moon } from 'lucide-react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/campaigns': 'Campaigns',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/ai-models': 'AI Models',
    '/dashboard/inventory': 'Inventory',
    '/dashboard/orders': 'Orders',
    '/dashboard/settings': 'Settings',
}

export function DashboardHeader() {
    const [searchQuery, setSearchQuery] = useState('')
    const { user } = useUser()
    const location = useLocation()
    const { theme, toggleTheme, isDark } = useTheme()

    const pageTitle = pageTitles[location.pathname] || 'Dashboard'

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

                {/* Notification */}
                <button className="relative h-10 w-10 rounded-xl bg-white/80 border border-gray-200/80 flex items-center justify-center hover:bg-violet-50 transition-colors">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-rose-500 rounded-full border-2 border-white" />
                </button>

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
