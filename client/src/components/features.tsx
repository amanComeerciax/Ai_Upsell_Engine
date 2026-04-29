import { motion } from "framer-motion"
import {
  Settings2,
  Command,
  Plus,
  Zap,
  Brain,
  Layers,
  Cpu,
  MousePointer2,
  Share2
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { BentoGridShowcase } from "@/components/ui/bento-product-features"

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

// --- Real Product Feature Cards ---

const OfferEngineCard = () => (
  <Card className="flex h-full flex-col border-black/5 dark:border-white/5 bg-white dark:bg-white/5 shadow-none transition-all duration-300 hover:border-black/10 dark:hover:border-white/10 group">
    <CardHeader>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/10 transition-transform duration-300 group-hover:scale-110">
        <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <CardTitle className="text-xl md:text-2xl font-medium tracking-tight text-black dark:text-white">AI Offer Engine</CardTitle>
      <CardDescription className="text-black/50 dark:text-white/50 text-sm md:text-base leading-relaxed font-normal">
        Analyze customer behavior in real-time to predict and deploy the perfect upsell for every purchase. Our engine automates the entire post-purchase journey.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="space-y-4">
        <div className="h-12 w-full rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 flex items-center justify-between">
          <div className="h-2 w-20 bg-black/10 dark:bg-white/10 rounded-full" />
          <div className="h-6 w-12 rounded-lg bg-blue-500/20 text-[10px] font-bold text-blue-500 flex items-center justify-center">94% Accuracy</div>
        </div>
        <div className="h-24 w-full rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-blue-500/50" />
          <div className="h-2 w-32 bg-black/20 dark:bg-white/20 rounded-full mb-3" />
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full" />
            <div className="h-1.5 w-3/4 bg-black/5 dark:bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="mt-auto flex items-center justify-between pb-8">
      <Button variant="outline" size="sm" className="rounded-full border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors font-medium">
        <Settings2 className="mr-2 h-4 w-4" />
        Configure Engine
      </Button>
      <Switch
        defaultChecked
        className="data-[state=checked]:bg-blue-600"
        aria-label="Toggle AI Engine"
      />
    </CardFooter>
  </Card>
);

const PlatformCard = () => (
  <Card className="h-full border-black/5 dark:border-white/5 bg-white dark:bg-white/5 shadow-none transition-all duration-300 hover:border-black/10 dark:hover:border-white/10 group">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div>
        <CardTitle className="text-base font-medium tracking-tight text-black dark:text-white">
          Native Integrations
        </CardTitle>
        <CardDescription className="text-black/40 dark:text-white/40">Shopify, WooCommerce, Stripe</CardDescription>
      </div>
      <div className="flex -space-x-2 overflow-hidden py-2 translate-y-1 group-hover:translate-y-0 transition-transform">
        <div className="h-10 w-10 rounded-full bg-white dark:bg-black border border-black/5 dark:border-white/10 flex items-center justify-center p-2.5">
          <Layers className="h-full w-full text-blue-500" />
        </div>
        <div className="h-10 w-10 rounded-full bg-white dark:bg-black border border-black/5 dark:border-white/10 flex items-center justify-center p-2.5">
          <Cpu className="h-full w-full text-purple-500" />
        </div>
        <div className="h-10 w-10 rounded-full bg-white dark:bg-black border border-black/5 dark:border-white/10 flex items-center justify-center p-2.5">
          <Share2 className="h-full w-full text-emerald-500" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ConversionCard = () => (
  <Card className="h-full border-black/5 dark:border-white/5 bg-white dark:bg-white/5 shadow-none transition-all duration-300 hover:border-black/10 dark:hover:border-white/10">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base font-medium tracking-tight text-black dark:text-white">ROI Lift</CardTitle>
          <CardDescription className="text-black/40 dark:text-white/40">Revenue Growth Index</CardDescription>
        </div>
        <Badge variant="outline" className="border-emerald-300 text-emerald-600 dark:border-emerald-500/50 dark:text-emerald-400 text-[10px] font-bold">
          High Velocity
        </Badge>
      </div>
      <div className="py-2">
        <span className="text-5xl font-bold tracking-tighter text-black dark:text-white">32%</span>
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-black/40 dark:text-white/40">
        <span>Average Boost</span>
        <span>Per Merchant</span>
      </div>
    </CardContent>
  </Card>
);

const StatsCard = () => (
  <Card className="relative h-full w-full overflow-hidden border-black/5 dark:border-white/5 bg-white dark:bg-white/5 shadow-none group transition-all duration-300 hover:border-black/10 dark:hover:border-white/10">
    <div
      className="absolute inset-0 opacity-10 dark:opacity-20"
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    />
    <CardContent className="relative z-10 flex h-full items-center justify-center p-6 text-center flex-col">
      <span className="text-6xl font-bold text-black dark:text-white tracking-tighter transition-transform duration-500 group-hover:scale-110">$24M+</span>
      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-black/30 dark:text-white/30 mt-2">Total Revenue Upsold</span>
    </CardContent>
  </Card>
);

const CreativeCard = () => (
  <Card className="h-full border-black/5 dark:border-white/5 bg-white dark:bg-white/5 shadow-none transition-all duration-300 hover:border-black/10 dark:hover:border-white/10">
    <CardContent className="flex h-full flex-col justify-end p-6">
      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center mb-4">
        <MousePointer2 className="h-4 w-4 text-emerald-500" />
      </div>
      <CardTitle className="text-base font-medium tracking-tight text-black dark:text-white">
        Dynamic Creative
      </CardTitle>
      <CardDescription className="text-black/50 dark:text-white/50 text-sm font-normal">
        AI-generated copy that speaks your brand voice while adapting to client intent instantly.
      </CardDescription>
    </CardContent>
  </Card>
);

const ShortcutsCard = () => (
  <Card className="h-full border-black/5 dark:border-white/5 bg-white dark:bg-white/5 shadow-none transition-all duration-300 hover:border-black/10 dark:hover:border-white/10 group">
    <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <CardTitle className="text-base font-medium tracking-tight text-black dark:text-white">Smart Workflows</CardTitle>
        <CardDescription className="text-black/50 dark:text-white/50 text-sm font-normal">
          Shortcut-based engine controls for faster deployment and logic tuning.
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-mono text-xs font-bold text-black/60 dark:text-white/60 transition-colors group-hover:bg-blue-500/10 group-hover:text-blue-500">
          <Command className="h-3.5 w-3.5" />
        </div>
        <Plus className="h-3 w-3 text-black/20 dark:text-white/20" />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 font-mono text-xs font-bold text-black/60 dark:text-white/60 transition-colors group-hover:bg-blue-500/10 group-hover:text-blue-500">
          U
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- The Main Features Component ---

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
          className="text-center max-w-4xl mx-auto mb-20 md:mb-28"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 mb-8">
            <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500 fill-current" />
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Engine Capabilities</span>
          </div>
          <h2 className="flex flex-col items-center leading-[0.85] tracking-tighter w-full px-2">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-black dark:text-white max-w-full">
              Maximize Revenue
            </span>
            <span className="mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold pb-2 max-w-full relative">
              <ShinyText text="With Precision AI." className="text-wrap sm:text-nowrap" />
            </span>
          </h2>
          <p className="mt-8 text-base md:text-xl text-black/60 dark:text-white/60 font-normal leading-relaxed max-w-2xl mx-auto">
            One integration, unlimited growth. Our engine automates the entire post-purchase journey using state-of-the-art machine learning.
          </p>
        </motion.div>

        <BentoGridShowcase
          integration={<OfferEngineCard />}
          trackers={<PlatformCard />}
          statistic={<StatsCard />}
          focus={<ConversionCard />}
          productivity={<CreativeCard />}
          shortcuts={<ShortcutsCard />}
        />
      </div>
    </section>
  )
}
