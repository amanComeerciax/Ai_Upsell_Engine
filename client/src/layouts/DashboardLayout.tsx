import { ReactNode, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/Header'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { useSocket } from '@/hooks/useSocket'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children?: ReactNode
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    useSocket(); // Initialize real-time notifications

    return (
        <div className="pastel-gradient-bg flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Header */}
                <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <NotificationProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </NotificationProvider>
    )
}

