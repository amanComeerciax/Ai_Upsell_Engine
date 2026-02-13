import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingLayout } from '@/layouts/LandingLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LandingPage } from '@/pages/LandingPage'
import DashboardPage from '@/pages/Dashboard'
import CampaignsPage from '@/pages/Campaigns'
import AnalyticsPage from '@/pages/Analytics'
import OrdersPage from '@/pages/Orders'
import SettingsPage from '@/pages/Settings'


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page Route */}
                <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="campaigns" element={<CampaignsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
