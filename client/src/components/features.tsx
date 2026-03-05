import { Brain, MessageSquareText, BarChart3, ArrowRight, Zap, Target, MousePointer2 } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Offer Optimization",
    description: "Analyze customer behavior in real-time to predict and deploy the perfect upsell for every purchase.",
    color: "bg-blue-500",
    number: "01",
    large: true,
    ui: (
      <div className="relative h-full w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <div className="h-2 w-24 bg-foreground/10 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="h-12 w-full rounded-xl border border-foreground/5 bg-white/5 p-4 flex items-center justify-between">
            <div className="h-2 w-20 bg-foreground/10 rounded-full" />
            <div className="h-6 w-12 rounded-lg bg-blue-500/20 text-[10px] font-bold text-blue-400 flex items-center justify-center">88%</div>
          </div>
          <div className="h-32 w-full rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-blue-500/50" />
            <div className="h-2 w-32 bg-foreground/20 rounded-full mb-3" />
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-foreground/5 rounded-full" />
              <div className="h-1.5 w-3/4 bg-foreground/5 rounded-full" />
            </div>
            <div className="mt-6 flex gap-2">
              <div className="h-8 w-20 rounded-lg bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">Active</div>
              <div className="h-8 w-20 rounded-lg border border-foreground/10 flex items-center justify-center text-[10px] font-bold text-foreground/40">Hold</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: MessageSquareText,
    title: "Dynamic Creative",
    description: "AI-generated copy that speaks your brand voice while adapting to client intent.",
    color: "bg-emerald-500",
    number: "02",
    ui: (
      <div className="p-6 h-full flex flex-col justify-center">
        <div className="space-y-3">
          <div className="h-2 w-16 bg-emerald-500/20 rounded-full" />
          <div className="h-4 w-full bg-foreground/10 rounded-lg" />
          <div className="h-4 w-5/6 bg-foreground/10 rounded-lg" />
          <div className="h-4 w-4/6 bg-foreground/10 rounded-lg opacity-50" />
        </div>
        <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 border-dashed">
          <div className="h-2 w-20 bg-emerald-500/40 rounded-full" />
        </div>
      </div>
    )
  },
  {
    icon: BarChart3,
    title: "Revenue Insights",
    description: "Deep analytics focusing on LTV and conversion lift from AI-driven offers.",
    color: "bg-purple-500",
    number: "03",
    ui: (
      <div className="p-6 h-full flex flex-col items-end justify-center">
        <div className="flex gap-1 items-end h-24">
          <div className="w-3 bg-purple-500/20 rounded-t-sm h-12" />
          <div className="w-3 bg-purple-500/40 rounded-t-sm h-16" />
          <div className="w-3 bg-purple-500/30 rounded-t-sm h-10" />
          <div className="w-3 bg-purple-500/60 rounded-t-sm h-20 animate-bounce" />
          <div className="w-3 bg-purple-500/20 rounded-t-sm h-8" />
        </div>
        <div className="mt-4 h-2 w-24 bg-purple-500/20 rounded-full" />
      </div>
    )
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-40 bg-white dark:!bg-black overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
      <div className="absolute top-40 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-[1200px] rounded-full bg-blue-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/5 bg-foreground/5 px-4 py-1.5 mb-8">
            <Zap className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
            <span className="text-[13px] font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Engine Capabilities</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-black dark:text-white leading-tight mb-8">
            Maximize Revenue <br />
            <span className="text-black/40 dark:text-white/40">
              With Precision AI
            </span>
          </h2>
          <p className="text-xl text-black/70 dark:text-white/50 leading-relaxed">
            One integration, unlimited growth. Our engine automates the entire post-purchase journey using state-of-the-art machine learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative flex flex-col rounded-[32px] border border-foreground/[0.06] bg-white dark:bg-white/[0.02] p-2 transition-all hover:border-foreground/10 hover:shadow-2xl hover:shadow-foreground/5 
                ${feature.large ? 'md:col-span-12 lg:col-span-8' : 'md:col-span-6 lg:col-span-4'}
              `}
            >
              <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                {/* Text Content */}
                <div className={`p-8 flex flex-col ${feature.large ? 'lg:w-1/2' : 'w-full'}`}>
                  <div className={`h-10 w-10 rounded-xl ${feature.color}/10 flex items-center justify-center mb-6`}>
                    <feature.icon className={`h-5 w-5 ${feature.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-black/60 dark:text-white/50 leading-relaxed mb-8 flex-grow">
                    {feature.description}
                  </p>

                  <div className="inline-flex items-center gap-2 text-sm font-bold text-black/40 dark:text-white/60 transition-colors group-hover:text-black dark:group-hover:text-white">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Visual UI area */}
                <div className={`relative bg-foreground/[0.02] rounded-[24px] overflow-hidden ${feature.large ? 'lg:w-1/2' : 'h-[240px] mt-auto'}`}>
                  <div className="absolute inset-0 bg-grid-pattern text-foreground/5 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
                  {feature.ui}
                </div>
              </div>
            </div>
          ))}

          {/* Additional decorative items to fill the bento grid */}
          <div className="md:col-span-6 lg:col-span-4 flex flex-col rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8 items-center justify-center text-center group cursor-pointer hover:bg-blue-500/10 transition-colors">
            <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">Ready to scale?</h3>
            <p className="text-sm text-black/60 dark:text-white/50 mb-6">Join 2,500+ merchants already using the engine.</p>
            <button className="px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm transition-transform active:scale-95">
              Get Started
            </button>
          </div>

          <div className="md:col-span-6 lg:col-span-4 flex flex-col rounded-[32px] border border-foreground/[0.06] bg-white dark:bg-white/[0.02] p-8 items-center justify-center text-center group cursor-pointer hover:border-foreground/10 transition-all">
            <div className="h-14 w-14 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 text-foreground/40 group-hover:text-foreground transition-colors">
              <MousePointer2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">Custom SDK</h3>
            <p className="text-sm text-black/60 dark:text-white/50 mb-6">Integrate with any platform in under 10 minutes.</p>
            <div className="text-sm font-bold border-b border-foreground/20 pb-1">View Docs</div>
          </div>

          <div className="md:col-span-12 lg:col-span-4 flex flex-col rounded-[32px] border border-foreground/[0.06] bg-white dark:bg-white/[0.02] p-8 items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="h-32 w-32" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">Security First</h3>
            <p className="text-sm text-black/60 dark:text-white/50 mb-6">GDPR & SOC2 Type II compliant infrastructure.</p>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
