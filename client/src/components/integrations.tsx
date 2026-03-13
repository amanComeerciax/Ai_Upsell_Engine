import { ShoppingBag, Globe, Smartphone, Layers, Database, Terminal } from "lucide-react"

const platforms = [
  { name: "Shopify", icon: ShoppingBag, category: "E-Commerce" },
  { name: "WooCommerce", icon: Globe, category: "E-Commerce" },
  { name: "Magento", icon: Layers, category: "E-Commerce" },
  { name: "BigCommerce", icon: ShoppingBag, category: "E-Commerce" },
  { name: "Custom SDK", icon: Smartphone, category: "Developer" },
  { name: "REST API", icon: Terminal, category: "Developer" },
]

export function Integrations() {
  return (
    <section id="integrations" className="relative py-24 md:py-40 bg-white dark:!bg-black overflow-hidden">
      {/* Background visual element */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-blue-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/5 bg-foreground/5 px-4 py-1.5 mb-8">
            <Database className="h-3.5 w-3.5 text-foreground/40" />
            <span className="text-[13px] font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Ecosystem</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight mb-8">
            Fits Your <span className="text-black/40 dark:text-white/40">Existing</span> <br />
            Stack perfectly
          </h2>
          <p className="text-xl text-black/70 dark:text-white/50 leading-relaxed">
            Engineered for flexibility. Whether you run a managed store or a custom-built infrastructure, our engine integrates in minutes.
          </p>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="group p-8 rounded-[32px] border border-foreground/[0.06] bg-white dark:bg-white/[0.02] flex flex-col items-center justify-center text-center transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:border-foreground/10 hover:shadow-xl hover:shadow-foreground/5">
              <div className="h-16 w-16 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <platform.icon className="h-8 w-8 text-foreground/60" />
              </div>
              <div className="text-sm font-bold text-black dark:text-white tracking-tight mb-1">{platform.name}</div>
              <div className="text-[10px] font-black text-black/40 dark:text-white/60 uppercase tracking-widest">{platform.category}</div>
            </div>
          ))}
        </div>

        {/* High-Performance SDK Focus Card */}
        <div className="mt-20 p-12 rounded-[40px] border border-blue-500/10 bg-blue-500/[0.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 text-blue-500/10">
            <Terminal className="h-64 w-64 rotate-12" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-black dark:text-white mb-6">High-Performance <br />Developer SDK</h3>
              <p className="text-lg text-black/70 dark:text-white/50 leading-relaxed mb-8">
                Build custom post-purchase flows with our lightweight SDK. Fully typed, platform-agnostic, and optimized for sub-10ms response times.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-foreground text-background rounded-2xl font-bold transition-transform active:scale-95">
                  View SDK Documentation
                </button>
                <button className="px-8 py-4 border border-foreground/10 text-foreground rounded-2xl font-bold hover:bg-foreground/5 transition-colors">
                  Request API Key
                </button>
              </div>
            </div>

            <div className="hidden lg:block bg-black/[0.8] rounded-3xl p-6 border border-white/5 font-mono text-xs shadow-2xl">
              <div className="flex gap-1.5 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="space-y-1.5">
                <div className="text-blue-400">import <span className="text-foreground">{"{ UpsellEngine }"}</span> from <span className="text-emerald-400">'@upsell/sdk'</span></div>
                <div className="text-muted-foreground">{"\n"}</div>
                <div className="text-blue-400">const <span className="text-foreground">engine</span> = <span className="text-blue-400">new</span> <span className="text-foreground">UpsellEngine</span>({"{"}</div>
                <div className="pl-4">apiKey: <span className="text-emerald-400">'ue_live_...'</span>,</div>
                <div className="pl-4">region: <span className="text-emerald-400">'us-east-1'</span></div>
                <div className="text-foreground">{"});"}</div>
                <div className="text-muted-foreground">{"\n"}</div>
                <div className="text-blue-400">await <span className="text-foreground">engine</span>.<span className="text-blue-400">initiate</span>({"{"}</div>
                <div className="pl-4">transactionId: <span className="text-emerald-400">'tx_78291'</span>,</div>
                <div className="pl-4">mode: <span className="text-emerald-400">'autonomous'</span></div>
                <div className="text-foreground">{"});"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Logo Cloud - Grayed out for partners */}
        <div className="mt-32 pt-16 border-t border-foreground/5 flex flex-wrap justify-center md:justify-between items-center gap-12 grayscale opacity-30 invert dark:invert-0">
          {["STRIPE", "HUB-SPOT", "SEGMENT", "KLAV-IYO", "INTER-COM", "CHART-M"].map((p) => (
            <span key={p} className="text-xl font-black tracking-[0.2em]">{p}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
