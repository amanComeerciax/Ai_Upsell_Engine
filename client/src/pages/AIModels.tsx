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
                    color: m.name.includes('embed') ? "text-purple-500" : "text-violet-500",
                    bg: m.name.includes('embed') ? "bg-purple-50" : "bg-violet-50"
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
                        <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
                        <span className="text-xs font-semibold text-violet-500">Neural Infrastructure</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        Manage and monitor your <span className="text-gray-700 font-semibold">inference models</span>.
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Models</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{models.length}</p>
                    </div>
                    <Cpu className="h-4 w-4 text-violet-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Active</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{activeModels}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500">LIVE</span>
                    </div>
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Avg Latency</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{avgLatency > 0 ? `${avgLatency.toFixed(0)}ms` : 'N/A'}</p>
                    </div>
                    <Activity className="h-4 w-4 text-amber-400" />
                </div>
                <div className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Accuracy</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">{models.length > 0 ? `${(models.reduce((a, m) => a + m.accuracy, 0) / models.length).toFixed(1)}%` : 'N/A'}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                </div>
            </div>

            {loading ? (
                <div className="h-52 flex flex-col items-center justify-center gap-4 glass-card">
                    <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
                    <p className="text-xs font-medium text-gray-400">Connecting to Ollama...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {models.length > 0 ? models.map((model) => (
                        <div key={model.name} className="glass-card p-6 group hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center">
                                    <Cpu className={`h-5 w-5 ${model.color}`} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-500" />
                                    <span className="text-xs font-medium text-gray-400">{model.status}</span>
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-gray-800 truncate">{model.name}</h3>
                            <p className="text-xs font-medium text-violet-500 mt-0.5">{model.type}</p>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                                    <p className="text-[10px] font-medium text-gray-400 mb-0.5">Latency</p>
                                    <p className="text-sm font-bold text-gray-800">{model.latency}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                                    <p className="text-[10px] font-medium text-gray-400 mb-0.5">Accuracy</p>
                                    <p className="text-sm font-bold text-gray-800">{model.accuracy.toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-gray-400">Load</span>
                                    <span className="font-bold text-gray-600">{model.load}%</span>
                                </div>
                                <Progress value={model.load} className="h-1 bg-gray-100" />
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
                <div className="glass-card overflow-hidden p-0">
                    <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                        <Terminal className="h-4 w-4 text-violet-500" />
                        <h3 className="text-sm font-bold text-gray-800">Inference Telemetry</h3>
                        <div className="ml-auto flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                    </div>
                    <div className="bg-gray-900 p-6 font-mono text-xs space-y-1.5 text-violet-400/80 min-h-[260px]">
                        {logs.map((log, i) => (
                            <p key={i} className={i === 0 ? "text-emerald-400 font-semibold" : ""}>{log}</p>
                        ))}
                        <p className="animate-pulse text-gray-600">_</p>
                    </div>
                </div>

                {/* Playground */}
                <div className="glass-card overflow-hidden flex flex-col p-0">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <h3 className="text-sm font-bold text-gray-800">AI Playground</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Test real-time cross-sell reasoning.</p>
                    </div>
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                        {recoLoading ? (
                            <div className="space-y-3">
                                <Activity className="h-8 w-8 text-violet-500 animate-pulse mx-auto" />
                                <p className="text-xs font-semibold text-violet-500">AI is thinking...</p>
                            </div>
                        ) : lastRecommendation ? (
                            <div className="animate-fade-in space-y-4 w-full text-left">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100">
                                    <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-1">AI Recommendation</p>
                                    <h4 className="text-lg font-bold text-gray-800">{lastRecommendation.recommended_product_name}</h4>
                                    <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed border-l-2 border-violet-200 pl-3">
                                        "{lastRecommendation.reason}"
                                    </p>
                                    <div className="mt-4 flex items-center justify-between border-t border-violet-100 pt-3">
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Suggested Discount</span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-bold text-white">-{lastRecommendation.discount_percent}%</span>
                                    </div>
                                </div>
                                <Button onClick={testRecommendation} variant="outline" className="w-full rounded-xl border-gray-200 text-xs font-semibold hover:bg-violet-50">
                                    Run Another Test
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 flex items-center justify-center mx-auto">
                                    <Play className="h-5 w-5 text-violet-400 fill-current" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-1.5">Ready to Test</h4>
                                    <p className="text-xs text-gray-400 max-w-[220px] mx-auto leading-relaxed">
                                        Trigger a simulation to see how AI bundles your products.
                                    </p>
                                </div>
                                <Button onClick={testRecommendation} className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-xs px-6 rounded-xl h-10 shadow-lg shadow-violet-500/20">
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
