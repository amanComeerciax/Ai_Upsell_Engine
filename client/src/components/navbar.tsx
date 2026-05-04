import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Link } from "react-router-dom"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"


const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // useTheme available for future theme toggle
  useTheme()

  // Effect for scroll handling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Effect for body scroll lock
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none' // Extra lock for some mobile browsers
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 flex justify-center",
          scrolled ? "top-2" : "top-0"
        )}
      >
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "w-full max-w-7xl flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500",
            scrolled
              ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/5"
              : "bg-transparent border border-transparent"
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
              <img src="/logo-icon.png" alt="Upsell.ai Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Upsell<span className="text-cyan-500">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-3">
              <SignedOut>
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
                    Log In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 px-4 py-2 text-sm font-semibold">
                    Start Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <button className="px-4 py-2 text-sm font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors">
                    Dashboard
                  </button>
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-10 w-10 rounded-xl"
                    }
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onPointerDown={() => setMobileOpen(true)}
              className="md:hidden h-10 w-10 rounded-xl flex items-center justify-center bg-white/10 text-white transition-transform active:scale-90"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Menu Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onPointerDown={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
              />

              {/* Menu Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[300px] bg-white dark:bg-slate-900 z-[201] shadow-2xl flex flex-col p-8"
              >
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/10">
                      <img src="/logo-icon.png" alt="Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-xl font-bold dark:text-white">Upsell<span className="text-cyan-500">.ai</span></span>
                  </div>
                  <button
                    onPointerDown={() => setMobileOpen(false)}
                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {navLinks.map((link, i) => (
                    <motion.a
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={link.label}
                      href={link.href}
                      onPointerDown={() => setMobileOpen(false)}
                      className="text-2xl font-bold text-slate-900 dark:text-white hover:text-cyan-500 transition-colors flex items-center justify-between group"
                    >
                      {link.label}
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </motion.a>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/10 flex flex-col gap-4">
                  <SignedOut>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full h-12 rounded-xl">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>
                      <button className="w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                      <UserButton
                        appearance={{
                          elements: {
                            userButtonAvatarBox: "h-10 w-10 rounded-xl"
                          }
                        }}
                      />
                      <span className="text-sm font-semibold dark:text-white">Account Settings</span>
                    </div>
                  </SignedIn>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
