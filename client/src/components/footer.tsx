import { Github, Twitter, Linkedin } from "lucide-react"
import { motion, Variants } from "framer-motion"

const footerLinks = {
  Infrastructure: ["Engine SDK", "Cloud Decisions", "Edge Delivery", "Security"],
  Ecosystem: ["Shopify", "WooCommerce", "Magento", "BigCommerce"],
  Enterprise: ["Strategic Support", "Custom Nodes", "Privacy Policy", "SLA"],
  Developer: ["API Reference", "Status", "Changelog", "System Health"],
}

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      {/* Background Section Transition Glow from Pricing */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        <div className="absolute top-0 w-1/2 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-[1px]" />
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 items-start mb-24"
        >
          {/* Brand - Span 2 */}
          <motion.div variants={itemVariants} className="col-span-2">
            <a href="#" className="flex items-center gap-3 mb-8 group transition-transform active:scale-95">
              <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10">
                <img src="/logo.png" alt="Upsell.ai" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
                  upsell
                </span>
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">.ai</span>
              </div>
            </a>
            <p className="text-base md:text-lg font-normal leading-relaxed text-black/50 dark:text-white/50 max-w-[320px] mb-10">
              Architecting the next generation of post-purchase revenue infrastructure for global e-commerce.
            </p>

            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="h-12 w-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black/10 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-all duration-300"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={itemVariants} className="col-span-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30 dark:text-white/30 mb-8">{category}</h4>
              <ul className="flex flex-col gap-5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm md:text-[15px] font-normal text-black/50 dark:text-white/50 transition-colors duration-200 hover:text-black dark:hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pt-12 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-xs md:text-[13px] font-medium text-black/40 dark:text-white/40">
              {"© 2026 upsell"}<span className="text-cyan-400">.ai</span> {"Infrastructure. All rights reserved."}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs md:text-[13px] font-medium text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs md:text-[13px] font-medium text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500">Global Nodes Operational</span>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-full max-w-[1000px] bg-blue-500/5 blur-[120px] pointer-events-none" />
    </footer>
  )
}
