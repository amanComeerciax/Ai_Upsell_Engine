import { ShoppingCart, Cpu, Gift, BarChart3, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import Stack from "@/components/ui/Stack"

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

const stackImages = [
  "/stack/step1.png",
  "/stack/step2.png",
  "/stack/step3.png",
  "/stack/step4.png",
]

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
  // Memoize cards so JSX nodes are stable — prevents Stack from resetting on every re-render
  const stackCards = useMemo(() => steps.map((step, i) => (
    <div key={step.number} className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl group border border-white/10 dark:border-white/5 bg-black">
      {/* Background Image */}
      <img
        src={stackImages[i]}
        alt={step.title}
        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
        draggable={false}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex flex-col justify-end">
        <div className="flex items-center gap-4 mb-5 md:mb-6">
          <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-inner">
            {step.number}
          </div>
          <div className="flex flex-wrap gap-2">
            {step.tags.map(tag => (
              <span key={tag} className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <step.icon className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{step.title}</h3>
        </div>
        <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl font-medium">
          {step.description}
        </p>
      </div>
    </div>
  )), [])

  return (
    <section id="how-it-works" className="relative py-24 md:py-40 bg-[#fafafa] dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      {/* Background Section Transition Glow */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center lg:items-start">
          {/* Sticky Left Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-40">
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

              <div className="space-y-5 mb-12">
                {["Native Integrations", "Sub-10ms Latency", "Deterministic Logic"].map((feat, i) => (
                  <div key={feat} className="flex items-center gap-3 group">
                    <div className="relative h-7 w-7 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30 group-hover:scale-110 transition-transform"
                      style={{ boxShadow: '0 0 12px 4px rgba(59,130,246,0.5), 0 0 30px 8px rgba(59,130,246,0.2)' }}
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-400" style={{ boxShadow: '0 0 8px 2px rgba(96,165,250,0.8)' }} />
                      <div 
                        className="absolute -inset-1 rounded-full bg-blue-400/30 animate-ping" 
                        style={{ animationDelay: `${i * 0.5}s`, animationDuration: '1.5s' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-black/40 dark:text-white/40 tracking-widest uppercase group-hover:text-black dark:group-hover:text-white transition-colors">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Process Column - Interactive Stack */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="w-full max-w-[600px] h-[450px] md:h-[600px] relative perspective-1000"
            >
              <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={true}
                autoplay={true}
                autoplayDelay={4000}
                pauseOnHover={true}
                cards={stackCards}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
