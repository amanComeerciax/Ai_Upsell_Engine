import { Zap, Github, Twitter, Linkedin } from "lucide-react"

const footerLinks = {
  Infrastructure: ["Engine SDK", "Cloud Decisions", "Edge Delivery", "Security"],
  Ecosystem: ["Shopify", "WooCommerce", "Magento", "BigCommerce"],
  Enterprise: ["Strategic Support", "Custom Nodes", "Privacy Policy", "SLA"],
  Developer: ["API Reference", "Status", "Changelog", "System Health"],
}

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#030303] border-t border-foreground/[0.05] overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 items-start mb-24">
          {/* Brand - Span 2 */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-3 mb-8">
              <Zap className="h-8 w-8 text-foreground fill-foreground" />
              <span className="text-2xl font-black tracking-tighter text-foreground uppercase">upsell<span className="text-muted-foreground/40">.ai</span></span>
            </a>
            <p className="text-lg font-bold leading-relaxed text-muted-foreground max-w-[320px]">
              Architecting the next generation of post-purchase revenue infrastructure.
            </p>

            <div className="flex gap-4 mt-8">
              {[Twitter, Linkedin, Github].map((Icon, idx) => (
                <a key={idx} href="#" className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-8">{category}</h4>
              <ul className="flex flex-col gap-5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[15px] font-bold text-foreground/60 transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-12 border-t border-foreground/[0.05] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[13px] font-bold text-muted-foreground">
              {"© 2026 upsell.ai Infrastructure. All rights reserved."}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[13px] font-bold text-foreground/40 hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-[13px] font-bold text-foreground/40 hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Global Nodes Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
