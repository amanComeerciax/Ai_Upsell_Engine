import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardStack } from "@/components/ui/card-stack"

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

const FEATURE_ITEMS = [
  {
    id: 0,
    name: "AI Offer Engine",
    designation: "Machine Learning",
    image: "/features/ai-engine.png",
    content: "Analyze customer behavior in real-time to predict and deploy the perfect upsell for every purchase. Our engine automates the entire post-purchase journey.",
  },
  {
    id: 1,
    name: "Native Ecosystem",
    designation: "Integrations",
    image: "/features/integrations.png",
    content: "Seamlessly connect with Shopify, WooCommerce, Magento, and BigCommerce. Engineered for flexibility across managed and custom stacks.",
  },
  {
    id: 2,
    name: "32% ROI Lift",
    designation: "Performance Metric",
    image: "/features/roi-lift.png",
    content: "Merchants report an average 32% increase in revenue within 30 days. High-velocity infrastructure optimized for conversion and retention.",
  },
  {
    id: 3,
    name: "$24M+ Upsold",
    designation: "Global Impact",
    image: "/features/global.png",
    content: "Powering over $24M in additional revenue for global brands. Scale your store with autonomous ML that never sleeps.",
  },
  {
    id: 4,
    name: "Dynamic Creative",
    designation: "Creative AI",
    image: "/features/creative.png",
    content: "AI-generated copy that speaks your brand voice while adapting to client intent instantly. Personalized offers that feel hand-crafted.",
  },
  {
    id: 5,
    name: "Smart Workflows",
    designation: "Developer Focus",
    image: "/features/workflows.png",
    content: "Advanced logic tuning and shortcut-based controls for technical teams. Built for high-performance developer environments.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-40 bg-[#fafafa] dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        <div className="absolute top-0 w-1/2 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-[1px]" />
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="absolute top-40 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-[1200px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center max-w-4xl mx-auto mb-20 md:mb-32"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 mb-8">
            <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500 fill-current" />
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Engine Capabilities</span>
          </div>
          <h2 className="flex flex-col items-center leading-[0.85] tracking-tighter w-full px-2">
            <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-black dark:text-white max-w-full">
              Maximize Revenue
            </span>
            <span className="mt-2 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold pb-2 max-w-full relative">
              <ShinyText text="With Precision AI." className="text-wrap sm:text-nowrap" />
            </span>
          </h2>
          <p className="mt-8 text-base md:text-xl text-black/60 dark:text-white/60 font-normal leading-relaxed max-w-2xl mx-auto">
            One integration, unlimited growth. Our engine automates the entire post-purchase journey using state-of-the-art machine learning.
          </p>
        </motion.div>

        <div className="py-20 md:py-40 flex items-center justify-center">
          <CardStack items={FEATURE_ITEMS} />
        </div>
      </div>
    </section>
  )
}
