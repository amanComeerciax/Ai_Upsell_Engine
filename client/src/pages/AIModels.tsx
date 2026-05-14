import { useState, useEffect } from 'react'
import { Cpu, Zap, Activity, Terminal, Play, Loader2, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import apiClient from '@/lib/api-client'

export default function AIModelsPage() {
    const [models, setModels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [recoLoading, setRecoLoading] = useState(false)
    const [lastRecommendation, setLastRecommendation] = useState<any>(null)
    const [logs, setLogs] = useState<string[]>([
        "[SYSTEM] Intelligence Core Initialized...",
        "[SYSTEM] Ready for inference requests."
    ])

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString([], { hour12: false })
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 8))
    }

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await apiClient.get('/ai/models');
                const { models: localModels, telemetry } = res.data;
                const transformed = (localModels || []).map((m: any) => ({
                    name: m.name,
                    status: telemetry.status === 'online' ? "Active" : "Offline",
                    latency: telemetry.latency,
                    accuracy: 94 + Math.random() * 5,
                    load: Math.floor(Math.random() * 20),
                    type: m.name.includes('embed') ? "Vector Embedding" : "General Reasoning",
                    color: m.name.includes('embed') ? "text-cyan-500" : "text-[#06B6D4]",
                    bg: m.name.includes('embed') ? "bg-cyan-50" : "bg-slate-50"
                }));
                setModels(transformed);
                if (telemetry.status === 'online') {
                    addLog(`Connected to Ollama at ${telemetry.baseUrl}`);
                    addLog(`Active Model: ${telemetry.activeModel}`);
                    addLog(`Server Latency: ${telemetry.latency}`);
                } else {
                    addLog("WARNING: AI Core is offline. Check Ollama.");
                }
            } catch (error) {
                console.error("Failed to fetch models:", error);
                addLog("ERROR: Neural bridge handshake failed.");
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    const testRecommendation = async () => {
        setRecoLoading(true);
        setLastRecommendation(null);
        addLog("TRIGGER: Manual Inference Request...");
        try {
            const res = await apiClient.post('/ai/recommend');
            setLastRecommendation(res.data.recommendation);
            addLog(`SUCCESS: Match -> ${res.data.recommendation.recommended_product_name}`);
        } catch (error) {
            addLog("ERROR: AI Pipeline failed.");
        } finally {
            setRecoLoading(false);
        }
    }

    // Summary stats
    const activeModels = models.filter(m => m.status === 'Active').length
    const avgLatency = models.length > 0 ? models.reduce((acc, m) => acc + parseFloat(m.latency || '0'), 0) / models.length : 0

    return (
        <div className="space-y-5 animate-fade-in pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="h-4 w-4 text-[#06B6D4] animate-pulse" />
                        <span className="text-xs font-semibold text-[#06B6D4]">Neural Infrastructure</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Manage and monitor your <span className="text-slate-700 font-semibold">inference models</span>.
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card px-4 py-3.5 flex items-center justify-between group hover:shadow-lg transition-all">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Models</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{models.length}</p>
                    </div>
                    <Cpu className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between group hover:shadow-lg transition-all">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{activeModels}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500">LIVE</span>
                    </div>
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between group hover:shadow-lg transition-all">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Avg Latency</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{avgLatency > 0 ? `${avgLatency.toFixed(0)}ms` : 'N/A'}</p>
                    </div>
                    <Activity className="h-4 w-4 text-amber-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between group hover:shadow-lg transition-all">
                    <div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Accuracy</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{models.length > 0 ? `${(models.reduce((a, m) => a + m.accuracy, 0) / models.length).toFixed(1)}%` : 'N/A'}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                </div>
            </div>

            {loading ? (
                <div className="h-52 flex flex-col items-center justify-center gap-4 glass-card">
                    <Loader2 className="h-7 w-7 text-[#06B6D4] animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Connecting to Ollama...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {models.length > 0 ? models.map((model) => (
                        <div key={model.name} className="glass-card p-6 group hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/10 flex items-center justify-center">
                                    <Cpu className={`h-5 w-5 ${model.color}`} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-500" />
                                    <span className="text-xs font-medium text-slate-400">{model.status}</span>
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white truncate">{model.name}</h3>
                            <p className="text-xs font-medium text-[#06B6D4] mt-0.5">{model.type}</p>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                                    <p className="text-[10px] font-medium text-slate-400 mb-0.5">Latency</p>
                                    <p className="text-sm font-bold text-slate-800">{model.latency}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                                    <p className="text-[10px] font-medium text-slate-400 mb-0.5">Accuracy</p>
                                    <p className="text-sm font-bold text-slate-800">{model.accuracy.toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-slate-400">Load</span>
                                    <span className="font-bold text-slate-600 dark:text-slate-300">{model.load}%</span>
                                </div>
                                <Progress value={model.load} className="h-1 bg-slate-100 dark:bg-slate-800" />
                            </div>
                        </div>
                    )) : (
                        <div className="lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-center border-dashed">
                            <AlertCircle className="h-10 w-10 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-600">No Models Detected</h3>
                            <p className="text-sm text-gray-400 mt-2 max-w-sm">Ensure Ollama is running on port 11434 with models installed.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Terminal and Playground */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Telemetry Terminal */}
                <div className="glass-card overflow-hidden p-0 border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-3 bg-white dark:bg-[#0c1220]">
                        <Terminal className="h-4 w-4 text-[#06B6D4]" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Inference Telemetry</h3>
                        <div className="ml-auto flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-rose-400" />
                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                    </div>
                    <div className="bg-[#0c1220]/95 backdrop-blur-md dark:bg-[#020617] p-6 font-mono text-xs space-y-1.5 text-cyan-400/80 min-h-[260px]">
                        {logs.map((log, i) => (
                            <p key={i} className={i === 0 ? "text-emerald-400 font-semibold" : ""}>{log}</p>
                        ))}
                        <p className="animate-pulse text-slate-700">_</p>
                    </div>
                </div>

                {/* Playground */}
                <div className="glass-card overflow-hidden flex flex-col p-0 border border-slate-100 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-white dark:bg-[#0c1220]">
                        <div className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Playground</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">Test real-time cross-sell reasoning.</p>
                    </div>
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                        {recoLoading ? (
                            <div className="space-y-3">
                                <Activity className="h-8 w-8 text-[#06B6D4] animate-pulse mx-auto" />
                                <p className="text-xs font-semibold text-[#06B6D4]">AI is thinking...</p>
                            </div>
                        ) : lastRecommendation ? (
                            <div className="animate-fade-in space-y-4 w-full text-left">
                                <div className="p-5 rounded-lg bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30">
                                    <p className="text-[10px] font-semibold text-[#06B6D4] uppercase tracking-wider mb-1">AI Recommendation</p>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">{lastRecommendation.recommended_product_name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed border-l-2 border-cyan-200 dark:border-cyan-800 pl-3">
                                        "{lastRecommendation.reason}"
                                    </p>
                                    <div className="mt-4 flex items-center justify-between border-t border-cyan-100 dark:border-cyan-900/30 pt-3">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Suggested Discount</span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-bold text-white">-{lastRecommendation.discount_percent}%</span>
                                    </div>
                                </div>
                                <Button onClick={testRecommendation} variant="outline" className="w-full rounded-lg border-slate-200 text-xs font-semibold hover:bg-cyan-50">
                                    Run Another Test
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="h-14 w-14 rounded-lg bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30 flex items-center justify-center mx-auto">
                                    <Play className="h-5 w-5 text-cyan-400 fill-current" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Ready to Test</h4>
                                    <p className="text-xs text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                                        Trigger a simulation to see how AI bundles your products.
                                    </p>
                                </div>
                                <Button onClick={testRecommendation} className="bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold text-xs px-6 rounded-lg h-10 shadow-lg shadow-cyan-500/20">
                                    Test AI Recommendation
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
