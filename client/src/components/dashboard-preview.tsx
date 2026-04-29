import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { motion } from "framer-motion"
import { TrendingUp, DollarSign, Activity, Zap, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

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


const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 4900 },
  { month: "Apr", revenue: 7200 },
  { month: "May", revenue: 8900 },
  { month: "Jun", revenue: 11200 },
  { month: "Jul", revenue: 10100 },
  { month: "Aug", revenue: 13400 },
]

const kpis = [
  {
    label: "Conversion Lift",
    value: "36.2%",
    change: "+12.3%",
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Upsell Revenue",
    value: "$13.4K",
    change: "+24.1%",
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "AI Decisions",
    value: "84,720",
    change: "+8.7%",
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    label: "System Health",
    value: "99.99%",
    change: "Live",
    icon: Activity,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export function DashboardPreview() {
  return (
    <section id="dashboard" className="relative py-24 md:py-40 bg-[#fafafa] dark:bg-black font-['Inter',sans-serif] overflow-hidden selection:bg-blue-500/30">
      {/* Background visual elements & Section Transition Glow */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
        <div className="absolute top-0 w-1/2 max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-[1px]" />
        <div className="absolute top-[-200px] w-[800px] h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none" />
      </div>

      <div className="absolute top-40 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-[1200px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto mb-20 md:mb-28"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md px-4 py-2 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Live System Feed</span>
          </div>
          <h2 className="flex flex-col items-center leading-[0.85] tracking-tighter w-full px-2">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-black dark:text-white max-w-full">
              Command Center
            </span>
            <span className="mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold pb-2 max-w-full relative">
              <ShinyText text="For Your Growth." className="text-wrap sm:text-nowrap" />
            </span>
          </h2>
          <p className="mt-8 text-base md:text-xl text-black/60 dark:text-white/60 font-normal leading-relaxed max-w-2xl mx-auto">
            Monitor AI performance in real-time. Track every automated decision, conversion uplift, and revenue attribution across your entire ecosystem.
          </p>
        </motion.div>

        {/* Dashboard Shell */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-[32px] md:rounded-[48px] border border-black/5 dark:border-white/10 bg-white dark:bg-black/40 p-4 md:p-10 shadow-2xl shadow-black/5 dark:shadow-white/5 overflow-hidden group/shell"
        >
          {/* Internal Decorative Glow */}
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/[0.03] dark:bg-blue-500/[0.05] blur-[100px] pointer-events-none" />

          {/* Top Bar / Navigation Mockup */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-10 border-b border-black/5 dark:border-white/5 pb-6">
            <div className="flex gap-3">
              <div className="h-7 w-20 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5" />
              <div className="h-7 w-20 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 opacity-50" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.2em] hidden md:block">Streaming Analytics</div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* KPI Section */}
            <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <motion.div 
                  variants={itemVariants}
                  key={kpi.label} 
                  className="group/card p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] transition-all duration-300 hover:border-black/10 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center transition-transform group-hover/card:scale-110 duration-300", kpi.bg)}>
                      <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                      {kpi.change}
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-medium tracking-tight text-black dark:text-white mb-1">{kpi.value}</div>
                  <div className="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-widest">{kpi.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Main Chart Area */}
            <motion.div variants={itemVariants} className="lg:col-span-8 p-6 md:p-8 rounded-[32px] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-black dark:text-white">Revenue Trajectory</h3>
                  <p className="text-sm text-black/40 dark:text-white/40 font-normal">AI-attributed growth over time</p>
                </div>
                <div className="flex gap-2 p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  <div className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-slate-50 dark:text-black text-[10px] font-bold shadow-md">7D</div>
                  <div className="px-4 py-1.5 rounded-full text-black/40 dark:text-white/40 text-[10px] font-bold hover:text-black dark:hover:text-white transition-colors">30D</div>
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="currentColor" vertical={false} opacity={0.03} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'currentColor', opacity: 0.2, fontSize: 10, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '16px', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#dashboardGradient)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Side Analytics */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div variants={itemVariants} className="p-8 rounded-[32px] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col items-center justify-center text-center relative overflow-hidden group/index">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/index:opacity-100 transition-opacity duration-500" />
                <div className="relative h-32 w-32 mb-6">
                  <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <path className="text-black/5 dark:text-white/5" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <motion.path 
                      initial={{ strokeDasharray: "0, 100" }}
                      whileInView={{ strokeDasharray: "75, 100" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="text-blue-500" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-medium tracking-tight text-black dark:text-white">75%</span>
                    <span className="text-[10px] font-bold text-black/30 dark:text-white/30 tracking-widest uppercase mt-[-4px]">Efficiency</span>
                  </div>
                </div>
                <h4 className="font-medium text-black dark:text-white tracking-tight">System Performance</h4>
                <p className="text-xs text-black/40 dark:text-white/40 mt-2 max-w-[200px] leading-relaxed font-normal">Our AI model's current probability lift against standard baselines.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="p-6 rounded-[32px] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center gap-4 group/metric cursor-pointer hover:bg-emerald-500/5 transition-colors duration-300">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 transition-transform duration-300 group-hover/metric:scale-110">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-black/30 dark:text-white/30 tracking-widest uppercase">Quick Metric</div>
                  <div className="text-xl font-medium tracking-tight text-black dark:text-white">+$2,410 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase ml-1">Today</span></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
