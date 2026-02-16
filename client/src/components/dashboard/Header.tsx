import { Search, Bell, Moon, Sun } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'
import { useTheme } from '@/components/theme-provider'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function DashboardHeader() {
    const { setTheme } = useTheme()
    const [isDark, setIsDark] = useState(true)

    // Monitor the actual class on html element
    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'))
        }

        // Check immediately
        checkTheme()

        // Also check when anything changes
        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })

        return () => observer.disconnect()
    }, [])

    return (
        <header className="h-16 border-b border-border/40 bg-secondary/30 px-6 flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search campaigns, orders..."
                        className="pl-10 bg-secondary/50 border-border/40 focus-visible:ring-offset-0"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        // Check if dark mode is currently active
                        const isDarkNow = document.documentElement.classList.contains('dark')
                        setTheme(isDarkNow ? 'light' : 'dark')
                    }}
                    className="h-9 w-9"
                >
                    {isDark ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Profile */}
                <div className="flex items-center ml-2 border-l border-border/40 pl-4 h-6">
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: 'h-8 w-8 rounded-xl',
                                userButtonTrigger: 'focus:shadow-none focus:ring-0',
                            }
                        }}
                    />
                </div>
            </div>
        </header>
    )
}
