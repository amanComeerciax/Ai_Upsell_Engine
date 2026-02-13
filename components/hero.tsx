import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-foreground/[0.03] blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 h-[300px] w-[400px] rounded-full bg-foreground/[0.02] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-4 py-1.5 animate-fade-in-up">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
          <span className="text-xs font-medium text-foreground/80">AI-Powered Revenue Engine</span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
          Monetize the{" "}
          <span className="border-b-2 border-foreground/80">
            48-Hour
          </span>{" "}
          Post-Purchase Window
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl text-pretty">
          Turn every purchase into a personalized upsell opportunity. Our AI engine analyzes buyer behavior in real-time to deliver the perfect offer at the perfect moment.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="group relative h-12 px-8 bg-primary text-primary-foreground glow-button hover:bg-primary/90 transition-all"
          >
            Start Demo
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 border-border/60 text-foreground hover:bg-secondary bg-transparent"
          >
            <Play className="mr-1 h-4 w-4" />
            View Dashboard
          </Button>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { value: "3.2x", label: "Average ROI" },
            { value: "48hrs", label: "Peak Window" },
            { value: "89%", label: "Offer Accuracy" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
