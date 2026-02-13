import { ShoppingCart, Cpu, Gift, BarChart3, CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: ShoppingCart,
    title: "Event Capture",
    description: "Our high-speed engine intercepts every transaction event across your ecosystem in under 10ms.",
    tags: ["Real-time", "Low Latency"],
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Inference",
    description: "Machine learning models process 200+ behavioral signals to compute the optimal upsell path.",
    tags: ["Decision Tree", "ML Models"],
  },
  {
    number: "03",
    icon: Gift,
    title: "Precision Offer",
    description: "Tailored offers are dynamically injected into the customer journey via the most effective channel.",
    tags: ["Multi-channel", "Adaptive"],
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Revenue Attribution",
    description: "Every dollar is tracked with deterministic logic, providing a clear view of your automation ROI.",
    tags: ["Attribution", "Reporting"],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-40 bg-[#fafafa] dark:bg-[#070707] overflow-hidden">
      {/* Background visual - Large subtle text */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20vw] font-black text-foreground/[0.02] whitespace-nowrap pointer-events-none select-none">
        OPERATIONAL FLOW
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Sticky Left Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-40">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/5 bg-foreground/5 px-4 py-1.5 mb-8">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground/40" />
              <span className="text-[13px] font-bold text-foreground/60 uppercase tracking-wider">The Workflow</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-8">
              Architected <br />
              for <span className="text-muted-foreground/30">Velocity</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We've engineered a four-stage engine designed to transform static transactions into dynamic revenue streams—automatically.
            </p>

            <div className="mt-12 space-y-4">
              {["Native Integrations", "Sub-20ms Latency", "Deterministic Attribution"].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-foreground/5 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                  </div>
                  <span className="text-sm font-bold text-foreground/60 tracking-wide uppercase">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Process Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {steps.map((step, idx) => (
              <div key={step.number} className="group relative flex flex-col md:flex-row gap-8 p-10 rounded-[40px] border border-foreground/5 bg-white dark:bg-white/[0.03] transition-all hover:bg-white dark:hover:bg-white/[0.05] hover:border-foreground/10 hover:shadow-2xl hover:shadow-foreground/5">
                {/* Step Number Badge */}
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-foreground/5 flex items-center justify-center text-2xl font-black text-foreground/20 group-hover:text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                    {step.number}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {step.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>

                {/* Connection Line Visual */}
                {idx !== steps.length - 1 && (
                  <div className="hidden lg:block absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 w-px bg-foreground/5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
