import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { MerchantProvider } from '@/contexts/MerchantContext'
import { LandingLayout } from '@/layouts/LandingLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LandingPage } from '@/pages/LandingPage'
import DashboardPage from '@/pages/Dashboard'
import CampaignsPage from '@/pages/Campaigns'
import AnalyticsPage from '@/pages/Analytics'
import OrdersPage from '@/pages/Orders'
import SettingsPage from '@/pages/Settings'
import AIModelsPage from '@/pages/AIModels'
import InventoryPage from '@/pages/Inventory'
import LoginPage from '@/pages/LoginPage'
import SignUpPage from '@/pages/SignUpPage'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

function App() {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <BrowserRouter>
                <Routes>
                    {/* Landing Page Route */}
                    <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />

                    {/* Auth Routes */}
                    <Route path="/login/*" element={<LoginPage />} />
                    <Route path="/signup/*" element={<SignUpPage />} />

                    {/* Dashboard Routes - Protected */}
                    <Route
                        path="/dashboard"
                        element={
                            <>
                                <SignedIn>
                                    <MerchantProvider>
                                        <DashboardLayout />
                                    </MerchantProvider>
                                </SignedIn>
                                <SignedOut>
                                    <Navigate to="/login" replace />
                                </SignedOut>
                            </>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        <Route path="campaigns" element={<CampaignsPage />} />
                        <Route path="ai-models" element={<AIModelsPage />} />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ClerkProvider>
    )
}

export default App

