import { useState, useEffect } from 'react';
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
        return (
            <div className="h-56 flex items-center justify-center glass-card">
                <p className="text-xs font-medium text-gray-400 animate-pulse">Calculating ROI Lift...</p>
            </div>
        );
    }

    if (!metrics) return null;

    const chartData = [
        { name: 'Group A (AI)', rate: metrics.groupA.rate, fill: '#7C3AED' },
        { name: 'Group B (Control)', rate: metrics.groupB.rate, fill: '#D1D5DB' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Lift Card */}
            <div className="glass-card overflow-hidden relative lg:col-span-1 p-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-purple-500/10" />
                <div className="absolute top-4 right-4 opacity-10">
                    <Sparkles className="h-20 w-20 text-violet-500" />
                </div>
                <div className="relative z-10 p-7">
                    <div className="flex items-center gap-2 mb-5">
                        <ArrowUpRight className="h-4 w-4 text-violet-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-600">Conversion Lift</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-5xl font-extrabold tracking-tight text-gray-800">+{metrics.lift}%</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Boost</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-gray-500">
                        {metrics.summary}
                    </p>
                    <div className="mt-5 flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/60 border border-violet-100">
                        <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Real-time A/B Analysis</span>
                    </div>
                </div>
            </div>

            {/* Comparison Chart */}
            <div className="glass-card lg:col-span-2 p-0 overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Performance Split</h3>
                            <p className="text-xs font-medium text-gray-400 mt-0.5">Group A (Personalized) vs Group B (Generic)</p>
                        </div>
                        <FlaskConical className="h-4 w-4 text-gray-300" />
                    </div>
                </div>
                <div className="p-7">
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={11}
                                    fontWeight={600}
                                    width={110}
                                    tick={{ fill: '#6B7280' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(val: number) => [`${val}%`, 'Conv. Rate']}
                                />
                                <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={28}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI Group (A)</p>
                            <p className="text-xl font-bold text-gray-800">
                                {metrics.groupA.conversions} / {metrics.groupA.total}
                                <span className="text-xs font-semibold text-violet-500 ml-2">Orders</span>
                            </p>
                        </div>
                        <div className="space-y-1 border-l border-gray-100 pl-4">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Control Group (B)</p>
                            <p className="text-xl font-bold text-gray-800">
                                {metrics.groupB.conversions} / {metrics.groupB.total}
                                <span className="text-xs font-semibold text-gray-400 ml-2">Orders</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
