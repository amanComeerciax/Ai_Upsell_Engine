import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Zap, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { setTheme } = useTheme()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
        <a href="#" className="flex items-center gap-2.5">
          <Zap className="h-6 w-6 text-foreground" />
          <span className="text-xl font-bold tracking-tight text-foreground">upsell<span className="text-muted-foreground/60">.ai</span></span>
        </a>

        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const isDarkNow = document.documentElement.classList.contains('dark')
              setTheme(isDarkNow ? 'light' : 'dark')
            }}
            className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          <Button variant="ghost" className="text-[15px] font-semibold text-foreground px-5 hover:bg-transparent">
            Log In
          </Button>
          <Button variant="outline" className="rounded-xl border-foreground/10 bg-transparent px-6 h-11 text-[15px] font-semibold hover:bg-foreground hover:text-background transition-all">
            Sign Up (Free)
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 border-t border-border/10 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-6 px-8 py-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-lg font-medium text-foreground/80"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-4 pt-8 border-t border-border/10">
              <Button variant="ghost" className="justify-start text-lg font-medium h-auto p-0">
                Log In
              </Button>
              <Button className="w-full rounded-xl bg-primary text-primary-foreground h-14 text-lg font-bold">
                Sign Up (Free)
              </Button>
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Theme</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const isDarkNow = document.documentElement.classList.contains('dark')
                    setTheme(isDarkNow ? 'light' : 'dark')
                  }}
                  className="h-12 w-12 text-muted-foreground"
                >
                  {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
