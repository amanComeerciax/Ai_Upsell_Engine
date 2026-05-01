import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { DashboardPreview } from "@/components/dashboard-preview"
import { HowItWorks } from "@/components/how-it-works"
import { Integrations } from "@/components/integrations"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"
import Ballpit from "@/components/ui/Ballpit"
import { motion } from "framer-motion"

export function LandingPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-white dark:!bg-black">
            <Navbar />
            <Hero />
            <Features />
            <DashboardPreview />
            <HowItWorks />
            <Integrations />
            <Pricing />
            <FAQ />
            <div className="relative h-[500px] w-full overflow-hidden bg-gray-100 dark:bg-black">
              <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
                <Ballpit
                  count={150}
                  gravity={0.5}
                  friction={0.99}
                  wallBounce={0.95}
                  followCursor={false}
                  colors={[0x22d3ee, 0x3b82f6, 0x8b5cf6]}
                  ambientColor={0x111111}
                  ambientIntensity={0.5}
                  lightIntensity={150}
                  minSize={0.25}
                  maxSize={0.75}
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center px-4 pointer-events-auto"
                >
                  <h2 className="text-4xl md:text-6xl font-bold text-black dark:text-white mb-8 tracking-tighter drop-shadow-2xl">
                    Ready to Scale Your <span className="text-cyan-500 dark:text-cyan-400">Upsell Revenue?</span>
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-8 py-4 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-black font-bold rounded-2xl hover:bg-cyan-400 dark:hover:bg-cyan-300 transition-all active:scale-95 shadow-xl shadow-cyan-500/20 w-full sm:w-auto">
                      Get started
                    </button>
                    <button className="px-8 py-4 bg-black/10 dark:bg-white/10 text-black dark:text-white font-bold rounded-2xl backdrop-blur-md border border-black/20 dark:border-white/20 hover:bg-black/20 dark:hover:bg-white/20 transition-all active:scale-95 w-full sm:w-auto">
                      Learn more
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
            <Footer />
        </main>
    )
}
