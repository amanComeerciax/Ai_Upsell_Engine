import { useState } from 'react'
import { Save, Copy, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
                <TabsContent value="ai" className="space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">AI Model Settings</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure OpenAI integration
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>OpenAI API Key</Label>
                                <Input
                                    type="password"
                                    placeholder="sk-••••••••••••••••"
                                    className="mt-2 font-mono"
                                />
                            </div>

                            <div>
                                <Label>Model</Label>
                                <Select defaultValue="gpt-4">
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Temperature: {temperature[0]}</Label>
                                <Slider
                                    value={temperature}
                                    onValueChange={setTemperature}
                                    max={1}
                                    step={0.1}
                                    className="mt-2"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Higher values make output more creative, lower values more focused
                                </p>
                            </div>

                            <div>
                                <Label>Max Tokens</Label>
                                <Input
                                    type="number"
                                    defaultValue={150}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Configuration
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
