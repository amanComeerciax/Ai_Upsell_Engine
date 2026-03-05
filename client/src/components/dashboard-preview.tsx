import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, TrendingUp, DollarSign, Target, Activity, Zap } from "lucide-react"

const conversionData = [
  { month: "Jan", rate: 12 },
  { month: "Feb", rate: 18 },
  { month: "Mar", rate: 15 },
  { month: "Apr", rate: 24 },
  { month: "May", rate: 28 },
  { month: "Jun", rate: 32 },
  { month: "Jul", rate: 29 },
  { month: "Aug", rate: 36 },
]

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
    change: "Stable",
    icon: Activity,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
]

export function DashboardPreview() {
  return (
    <section id="dashboard" className="relative py-24 md:py-40 bg-white dark:!bg-black overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-full max-w-[1400px] bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />

      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/5 bg-foreground/5 px-4 py-1.5 mb-8">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[13px] font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">Live System Feed</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black dark:text-white leading-tight">
              Command <span className="text-black/40 dark:text-white/40">Center</span> <br />
              for Your Growth
            </h2>
          </div>
          <p className="text-xl text-black/70 dark:text-white/50 leading-relaxed max-w-lg">
            Monitor AI performance in real-time. Track every automated decision, conversion uplift, and revenue attribution across your entire ecosystem.
          </p>
        </div>

        {/* Dashboard Shell */}
        <div className="relative rounded-[40px] border border-foreground/[0.06] bg-white dark:bg-white/[0.02] p-4 md:p-12 shadow-2xl shadow-foreground/5 overflow-hidden">
          {/* Internal Glow */}
          <div className="absolute top-0 left-1/4 h-[300px] w-[600px] rounded-full bg-blue-500/[0.05] blur-[100px] pointer-events-none" />

          {/* Top Bar / Navigation Mockup */}
          <div className="flex items-center justify-between mb-12 border-b border-foreground/5 pb-8">
            <div className="flex gap-4">
              <div className="h-8 w-24 rounded-lg bg-foreground/[0.05] animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-foreground/[0.02]" />
              <div className="h-8 w-8 rounded-lg bg-foreground/[0.02]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-black/40 dark:text-white/60 hidden md:block">LAST UPDATED: 2 SECONDS AGO</div>
              <div className="h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* KPI Section */}
            <div className="lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="group p-6 rounded-3xl border border-foreground/[0.06] bg-white dark:bg-white/[0.02] transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`h-10 w-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{kpi.change}</span>
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-black dark:text-white mb-1">{kpi.value}</div>
                  <div className="text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-widest">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Main Chart Area */}
            <div className="lg:col-span-8 p-8 rounded-[32px] border border-foreground/5 bg-foreground/[0.01]">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white">Revenue Trajectory</h3>
                  <p className="text-sm text-black/60 dark:text-white/50">AI-attributed post-purchase growth</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-bold">7D</div>
                  <div className="px-3 py-1 rounded-full border border-foreground/10 text-foreground/40 text-[10px] font-bold">30D</div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="currentColor" vertical={false} opacity={0.05} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      hide
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#chartGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Analytics */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 rounded-[32px] border border-foreground/5 bg-foreground/[0.01] flex flex-col items-center justify-center text-center">
                <div className="relative h-32 w-32 mb-6">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path className="text-foreground/5" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-500" strokeDasharray="75, 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">75%</span>
                    <span className="text-[10px] font-bold text-foreground/40 tracking-widest">LIFT</span>
                  </div>
                </div>
                <h4 className="font-bold text-black dark:text-white">Efficiency Index</h4>
                <p className="text-sm text-black/60 dark:text-white/50 mt-2">Current AI model accuracy and conversion probability lift.</p>
              </div>

              <div className="p-6 rounded-[32px] border border-foreground/5 bg-foreground/[0.01] flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground/60 tracking-widest uppercase">Quick Metric</div>
                  <div className="text-xl font-bold">+$2,410 <span className="text-[10px] text-emerald-500">TODAY</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
