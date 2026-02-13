import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Star, Zap, Shield, Cpu } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-40">
      {/* Background visual engine */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* The Grid */}
        <div className="absolute inset-0 bg-grid-pattern text-foreground/[0.03] mask-radial-faded" />

        {/* The Glows */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-[500px] w-full max-w-[1200px] rounded-full bg-blue-500/[0.06] blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] h-[300px] w-[300px] rounded-full bg-emerald-500/[0.04] blur-[80px]" />

        {/* Floating Particles/Nodes */}
        <div className="absolute top-1/4 left-[10%] animate-float">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </div>
        <div className="absolute top-1/3 right-[15%] animate-float [animation-delay:3s]">
          <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col items-center text-center">
          {/* Trust Badge */}
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-foreground/5 bg-foreground/5 px-4 py-2 animate-fade-in-up">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-foreground/10" />
              ))}
            </div>
            <div className="h-4 w-px bg-foreground/10 mx-1" />
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
              <span className="text-[13px] font-bold text-foreground/80 tracking-tight">4.9/5 Rating</span>
            </div>
            <div className="h-4 w-px bg-foreground/10 mx-1" />
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/40 hidden sm:block">Trusted by 2.5k+ Merchants</span>
          </div>

          {/* Main Headline */}
          <h1 className="mx-auto max-w-5xl text-6xl font-bold leading-[1.05] tracking-tight text-foreground md:text-8xl lg:text-9xl text-balance animate-fade-in-up [animation-delay:0.1s]">
            High-Velocity <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent">
              Upsell Infrastructure
            </span>
          </h1>

          {/* High-Performance Subtext */}
          <p className="mx-auto mt-10 max-w-3xl text-xl leading-relaxed text-muted-foreground md:text-2xl text-pretty font-medium animate-fade-in-up [animation-delay:0.2s]">
            Convert 35% more post-purchase revenue using our state-of-the-art AI inference engine. Architected for speed, built for scale.
          </p>

          {/* Technical Chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in-up [animation-delay:0.25s]">
            {[
              { icon: Zap, label: "Sub-10ms Latency" },
              { icon: Shield, label: "Enterprise Ready" },
              { icon: Cpu, label: "Autonomous ML" },
            ].map((chip) => (
              <div key={chip.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/[0.03] border border-foreground/5">
                <chip.icon className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/60">{chip.label}</span>
              </div>
            ))}
          </div>

          {/* High-Impact Actions */}
          <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row animate-fade-in-up [animation-delay:0.3s]">
            <Button
              size="lg"
              className="group relative h-16 px-10 bg-foreground text-background hover:bg-foreground/90 transition-all rounded-2xl flex items-center gap-4 active:scale-95"
            >
              <span className="font-bold text-lg tracking-tight">Get Started Now</span>
              <div className="h-6 w-6 rounded-full bg-background/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" />
              </div>
            </Button>

            <button className="group flex items-center gap-4 px-8 py-4 text-sm font-bold text-foreground transition-all hover:bg-foreground/5 rounded-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 transition-transform group-hover:scale-110">
                <Play className="h-3.5 w-3.5 fill-current" />
              </div>
              See Flow in Action
            </button>
          </div>
        </div>

        {/* Global Stats Bar */}
        <div className="mx-auto mt-32 grid max-w-5xl grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up [animation-delay:0.4s]">
          {[
            { value: "$2.4B+", label: "Capital Processed", color: "text-blue-500" },
            { value: "35%", label: "Avg. Conversion Lift", color: "text-emerald-500" },
            { value: "85k+", label: "Active Integrations", color: "text-purple-500" },
            { value: "99.99%", label: "Engine Uptime", color: "text-amber-500" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-[24px] border border-foreground/[0.03] bg-foreground/[0.01] text-center group hover:bg-foreground/[0.02] transition-colors">
              <div className={`text-3xl font-black tracking-tighter ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
