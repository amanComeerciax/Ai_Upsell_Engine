import { Check, Star, Zap, ArrowRight } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { OriginButton } from "@/components/ui/OriginButton"

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-40 bg-[#fafafa] dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      {/* Background Section Transition Glow */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        <div className="absolute top-0 w-1/2 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-[1px]" />
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-white/5 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="absolute top-40 right-0 h-[600px] w-[600px] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center max-w-6xl mx-auto mb-20 md:mb-28"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 mb-8">
            <Star className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Pricing Models</span>
          </div>
          <h2 className="flex flex-col items-center justify-center text-center leading-[1.1] tracking-tighter w-full px-2">
            <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-black dark:text-white max-w-full text-center">
              Built for
            </div>
            <div className="mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold pb-2 max-w-full text-center">
              <ShinyText text="Scale, Not Just Software." className="text-wrap sm:text-nowrap" />
            </div>
          </h2>
          <p className="mt-8 text-base md:text-lg text-black/60 dark:text-white/60 font-normal leading-relaxed max-w-2xl mx-auto">
            Choose the infrastructure tier that fits your growth velocity. All plans include our core AI engine with deterministic attribution logic.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={itemVariants}
              className={cn(
                "group relative flex flex-col rounded-[40px] p-8 md:p-10 transition-all duration-500",
                tier.highlighted
                  ? "bg-black dark:bg-white/[0.04] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.1)] scale-[1.02] z-10"
                  : "bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl z-20">
                  Most Advanced
                </div>
              )}

              <div className="mb-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={cn(
                    "text-xl font-medium tracking-tight",
                    tier.highlighted ? "text-white" : "text-black dark:text-white"
                  )}>
                    {tier.name}
                  </h3>
                  {tier.highlighted ? (
                    <Zap className="h-5 w-5 text-blue-500 fill-blue-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-black/5 dark:bg-white/5" />
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={cn(
                    "text-5xl md:text-6xl font-medium tracking-tighter",
                    tier.highlighted ? "text-white" : "text-black dark:text-white"
                  )}>{tier.price}</span>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    tier.highlighted ? "text-white/40" : "text-black/40 dark:text-white/40"
                  )}>
                    {tier.period}
                  </span>
                </div>
                <p className={cn(
                  "mt-6 text-sm md:text-base leading-relaxed font-normal",
                  tier.highlighted ? "text-white/60" : "text-black/50 dark:text-white/50"
                )}>
                  {tier.description}
                </p>
              </div>

              <div className={cn(
                "h-px w-full mb-10",
                tier.highlighted ? "bg-white/10" : "bg-black/5 dark:bg-white/5"
              )} />

              <ul className="flex flex-col gap-5 flex-1 mb-12">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-4 group/item">
                    <div className={cn(
                      "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                      tier.highlighted
                        ? "bg-blue-600/20 text-blue-500 border border-blue-500/20"
                        : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 border border-black/5 dark:border-white/10 group-hover/item:text-blue-500"
                    )}>
                      <Check className="h-2.5 w-2.5" />
                    </div>
                    <span className={cn(
                      "text-sm md:text-[15px] font-medium tracking-tight transition-colors duration-300",
                      tier.highlighted ? "text-white/80" : "text-black/60 dark:text-white/60 group-hover/item:text-black dark:group-hover/item:text-white"
                    )}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <OriginButton
                className={cn(
                  "group gap-3 w-full h-14 md:h-16 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-lg",
                  tier.highlighted
                    ? "bg-blue-600 text-white"
                    : "bg-black dark:bg-white text-slate-50 dark:text-black"
                )}
                hoverColor={tier.highlighted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)'}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </OriginButton>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-xs md:text-sm font-medium text-black/40 dark:text-white/40">
            {"Need a custom configuration? "}
            <a href="#" className="text-black dark:text-white border-b border-black/20 dark:border-white/20 pb-0.5 ml-1 hover:border-black dark:hover:border-white transition-colors">Connect with our infrastructure team</a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
