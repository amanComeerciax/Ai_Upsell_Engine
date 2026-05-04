import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import FlowingMenu from "@/components/ui/FlowingMenu"

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

const faqItems = [
  {
    link: '#faq',
    text: 'What is upsell.ai?',
    image: '/faq/what-is.png',
    answer: 'Upsell.ai is an advanced machine learning engine that automatically analyzes customer behavior to deploy personalized, high-converting post-purchase offers in real-time. It transforms static thank-you pages into dynamic revenue streams.',
  },
  {
    link: '#faq',
    text: 'How does the AI engine work?',
    image: '/faq/ai-engine.png',
    answer: 'Our engine processes over 200 behavioral signals—including cart contents, browsing history, and demographics—using deterministic logic and neural networks. It calculates the optimal product recommendation and price point in under 10 milliseconds.',
  },
  {
    link: '#faq',
    text: 'Which platforms are supported?',
    image: '/faq/platforms.png',
    answer: 'We offer native, one-click integrations for Shopify, WooCommerce, Magento, and BigCommerce. We also provide a robust, low-latency REST API for custom headless commerce architectures.',
  },
  {
    link: '#faq',
    text: 'What kind of ROI can I expect?',
    image: '/faq/roi.png',
    answer: 'On average, merchants experience a 32% lift in post-purchase revenue within the first 30 days of deployment. Our built-in attribution dashboard tracks every dollar generated with deterministic accuracy so you can verify the ROI instantly.',
  },
  {
    link: '#faq',
    text: 'Is there a free trial?',
    image: '/faq/trial.png',
    answer: 'Yes, we offer a 14-day risk-free trial. You can fully integrate the engine, run it in production, and see the direct revenue impact on your store before making any financial commitment.',
  },
  {
    link: '#faq',
    text: 'How fast is the setup?',
    image: '/faq/setup.png',
    answer: 'Installation takes less than 5 minutes for supported platforms. The AI begins learning immediately upon installation and typically reaches peak optimization within 48 to 72 hours of data collection.',
  },
]

export function FAQ() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <section id="faq" className="relative py-16 md:py-24 bg-[#fafafa] dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        <div className="absolute top-0 w-1/2 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-[1px]" />
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 mb-10 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 mb-8">
            <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Support</span>
          </div>
          <h2 className="flex flex-col items-center leading-[0.85] tracking-tighter w-full px-2">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-black dark:text-white max-w-full">
              Got Questions?
            </span>
            <span className="mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold pb-2 max-w-full relative">
              <ShinyText text="We've Got Answers." className="text-wrap sm:text-nowrap" />
            </span>
          </h2>
          <p className="mt-8 text-base md:text-xl text-black/60 dark:text-white/60 font-normal leading-relaxed max-w-2xl mx-auto">
            Hover over any question to explore the details.
          </p>
        </motion.div>
      </div>

      {/* FlowingMenu — Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        style={{ height: '380px', position: 'relative', width: '100%' }}
      >
        <FlowingMenu
          items={faqItems as any}
          speed={30} // Decreased speed significantly to make long answers readable
          textColor={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"}
          bgColor="transparent"
          marqueeBgColor="#3b82f6"
          marqueeTextColor="#ffffff"
          borderColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
        />
      </motion.div>
    </section>
  )
}
