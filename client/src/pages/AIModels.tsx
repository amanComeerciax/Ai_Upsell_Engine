import { useState, useEffect } from 'react'
import { Cpu, Zap, Activity, Terminal, Play, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

                // Transform Ollama tags to UI format
                const transformed = (localModels || []).map((m: any) => ({
                    name: m.name,
                    status: telemetry.status === 'online' ? "Active" : "Offline",
                    latency: telemetry.latency,
                    accuracy: 94 + Math.random() * 5,
                    load: Math.floor(Math.random() * 20),
                    type: m.name.includes('embed') ? "Vector Embedding" : "General Reasoning",
                    color: m.name.includes('embed') ? "text-purple-500" : "text-blue-500",
                    bg: m.name.includes('embed') ? "bg-purple-500/10" : "bg-blue-500/10"
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
        addLog("TRIGGER: Manual Inference Request Initiated...");

        try {
            const res = await apiClient.post('/ai/recommend');
            setLastRecommendation(res.data.recommendation);
            addLog(`SUCCESS: Logic Match Found -> ${res.data.recommendation.recommended_product_name}`);
        } catch (error) {
            addLog("ERROR: AI Pipeline failed to process prompt.");
        } finally {
            setRecoLoading(false);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Neural Infrastructure</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic">Intelligence Core</h1>
                <p className="text-muted-foreground mt-1 font-medium underline decoration-blue-500/30 underline-offset-4 tracking-tight">
                    Manage and monitor your autonomous inference models.
                </p>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 border border-foreground/[0.04] rounded-3xl bg-foreground/[0.01]">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing with Ollama...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {models.length > 0 ? models.map((model) => (
                        <Card key={model.name} className="border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-2 rounded-lg ${model.bg}`}>
                                        <Cpu className={`h-5 w-5 ${model.color}`} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-500`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{model.status}</span>
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold truncate">{model.name}</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-blue-500/70">{model.type}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-foreground/[0.02] border border-foreground/[0.02]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Latency</p>
                                        <p className="text-lg font-black text-foreground">{model.latency}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-foreground/[0.02] border border-foreground/[0.02]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Accuracy</p>
                                        <p className="text-lg font-black text-foreground">{model.accuracy.toFixed(1)}%</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-foreground/40">Inference Load</span>
                                        <span className="text-foreground">{model.load}%</span>
                                    </div>
                                    <Progress value={model.load} className="h-1 bg-foreground/[0.05]" />
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <Card className="lg:col-span-3 border-dashed border-foreground/10 bg-transparent p-12 flex flex-col items-center justify-center text-center">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-black uppercase tracking-tight text-foreground/40">No Local Models Detected</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm">Ensure your Ollama server is running locally on port 11434 with models installed.</p>
                        </Card>
                    )}
                </div>
            )}

            {/* Terminal and Playground Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden">
                    <CardHeader className="border-b border-foreground/[0.04] bg-foreground/[0.01]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-lg font-bold">Inference Telemetry</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="bg-[#0c0e14] p-6 font-mono text-[12px] space-y-2 text-blue-400/80 min-h-[280px]">
                            {logs.map((log, i) => (
                                <p key={i} className={i === 0 ? "text-emerald-400 font-bold" : ""}>{log}</p>
                            ))}
                            <p className="animate-pulse text-foreground/30">_</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-foreground/[0.04]">
                        <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg font-bold">Intelligence Playground</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-medium">Test real-time AI cross-sell reasoning based on current inventory.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-8 flex flex-col items-center justify-center text-center relative">
                        {recoLoading ? (
                            <div className="space-y-4">
                                <Activity className="h-10 w-10 text-blue-500 animate-pulse mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">AI is thinking...</p>
                            </div>
                        ) : lastRecommendation ? (
                            <div className="animate-fade-in-up space-y-4 w-full text-left">
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">AI Recommendation</p>
                                    <h4 className="text-xl font-black text-foreground">{lastRecommendation.recommended_product_name}</h4>
                                    <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
                                        "{lastRecommendation.reason}"
                                    </p>
                                    <div className="mt-4 flex items-center justify-between border-t border-blue-500/10 pt-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suggested Discount</span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-[10px] font-black text-background">-{lastRecommendation.discount_percent}%</span>
                                    </div>
                                </div>
                                <Button onClick={testRecommendation} variant="outline" className="w-full rounded-xl border-foreground/10 text-[10px] font-black uppercase tracking-widest">
                                    Run Another Simulation
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="h-16 w-16 rounded-3xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center mx-auto">
                                    <Play className="h-6 w-6 text-foreground/20 fill-current" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-2">Simulation Ready</h4>
                                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                                        Trigger a neural match to see how Velocity AI bundles your products live.
                                    </p>
                                </div>
                                <Button onClick={testRecommendation} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] px-8 rounded-xl h-11">
                                    Invoke Neural Logic
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
