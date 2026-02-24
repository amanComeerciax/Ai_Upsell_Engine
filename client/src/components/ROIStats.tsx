import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowUpRight, FlaskConical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import apiClient from '@/lib/api-client';

export function ROIStats() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await apiClient.get('/analytics/ab-test');
                setMetrics(res.data);
            } catch (error) {
                console.error('Failed to fetch AB metrics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) {
        return <div className="h-64 flex items-center justify-center animate-pulse bg-foreground/[0.02] rounded-3xl border border-foreground/[0.04]">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calculating ROI Lift...</p>
        </div>;
    }

    if (!metrics) return null;

    const chartData = [
        { name: 'Group A (AI)', rate: metrics.groupA.rate, fill: '#3b82f6' },
        { name: 'Group B (Control)', rate: metrics.groupB.rate, fill: '#94a3b8' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lift Card */}
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 lg:col-span-1 overflow-hidden relative border border-foreground/5">
                <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5">
                    <Sparkles className="h-24 w-24 text-blue-600 dark:text-blue-400" />
                </div>
                <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Conversion Lift</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter italic text-foreground">+{metrics.lift}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Boost</span>
                    </div>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground dark:text-white/60 lowercase first-letter:uppercase">
                        {metrics.summary}
                    </p>
                    <div className="mt-6 flex items-center gap-4 py-3 px-4 rounded-xl bg-foreground/5 dark:bg-white/5 backdrop-blur-sm border border-foreground/5 dark:border-white/5">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/50">Real-time A/B Analysis</span>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison Chart */}
            <Card className="border-foreground/[0.04] bg-foreground/[0.01] lg:col-span-2">
                <CardHeader className="px-8 py-6 border-b border-foreground/[0.04]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Performance Split</CardTitle>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Group A (Personalized) vs Group B (Generic)</p>
                        </div>
                        <FlaskConical className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={10}
                                    fontWeight="black"
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '12px' }}
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(val: number) => [`${val}%`, 'Conv. Rate']}
                                />
                                <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={32}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-foreground/[0.04]">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Group (A)</p>
                            <p className="text-xl font-black italic">{metrics.groupA.conversions} / {metrics.groupA.total} <span className="text-[10px] not-italic text-blue-500 ml-1">Orders</span></p>
                        </div>
                        <div className="space-y-1 border-l border-foreground/[0.04] pl-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Control Group (B)</p>
                            <p className="text-xl font-black italic">{metrics.groupB.conversions} / {metrics.groupB.total} <span className="text-[10px] not-italic text-muted-foreground ml-1">Orders</span></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
