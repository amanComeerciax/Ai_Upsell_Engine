import { ShoppingCart, Cpu, Gift, BarChart3, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-40 bg-[#fafafa] dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      {/* Background Section Transition Glow */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        <div className="absolute top-0 w-1/2 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-[1px]" />
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Sticky Left Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-40">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 mb-8">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">The Workflow</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-black dark:text-white leading-[1.1] mb-8">
                Architected <br />
                for <ShinyText text="Velocity." />
              </h2>
              <p className="text-base md:text-lg text-black/60 dark:text-white/60 font-normal leading-relaxed mb-12">
                We've engineered a four-stage engine designed to transform static transactions into dynamic revenue streams—automatically.
              </p>

              <div className="space-y-4">
                {["Native Integrations", "Sub-10ms Latency", "Deterministic Logic"].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 group">
                    <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/10 group-hover:scale-110 transition-transform">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-black/40 dark:text-white/40 tracking-widest uppercase group-hover:text-black dark:group-hover:text-white transition-colors">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Process Column */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-8 flex flex-col gap-6"
          >
            {steps.map((step, idx) => (
              <motion.div 
                key={step.number}
                variants={itemVariants} 
                className="group relative flex flex-col md:flex-row gap-8 p-10 rounded-[32px] md:rounded-[40px] border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm transition-all duration-500 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/[0.01] dark:hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5"
              >
                {/* Step Number Badge */}
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-2xl font-medium tracking-tight text-black dark:text-white group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 shadow-inner">
                    {step.number}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {step.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 border border-black/5 dark:border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <step.icon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    <h3 className="text-2xl font-medium tracking-tight text-black dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-base md:text-lg text-black/50 dark:text-white/50 leading-relaxed max-w-2xl font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Decorative Step Joiner Line */}
                {idx !== steps.length - 1 && (
                  <div className="hidden lg:block absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 w-px bg-gradient-to-b from-black/20 dark:from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
