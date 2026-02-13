import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { DashboardPreview } from "@/components/dashboard-preview"
import { HowItWorks } from "@/components/how-it-works"
import { Integrations } from "@/components/integrations"
import { Pricing } from "@/components/pricing"
import { Footer } from "@/components/footer"

export function LandingPage() {
    return (
        <main className="relative min-h-screen overflow-hidden">
            <Navbar />
            <Hero />
            <Features />
            <DashboardPreview />
            <HowItWorks />
            <Integrations />
            <Pricing />
            <Footer />
        </main>
    )
}
