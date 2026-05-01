import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun, ArrowRight } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Link } from "react-router-dom"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { toggleTheme, isDark } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex flex-col items-center px-4 sm:px-6",
        scrolled ? "py-4" : "py-6 sm:py-8"
      )}
    >
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "w-full max-w-[1400px] flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-[24px] transition-all duration-500 relative",
          scrolled 
            ? "bg-white/70 dark:bg-black/70 backdrop-blur-[12px] border border-black/[0.03] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            : "bg-transparent border border-transparent"
        )}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-0 group relative">
          <style>{`
            @keyframes logo-wave {
              0%, 100% { transform: translateY(0); }
              25% { transform: translateY(-3px); }
              75% { transform: translateY(1px); }
            }
            @keyframes logo-glow-wave {
              0%, 40%, 100% { text-shadow: none; }
              20% { text-shadow: 0 0 8px #22d3ee, 0 0 20px rgba(34,211,238,0.4); }
            }
            @keyframes logo-ai-glow-wave {
              0%, 40%, 100% { text-shadow: none; filter: brightness(1); }
              20% { text-shadow: 0 0 10px #22d3ee, 0 0 25px rgba(34,211,238,0.5); filter: brightness(1.5); }
            }
            .logo-wave-letter {
              display: inline-block;
              animation: logo-wave 2.5s ease-in-out infinite, logo-glow-wave 2.5s ease-in-out infinite;
            }
            .logo-wave-ai {
              display: inline-block;
              animation: logo-wave 2.5s ease-in-out infinite, logo-ai-glow-wave 2.5s ease-in-out infinite;
            }
          `}</style>
          {['u','p','s','e','l','l'].map((ch, i) => (
            <span
              key={i}
              className="logo-wave-letter text-2xl font-extrabold tracking-tight text-foreground"
              style={{ animationDelay: `${i * 0.12}s` }}
            >{ch}</span>
          ))}
          {['.','a','i'].map((ch, i) => (
            <span
              key={`ai-${i}`}
              className="logo-wave-ai text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              style={{ animationDelay: `${(6 + i) * 0.12}s` }}
            >{ch}</span>
          ))}
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group relative text-[13px] font-bold text-foreground/50 transition-colors hover:text-foreground uppercase tracking-widest"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-[18px] w-[18px]" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-[18px] w-[18px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <div className="h-4 w-px bg-black/[0.05] dark:bg-white/[0.1] mx-1" />

          <SignedOut>
            <Link to="/login">
              <Button variant="ghost" className="text-[13px] font-bold text-foreground/70 px-5 hover:bg-transparent hover:text-foreground uppercase tracking-widest transition-colors">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="rounded-xl bg-black dark:bg-white text-white dark:text-black px-6 h-10 text-[12px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/5">
                Build Engine
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link to="/dashboard">
              <Button variant="ghost" className="text-[13px] font-bold text-foreground/70 px-5 hover:bg-transparent hover:text-foreground flex items-center gap-2 uppercase tracking-widest transition-colors">
                Console <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <div className="p-0.5 rounded-xl border border-black/5 dark:border-white/10">
              <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8 rounded-lg' } }} />
            </div>
          </SignedIn>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="lg:hidden text-foreground p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative z-[60]"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.nav>

      {/* Mobile Full-Screen Overlay Menu — Portaled to body */}
      {mobileOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] lg:hidden"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-20 left-4 right-4 bg-white dark:bg-gray-950 rounded-[24px] shadow-2xl border border-black/10 dark:border-white/10 overflow-auto max-h-[calc(100vh-6rem)]">
            {/* Close button inside */}
            <div className="flex justify-end p-4 pb-0">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 px-6 pb-8 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xl font-bold text-foreground/80 hover:text-foreground transition-colors tracking-tighter py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-4 pt-6 border-t border-black/5 dark:border-white/5">
                <SignedOut>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="justify-start text-lg font-bold h-auto p-0 tracking-tight">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-2xl bg-black dark:bg-white text-white dark:text-black h-14 text-lg font-black uppercase tracking-widest shadow-xl">
                      Get Started Free
                    </Button>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-2xl bg-black dark:bg-white text-white dark:text-black h-14 text-lg font-black uppercase tracking-widest shadow-xl">
                      Console Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center gap-4 py-4 px-2 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl">
                    <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-10 w-10 rounded-xl' } }} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Profile</span>
                      <span className="text-sm font-bold text-foreground">Management Console</span>
                    </div>
                  </div>
                </SignedIn>

                <div className="flex items-center justify-between pt-4 px-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-black">Theme Mode</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-12 w-12 rounded-xl text-muted-foreground bg-black/5 dark:bg-white/5"
                  >
                    {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}

