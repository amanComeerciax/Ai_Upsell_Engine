import { Suspense, lazy } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { motion } from "framer-motion"

// Lazy load all below-fold sections — they load only when needed
const Features = lazy(() => import("@/components/features").then(m => ({ default: m.Features })))
const DashboardPreview = lazy(() => import("@/components/dashboard-preview").then(m => ({ default: m.DashboardPreview })))
const HowItWorks = lazy(() => import("@/components/how-it-works").then(m => ({ default: m.HowItWorks })))
const Integrations = lazy(() => import("@/components/integrations").then(m => ({ default: m.Integrations })))
const Pricing = lazy(() => import("@/components/pricing").then(m => ({ default: m.Pricing })))
const FAQ = lazy(() => import("@/components/faq").then(m => ({ default: m.FAQ })))
const Footer = lazy(() => import("@/components/footer").then(m => ({ default: m.Footer })))
const Ballpit = lazy(() => import("@/components/ui/Ballpit"))

// Lightweight section skeleton — a simple pulse placeholder
function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`w-full ${height} flex items-center justify-center bg-white dark:bg-black`}>
      <div className="w-12 h-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
    </div>
  )
}

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-x-hidden bg-white dark:!bg-black">
        {/* Hero loads immediately — no lazy load */}
        <Hero />

        {/* Below-fold sections: lazy loaded with spinner fallback */}
        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <Features />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
          <DashboardPreview />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <HowItWorks />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <Integrations />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-[700px]" />}>
          <Pricing />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <FAQ />
        </Suspense>

        {/* CTA + Ballpit — reduced ball count for perf */}
        <div className="relative h-[500px] w-full overflow-hidden bg-gray-100 dark:bg-black">
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20" />}>
            <Ballpit
              count={60}
              gravity={0.5}
              friction={0.99}
              wallBounce={0.95}
              followCursor={false}
              colors={[0x22d3ee, 0x3b82f6, 0x8b5cf6]}
              ambientColor={0x111111}
              ambientIntensity={0.5}
              lightIntensity={100}
              minSize={0.25}
              maxSize={0.75}
            />
          </Suspense>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center px-4 pointer-events-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-8 tracking-tighter drop-shadow-2xl">
                Ready to Scale Your{" "}
                <span className="text-cyan-500 dark:text-cyan-400">Upsell Revenue?</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-cyan-500/20 w-full sm:w-auto">
                  Get started
                </button>
                <button className="px-8 py-4 bg-black/10 dark:bg-white/10 text-black dark:text-white font-bold rounded-2xl backdrop-blur-md border border-black/20 dark:border-white/20 hover:bg-black/20 dark:hover:bg-white/20 transition-all active:scale-95 w-full sm:w-auto">
                  Learn more
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <Footer />
        </Suspense>
      </main>
    </>
  )
}
