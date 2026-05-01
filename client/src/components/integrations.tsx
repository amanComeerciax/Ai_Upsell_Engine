import { ArrowRight, Code2, Database, Terminal } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import CircularGallery from "@/components/ui/CircularGallery"

function ShinyText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      <style>
        {`
            @keyframes text-shine {
              0% { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
            .animate-text-shine {
              animation: text-shine 3s linear infinite;
              will-change: background-position;
            }
          `}
      </style>
      <span
        className={cn(
          "inline-block relative from-[#0070A0] via-black to-[#0070A0] dark:from-[#64CEFB] dark:via-white dark:to-[#64CEFB] bg-[length:200%_auto] bg-clip-text text-transparent [background-image:linear-gradient(100deg,var(--tw-gradient-stops))] animate-text-shine",
          className
        )}
      >
        {text}
      </span>
    </>
  )
}



export function Integrations() {
  return (
    <section id="integrations" className="relative py-24 md:py-40 bg-white dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      {/* Background Section Transition Glow */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        <div className="absolute top-0 w-1/2 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-[1px]" />
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center max-w-4xl mx-auto mb-20 md:mb-28"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 mb-8">
            <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Ecosystem</span>
          </div>
          <h2 className="flex flex-col items-center leading-[0.85] tracking-tighter w-full px-2">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-black dark:text-white max-w-full">
              Fits Your Existing
            </span>
            <span className="mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold pb-2 max-w-full">
              <ShinyText text="Stack Perfectly." className="text-wrap sm:text-nowrap" />
            </span>
          </h2>
          <p className="mt-8 text-base md:text-lg text-black/60 dark:text-white/60 font-normal leading-relaxed max-w-2xl mx-auto">
            Engineered for flexibility. Whether you run a managed store or a custom-built infrastructure, our engine integrates in minutes.
          </p>
        </motion.div>
      </div>

      {/* Circular Gallery — Full Width */}
      <div style={{ height: '500px', position: 'relative', width: '100%' }}>
        <CircularGallery 
          items={[
            { image: '/logos/shopify.png', text: 'Shopify' },
            { image: '/logos/woocommerce.png', text: 'WooCommerce' },
            { image: '/logos/magento.png', text: 'Magento' },
            { image: '/logos/bigcommerce.png', text: 'BigCommerce' },
            { image: '/logos/stripe.png', text: 'Stripe' },
            { image: '/logos/restapi.png', text: 'REST API' },
          ]}
          bend={3}
          textColor="#22d3ee"
          borderRadius={0.05}
          scrollEase={0.03}
          scrollSpeed={2}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* High-Performance SDK Focus Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-20 p-8 md:p-12 rounded-[40px] border border-blue-500/10 bg-blue-500/[0.02] dark:bg-blue-500/[0.03] relative overflow-hidden group/sdk"
        >
          <div className="absolute top-0 right-0 p-12 text-blue-500/[0.03] dark:text-blue-500/[0.05] pointer-events-none transition-transform duration-1000 group-hover/sdk:scale-110">
            <Terminal className="h-64 w-64 rotate-12" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-6 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/10">
                <Code2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Developer First</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-medium tracking-tight text-black dark:text-white mb-6 leading-tight">High-Performance <br />Developer SDK</h3>
              <p className="text-base md:text-lg text-black/50 dark:text-white/50 leading-relaxed mb-10 font-normal">
                Build custom post-purchase flows with our lightweight SDK. Fully typed, platform-agnostic, and optimized for sub-10ms response times.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="group flex items-center gap-3 px-8 py-4 bg-black dark:bg-white text-slate-50 dark:text-black rounded-full font-semibold text-sm transition-all duration-300 active:scale-95 shadow-lg hover:shadow-blue-500/20">
                  Read Documentation
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="px-8 py-4 border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 rounded-full font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Request API Key
                </button>
              </div>
            </div>

            <div className="hidden lg:block bg-[#0a0a0b] rounded-3xl p-8 border border-white/5 font-mono text-xs shadow-2xl relative group/code">
              <div className="absolute top-4 right-4 flex gap-1.5 grayscale opacity-50 group-hover/code:grayscale-0 group-hover/code:opacity-100 transition-all">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="space-y-2 leading-relaxed">
                <div className="text-blue-400">import <span className="text-white/90">{"{ UpsellEngine }"}</span> from <span className="text-emerald-400">'@upsell/sdk'</span></div>
                <div className="text-white/10">{"\n"}</div>
                <div className="text-blue-400">const <span className="text-white/90">engine</span> = <span className="text-blue-400">new</span> <span className="text-white/90">UpsellEngine</span>({"{"}</div>
                <div className="pl-6 text-white/50">apiKey: <span className="text-emerald-400">'ue_live_...'</span>,</div>
                <div className="pl-6 text-white/50">region: <span className="text-emerald-400">'us-east-1'</span></div>
                <div className="text-white/90">{"});"}</div>
                <div className="text-white/10">{"\n"}</div>
                <div className="text-blue-400">await <span className="text-white/90">engine</span>.<span className="text-blue-400">initiate</span>({"{"}</div>
                <div className="pl-6 text-white/50">transactionId: <span className="text-emerald-400">'tx_78291'</span>,</div>
                <div className="pl-6 text-white/50">mode: <span className="text-emerald-400">'autonomous'</span></div>
                <div className="text-white/90">{"});"}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Logo Cloud - Grayed out for partners */}
        {/* <div className="mt-32 pt-16 border-t border-black/5 dark:border-white/5 flex flex-wrap justify-center md:justify-between items-center gap-12 grayscale opacity-20 hover:opacity-100 transition-opacity duration-1000">
          {["STRIPE", "HUBSPOT", "SEGMENT", "KLAVIYO", "INTERCOM", "CHARTMOGUL"].map((p) => (
            <span key={p} className="text-lg font-black tracking-[0.3em] text-black dark:text-white">{p}</span>
          ))}
        </div> */}
        {/* Bottom Logo Cloud - Marquee */}
        <div className="mt-32 pt-16 border-t border-black/5 dark:border-white/5 overflow-hidden">

          {/* Inline CSS */}
          <style>
            {`
      @keyframes marquee {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }

      .marquee-track {
        display: flex;
        width: max-content;
        animation: marquee 20s linear infinite;
      }
    `}
          </style>

          <div className="relative flex w-full overflow-hidden">

            <div className="marquee-track gap-16 whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-16 items-center">
                  {["STRIPE", "HUBSPOT", "SEGMENT", "KLAVIYO", "INTERCOM", "CHARTMOGUL"].map((p) => (
                    <span
                      key={p + i}
                      className="text-lg font-black tracking-[0.3em] text-black dark:text-white opacity-30 hover:opacity-100 transition"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
