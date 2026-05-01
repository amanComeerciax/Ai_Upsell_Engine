import { ArrowRight, Zap, Shield, Cpu } from "lucide-react"
import { Link } from "react-router-dom"


function ShinyText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
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
        className={`inline-block relative from-[#0070A0] via-black to-[#0070A0] dark:from-[#64CEFB] dark:via-white dark:to-[#64CEFB] bg-[length:200%_auto] bg-clip-text text-transparent [background-image:linear-gradient(100deg,var(--tw-gradient-stops))] animate-text-shine ${className}`}
      >
        {text}
      </span>
    </>
  )
}

export function Hero() {

  return (
    <section className="relative h-screen w-full bg-black font-['Inter',sans-serif] flex flex-col">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
      />

      {/* Light/Dark mode overlay (Removed backdrop-blur here for video performance) */}
      <div className="absolute inset-0 z-0 bg-white/70 dark:bg-black/70 transition-colors duration-500" />

      {/* Content wrapper */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col px-6 sm:px-8 lg:px-8 py-6">



        {/* Hero Section (Center) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-[-4vh]">
          {/* Subtext Chips */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4">
            {[
              { icon: Zap, label: "Sub-10ms Latency" },
              { icon: Shield, label: "Enterprise Ready" },
              { icon: Cpu, label: "Autonomous ML" },
            ].map((chip) => (
              <span key={chip.label} className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] sm:text-xs text-black/60 dark:text-white/60 font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-md">
                <chip.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-500" />
                {chip.label}
              </span>
            ))}
          </div>

          <h1 className="flex flex-col items-center leading-[0.85] tracking-tighter w-full px-2 max-w-5xl">
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-black dark:text-white max-w-full">
              High-Velocity
            </span>
            <span className="mt-2 sm:mt-4 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold pb-2 max-w-full relative -translate-x-2 sm:-translate-x-3 md:-translate-x-20">
              <ShinyText text="Upsell Infrastructure" className="text-wrap sm:text-nowrap" />
            </span>
          </h1>

          {/* CTA Button */}
          <div className="mt-12 sm:mt-16">
            <Link to="/signup">
              <button className="group flex items-center justify-center gap-3 rounded-full bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 px-6 py-3 md:px-8 md:py-4 transition-all duration-300">
                <span className="text-sm md:text-base font-semibold text-slate-50 dark:text-black">
                  Get Started Now
                </span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-slate-50 dark:text-black transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
