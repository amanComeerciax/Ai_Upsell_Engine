import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/Header'
import { useSocket } from '@/hooks/useSocket'

interface DashboardLayoutProps {
    children?: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    useSocket(); // Initialize real-time notifications

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <DashboardHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    )
}
