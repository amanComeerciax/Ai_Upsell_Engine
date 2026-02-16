import { Button } from "@/components/ui/button"
import { Check, Star, Zap } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Ideal for emerging brands optimizing their post-purchase flows.",
    features: [
      "Up to 1,000 orders / mo",
      "Essential AI Recommendations",
      "Email & SMS Connectors",
      "Attribution Dashboard",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/month",
    description: "The complete engine for high-velocity scaling ecosystems.",
    features: [
      "Up to 10k orders / mo",
      "Advanced ML Probabilities",
      "Custom UI Injections",
      "Dynamic A/B Engine",
      "Full API & SDK Access",
      "Priority Logic Queue",
    ],
    cta: "Scale Now",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Bridges the gap between data and revenue at massive scale.",
    features: [
      "Unlimited Transactions",
      "Dedicated Model Node",
      "Custom Contract Terms",
      "1-on-1 Strategy Support",
      "Unified Global Data",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-40 bg-[#fafafa] dark:bg-[#070707] overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-full max-w-[1400px] bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
      <div className="absolute top-40 right-0 h-[600px] w-[600px] bg-foreground/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/5 bg-foreground/5 px-4 py-1.5 mb-8">
            <Star className="h-3.5 w-3.5 text-foreground/40" />
            <span className="text-[13px] font-bold text-foreground/60 uppercase tracking-wider">Pricing Models</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Built for <span className="text-muted-foreground/30">Scale</span> <br />
            Not Just Software
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-[48px] p-10 transition-all ${tier.highlighted
                  ? "bg-foreground text-background shadow-[0_40px_100px_rgba(0,0,0,0.1)] scale-105 z-10 dark:shadow-[0_40px_100px_rgba(255,255,255,0.05)]"
                  : "bg-white dark:bg-white/[0.03] border border-foreground/5 hover:border-foreground/15"
                }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-[#3b82f6] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                  Most Advanced
                </div>
              )}

              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-xl font-bold ${tier.highlighted ? "text-background" : "text-foreground"}`}>
                    {tier.name}
                  </h3>
                  {tier.highlighted && <Zap className="h-6 w-6 text-[#3b82f6] fill-[#3b82f6]" />}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                  <span className={`text-sm font-bold ${tier.highlighted ? "text-background/50" : "text-muted-foreground"}`}>
                    {tier.period}
                  </span>
                </div>
                <p className={`mt-6 text-[15px] font-medium leading-relaxed ${tier.highlighted ? "text-background/70" : "text-muted-foreground"}`}>
                  {tier.description}
                </p>
              </div>

              <div className={`h-px w-full ${tier.highlighted ? "bg-background/10" : "bg-foreground/5"} mb-12`} />

              <ul className="flex flex-col gap-5 flex-1 mb-12">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${tier.highlighted ? "border-background/20 bg-background/5" : "border-foreground/15 bg-foreground/[0.02]"}`}>
                      <Check className={`h-3 w-3 ${tier.highlighted ? "text-background" : "text-foreground"}`} />
                    </div>
                    <span className={`text-[15px] font-bold tracking-tight ${tier.highlighted ? "text-background/90" : "text-foreground/80"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`h-16 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] ${tier.highlighted
                    ? "bg-[#3b82f6] text-white shadow-xl shadow-[#3b82f6]/20"
                    : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-sm font-bold text-muted-foreground">
            {"Need a custom configuration? "}
            <a href="#" className="text-foreground border-b border-foreground/20 pb-0.5 ml-1">Connect with our infrastructure team</a>
          </p>
        </div>
      </div>
    </section>
  )
}
