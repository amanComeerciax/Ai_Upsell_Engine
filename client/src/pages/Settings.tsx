import { useState } from 'react'
import { Save, Copy, TestTube, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function SettingsPage() {
    const [timingStrategy, setTimingStrategy] = useState('purchase')
    const [delayHours, setDelayHours] = useState(48)
    const [enabled, setEnabled] = useState(true)
    const [temperature, setTemperature] = useState([0.7])

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure your AI upsell engine
                </p>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="integration">Integration</TabsTrigger>
                    <TabsTrigger value="templates">Email Templates</TabsTrigger>
                    <TabsTrigger value="ai">AI Configuration</TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Campaign Settings</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Configure when and how campaigns are sent
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={enabled} onCheckedChange={setEnabled} />
                                <span className="text-sm text-muted-foreground">
                                    {enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Timing Strategy</Label>
                                <Select value={timingStrategy} onValueChange={setTimingStrategy}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="purchase">Purchase-based (48h after order)</SelectItem>
                                        <SelectItem value="delivery">Delivery-based</SelectItem>
                                        <SelectItem value="smart">Smart AI-based</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Delay (hours)</Label>
                                <Input
                                    type="number"
                                    value={delayHours}
                                    onChange={(e) => setDelayHours(parseInt(e.target.value))}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </TabsContent>

                {/* Integration Tab */}
                <TabsContent value="integration" className="space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Shopify Integration</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Connect your Shopify store
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-green-400 font-medium">Connected</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Webhook URL</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input value="https://api.aiupsell.com/webhook/shopify/abc123" readOnly />
                                    <Button variant="outline" size="icon">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button variant="outline">
                                <TestTube className="h-4 w-4 mr-2" />
                                Test Webhook
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Email Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Template Editor</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label>Subject Line</Label>
                                    <Input
                                        placeholder="Complete your purchase with {product}"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Email Body</Label>
                                    <Textarea
                                        placeholder="Hi {name}, we noticed you purchased {product}. Based on your order, we think you'll love {recommendation}..."
                                        rows={10}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{'{name}'}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{'{product}'}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{'{recommendation}'}</span>
                                </div>
                                <Button>Save Template</Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
                            <div className="bg-background rounded-lg p-6 border border-border/40">
                                <p className="text-sm text-foreground mb-4">
                                    <strong>Subject:</strong> Complete your purchase with Premium Headphones
                                </p>
                                <div className="text-sm text-muted-foreground space-y-3">
                                    <p>Hi John,</p>
                                    <p>
                                        We noticed you purchased Premium Headphones. Based on your order, we think you'll love our Wireless Mouse!
                                    </p>
                                    <p>Get 20% off with code UPSELL20</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* AI Configuration Tab */}
                <TabsContent value="ai" className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-7 space-y-6">
                            <div className="rounded-[2rem] border border-foreground/[0.04] bg-foreground/[0.01] p-8 space-y-8 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Ollama Inference Core</h3>
                                    <p className="text-sm text-muted-foreground mt-1 font-medium italic underline decoration-blue-500/30 underline-offset-4">
                                        Fine-tune the local brain of your upsell engine.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active Inference Model</Label>
                                            <Select defaultValue="dolphin-llama3:latest">
                                                <SelectTrigger className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-foreground/[0.08] bg-background/95 backdrop-blur-xl">
                                                    <SelectItem value="dolphin-llama3:latest">dolphin-llama3 (Recommended)</SelectItem>
                                                    <SelectItem value="phi3:mini">phi3:mini (Fastest)</SelectItem>
                                                    <SelectItem value="mistral:latest">mistral:latest</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Repetition Penalty</Label>
                                            <Input
                                                type="number"
                                                defaultValue={1.1}
                                                step={0.1}
                                                className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-foreground/[0.04]">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Creativity (Temperature)</Label>
                                                <span className="text-xs font-black text-blue-500">{temperature[0]}</span>
                                            </div>
                                            <Slider
                                                value={temperature}
                                                onValueChange={setTemperature}
                                                max={1}
                                                step={0.1}
                                                className="py-4"
                                            />
                                            <p className="text-[10px] text-muted-foreground font-medium italic">
                                                Higher values make recommendations more diverse/creative.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Diversity (Top P)</Label>
                                                <span className="text-xs font-black text-purple-500">0.9</span>
                                            </div>
                                            <Slider
                                                defaultValue={[0.9]}
                                                max={1}
                                                step={0.05}
                                                className="py-4"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-foreground/[0.04]">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Max Reasoning Tokens</Label>
                                            <Input
                                                type="number"
                                                defaultValue={512}
                                                className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-bold"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Stop Sequence</Label>
                                            <Input
                                                defaultValue='"JSON_END"'
                                                className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-foreground/10 group">
                                    <Save className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                                    Synchronize Neural Engine
                                </Button>
                            </div>
                        </div>

                        <div className="xl:col-span-5 space-y-6">
                            <Card className="border-blue-500/20 bg-blue-500/[0.02] rounded-[2rem] overflow-hidden">
                                <CardHeader className="border-b border-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-blue-500" />
                                        <CardTitle className="text-sm font-black uppercase tracking-widest">Logic Preview</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="rounded-2xl bg-[#0c0e14] border border-foreground/[0.06] p-6 font-mono text-[11px] leading-relaxed text-blue-400 opacity-60">
                                        <span className="text-muted-foreground">// System Instruction Fragment</span><br />
                                        "role": "system",<br />
                                        "content": "You are Velocity AI. Temperature is set to <span className="text-blue-500 font-bold">{temperature[0]}</span>.
                                        Format output as 100% valid JSON. Ensure logic matches high-velocity ecommerce patterns."<br /><br />

                                        <span className="text-muted-foreground">// Inference Parameters</span><br />
                                        "num_predict": 512,<br />
                                        "top_p": 0.9,<br />
                                        "repeat_penalty": 1.1
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Real-time Connection: Stable</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
                                            "Changes made here affect the prompt engineering and response behavior of your local models instantly."
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="p-8 rounded-[2rem] border border-orange-500/20 bg-orange-500/[0.02] space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-orange-500">Localhost Optimization</h4>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                    Running models locally on Ollama requires minimum **16GB RAM** for 8B models to ensure latency stays under 500ms.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
