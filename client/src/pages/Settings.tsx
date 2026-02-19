import { useState, useEffect } from 'react'
import { Save, Sparkles, Store, RefreshCw, Unplug, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
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
import { useMerchant } from '@/contexts/MerchantContext'

export default function SettingsPage() {
    const { merchant, isShopifyConnected, connectShopify, syncProducts, disconnectShopify, refreshMerchant, updateSettings } = useMerchant()

    const [timingStrategy, setTimingStrategy] = useState('purchase')
    const [delayHours, setDelayHours] = useState(48)
    const [enabled, setEnabled] = useState(true)
    const [temperature, setTemperature] = useState([0.7])

    // Shopify connection state
    const [shopName, setShopName] = useState('')
    const [accessToken, setAccessToken] = useState('')
    const [connecting, setConnecting] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [connectError, setConnectError] = useState<string | null>(null)
    const [connectSuccess, setConnectSuccess] = useState<string | null>(null)
    const [syncResult, setSyncResult] = useState<string | null>(null)

    // Email Template state
    const [emailSubject, setEmailSubject] = useState('')
    const [emailBody, setEmailBody] = useState('')
    const [savingTemplate, setSavingTemplate] = useState(false)

    // Sync state when merchant loaded
    useEffect(() => {
        if (merchant) {
            setEmailSubject(merchant.email_subject || '')
            setEmailBody(merchant.email_body || '')
        }
    }, [merchant])

    const handleConnectShopify = async () => {
        if (!shopName || !accessToken) {
            setConnectError('Please enter both shop name and access token.')
            return
        }
        try {
            setConnecting(true)
            setConnectError(null)
            setConnectSuccess(null)
            await connectShopify(shopName, accessToken)
            setConnectSuccess(`✅ Connected to ${shopName}.myshopify.com!`)
            setShopName('')
            setAccessToken('')
        } catch (err: any) {
            setConnectError(err.message)
        } finally {
            setConnecting(false)
        }
    }

    const handleSyncProducts = async () => {
        try {
            setSyncing(true)
            setSyncResult(null)
            const result = await syncProducts()
            if (result) {
                setSyncResult(`✅ Synced ${result.count} products from Shopify!`)
            }
        } catch (err: any) {
            setSyncResult(`❌ ${err.message}`)
        } finally {
            setSyncing(false)
        }
    }

    const handleDisconnect = async () => {
        if (confirm('Are you sure you want to disconnect your Shopify store?')) {
            await disconnectShopify()
            setConnectSuccess(null)
            setSyncResult(null)
        }
    }

    const handleSaveTemplate = async () => {
        try {
            setSavingTemplate(true)
            await updateSettings({
                email_subject: emailSubject,
                email_body: emailBody
            })
            alert('Template saved successfully!')
        } catch (err: any) {
            alert(`Failed to save template: ${err.message}`)
        } finally {
            setSavingTemplate(false)
        }
    }

    const parsePreview = (text: string) => {
        return text
            .replace(/{name}/g, 'John')
            .replace(/{product}/g, 'Premium Headphones')
            .replace(/{recommendation}/g, 'Wireless Mouse')
    }

    const scriptSnippet = `<script src="https://keila-arousable-bimolecularly.ngrok-free.dev/widget.js" async></script>`;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-6 w-[2px] bg-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                        {merchant?.business_name || 'My Store'}
                    </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                    Configure your AI upsell engine & Shopify integration
                </p>
            </div>

            {/* Merchant Info Strip */}
            {merchant && (
                <div className="flex items-center gap-6 p-4 rounded-2xl border border-foreground/[0.04] bg-foreground/[0.01]">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Merchant ID</span>
                        <span className="text-xs font-bold text-foreground">{merchant.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Plan</span>
                        <span className="text-xs font-bold text-blue-500 uppercase">{merchant.plan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Products</span>
                        <span className="text-xs font-bold text-foreground">{merchant.stats.products}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Orders</span>
                        <span className="text-xs font-bold text-foreground">{merchant.stats.orders}</span>
                    </div>
                </div>
            )}

            {/* Settings Tabs */}
            <Tabs defaultValue="integration" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="integration">
                        <Store className="h-3.5 w-3.5 mr-2" />
                        Shopify
                    </TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="templates">Email Templates</TabsTrigger>
                    <TabsTrigger value="ai">AI Configuration</TabsTrigger>
                </TabsList>

                {/* Integration Tab — NOW WITH REAL FUNCTIONALITY */}
                <TabsContent value="integration" className="space-y-6">
                    {isShopifyConnected ? (
                        /* Connected State */
                        <div className="space-y-6">
                            <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Shopify Connected</h3>
                                            <p className="text-sm text-emerald-500 font-bold">{merchant?.shopify_shop_name}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                                        onClick={handleDisconnect}
                                    >
                                        <Unplug className="h-3 w-3 mr-2" />
                                        Disconnect
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-foreground/[0.04]">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight italic">Manual Installation</h4>
                                            <p className="text-[11px] text-muted-foreground font-medium italic mt-1 leading-relaxed">
                                                Copy the snippet below and paste it before the closing <code>&lt;/body&gt;</code> tag in your theme's <code>theme.liquid</code> file.
                                            </p>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                            <div className="relative p-4 rounded-xl bg-[#0c0e14] border border-foreground/[0.06] font-mono text-[10px] text-blue-400 break-all select-all">
                                                {scriptSnippet}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(scriptSnippet);
                                                alert('Snippet copied to clipboard!');
                                            }}
                                            className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold uppercase tracking-widest text-[10px] h-11"
                                        >
                                            Copy Snippet
                                        </Button>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.04] flex flex-col justify-center space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Instructions</span>
                                        </div>
                                        <ul className="text-[11px] text-muted-foreground font-medium leading-relaxed italic space-y-2">
                                            <li>1. Go to Shopify Admin &rarr; Online Store &rarr; Themes.</li>
                                            <li>2. Click **Actions** &rarr; **Edit Code**.</li>
                                            <li>3. Find `theme.liquid` and paste the code at the very bottom.</li>
                                            <li>4. Save and refresh your store.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Products Synced</p>
                                        <p className="text-2xl font-black">{merchant?.stats.products || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Orders Tracked</p>
                                        <p className="text-2xl font-black">{merchant?.stats.orders || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Upsell Events</p>
                                        <p className="text-2xl font-black">{merchant?.stats.upsells || 0}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSyncProducts}
                                        disabled={syncing}
                                        className="bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        {syncing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                                        Re-Sync Products
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => refreshMerchant()}
                                        className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        <RefreshCw className="h-3 w-3 mr-2" />
                                        Refresh Stats
                                    </Button>
                                </div>

                                {syncResult && (
                                    <p className="text-sm font-bold text-emerald-500">{syncResult}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Not Connected State */
                        <div className="rounded-[2rem] border border-foreground/[0.04] bg-foreground/[0.01] p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                    <Store className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Connect Your Shopify Store</h3>
                                    <p className="text-sm text-muted-foreground font-medium italic">
                                        Enter your store name and access token to get started
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Shop Name</Label>
                                        <div className="flex items-center">
                                            <Input
                                                value={shopName}
                                                onChange={(e) => setShopName(e.target.value)}
                                                placeholder="my-store"
                                                className="h-12 rounded-l-xl rounded-r-none bg-foreground/[0.02] border-foreground/[0.06] font-bold"
                                            />
                                            <span className="h-12 px-3 flex items-center bg-foreground/[0.04] border border-l-0 border-foreground/[0.06] rounded-r-xl text-xs text-muted-foreground font-mono">
                                                .myshopify.com
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Access Token</Label>
                                        <Input
                                            type="password"
                                            value={accessToken}
                                            onChange={(e) => setAccessToken(e.target.value)}
                                            placeholder="shpat_xxxxxxxxxxxx"
                                            className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-mono font-bold"
                                        />
                                    </div>
                                </div>

                                {connectError && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <p className="text-sm text-red-500 font-bold">{connectError}</p>
                                    </div>
                                )}

                                {connectSuccess && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <p className="text-sm text-emerald-500 font-bold">{connectSuccess}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleConnectShopify}
                                    disabled={connecting}
                                    className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-foreground/10 group"
                                >
                                    {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Store className="h-4 w-4 mr-2" />}
                                    Connect Shopify Store
                                </Button>

                                <div className="p-6 rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-blue-500">How to get your Access Token</h4>
                                    <ol className="text-xs text-muted-foreground font-medium leading-relaxed space-y-2 list-decimal pl-4">
                                        <li>Go to your Shopify Admin → <strong>Settings → Apps → Develop apps</strong></li>
                                        <li>Create a new app or open an existing one</li>
                                        <li>Configure <strong>Admin API scopes</strong>: read_products, read_orders, write_orders, <strong>write_script_tags, read_script_tags</strong></li>
                                        <li>Install the app and copy the <strong>Admin API access token</strong></li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

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

                {/* Email Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Template Editor</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label>Subject Line</Label>
                                    <Input
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Complete your purchase with {product}"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Email Body</Label>
                                    <Textarea
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Hi {name}, we noticed you purchased {product}. Based on your order, we think you'll love {recommendation}..."
                                        rows={10}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => setEmailBody(prev => prev + '{name}')} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{'{name}'}</button>
                                    <button onClick={() => setEmailBody(prev => prev + '{product}')} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{'{product}'}</button>
                                    <button onClick={() => setEmailBody(prev => prev + '{recommendation}')} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{'{recommendation}'}</button>
                                </div>
                                <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                                    {savingTemplate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Template
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
                            <div className="bg-background rounded-lg p-6 border border-border/40">
                                <p className="text-sm text-foreground mb-4">
                                    <strong>Subject:</strong> {emailSubject ? parsePreview(emailSubject) : 'Complete your purchase with Premium Headphones'}
                                </p>
                                <div className="text-sm text-muted-foreground space-y-3 whitespace-pre-wrap">
                                    {emailBody ? parsePreview(emailBody) : (
                                        <>
                                            <p>Hi John,</p>
                                            <p>
                                                We noticed you purchased Premium Headphones. Based on your order, we think you'll love our Wireless Mouse!
                                            </p>
                                            <p>Get 20% off with code UPSELL20</p>
                                        </>
                                    )}
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
