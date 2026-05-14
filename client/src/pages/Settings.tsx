import { useState, useEffect } from 'react'
import { Save, Sparkles, Store, RefreshCw, Unplug, CheckCircle2, AlertCircle, Loader2, Percent, Zap } from 'lucide-react'
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

    const [emailSubject, setEmailSubject] = useState('')
    const [emailBody, setEmailBody] = useState('')
    const [savingTemplate, setSavingTemplate] = useState(false)

    // Discount range
    const [discountMin, setDiscountMin] = useState(5)
    const [discountMax, setDiscountMax] = useState(25)
    
    // Progress Bar settings
    const [shippingThreshold, setShippingThreshold] = useState(100)
    const [progressBarActive, setProgressBarActive] = useState(false)
    
    const [savingGeneral, setSavingGeneral] = useState(false)

    useEffect(() => {
        if (merchant) {
            setEmailSubject(merchant.email_subject || '')
            setEmailBody(merchant.email_body || '')
            setDiscountMin(merchant.discount_min ?? 5)
            setDiscountMax(merchant.discount_max ?? 25)
            setShippingThreshold(Number(merchant.shipping_threshold ?? 100))
            setProgressBarActive(merchant.progress_bar_active ?? false)
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

    const handleSaveGeneral = async () => {
        try {
            setSavingGeneral(true)
            await updateSettings({
                discount_min: discountMin,
                discount_max: discountMax,
                shipping_threshold: shippingThreshold,
                progress_bar_active: progressBarActive
            })
            alert('Settings saved successfully!')
        } catch (err: any) {
            alert(`Failed to save: ${err.message}`)
        } finally {
            setSavingGeneral(false)
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
                    <div className="h-6 w-[2px] bg-[#06B6D4]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#06B6D4]">
                        {merchant?.business_name || 'My Store'}
                    </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
                <p className="text-sm text-slate-400 mt-1 font-medium">
                    Configure your AI upsell engine & Shopify integration
                </p>
            </div>

            {/* Merchant Info Strip */}
            {merchant && (
                <div className="flex items-center gap-6 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Merchant ID</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{merchant.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Plan</span>
                        <span className="text-xs font-bold text-[#06B6D4] uppercase">{merchant.plan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Products</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{merchant.stats.products}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Orders</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{merchant.stats.orders}</span>
                    </div>
                </div>
            )}

            {/* Settings Tabs */}
            <Tabs defaultValue="integration" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-1 rounded-xl">
                    <TabsTrigger value="integration" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-[#06B6D4] data-[state=active]:text-white data-[state=active]:shadow-lg shadow-cyan-500/20 text-slate-600 dark:text-slate-400">
                        <Store className="h-3.5 w-3.5 mr-2" />
                        Shopify
                    </TabsTrigger>
                    <TabsTrigger value="general" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-[#06B6D4] data-[state=active]:text-white data-[state=active]:shadow-lg shadow-cyan-500/20 text-slate-600 dark:text-slate-400">General</TabsTrigger>
                    <TabsTrigger value="templates" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-[#06B6D4] data-[state=active]:text-white data-[state=active]:shadow-lg shadow-cyan-500/20 text-slate-600 dark:text-slate-400">Email Templates</TabsTrigger>
                    <TabsTrigger value="ai" className="rounded-lg px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-[#06B6D4] data-[state=active]:text-white data-[state=active]:shadow-lg shadow-cyan-500/20 text-slate-600 dark:text-slate-400">AI Configuration</TabsTrigger>
                </TabsList>

                {/* Integration Tab — NOW WITH REAL FUNCTIONALITY */}
                <TabsContent value="integration" className="space-y-6">
                    {isShopifyConnected ? (
                        /* Connected State */
                        <div className="space-y-6">
                            <div className="rounded-lg border border-cyan-100 dark:border-cyan-900/30 bg-cyan-50/20 dark:bg-cyan-900/10 p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-[#06B6D4]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Shopify Connected</h3>
                                            <p className="text-sm text-cyan-600 dark:text-cyan-400 font-bold">{merchant?.shopify_shop_name}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-rose-100 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                        onClick={handleDisconnect}
                                    >
                                        <Unplug className="h-3 w-3 mr-2" />
                                        Disconnect
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Manual Installation</h4>
                                            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                                                Copy the snippet below and paste it before the closing <code>&lt;/body&gt;</code> tag in your theme's <code>theme.liquid</code> file.
                                            </p>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                            <div className="relative p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-cyan-400 break-all select-all">
                                                {scriptSnippet}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(scriptSnippet);
                                                alert('Snippet copied to clipboard!');
                                            }}
                                            className="w-full bg-[#06B6D4] text-white hover:bg-[#0891B2] rounded-lg font-bold uppercase tracking-widest text-[10px] h-11"
                                        >
                                            Copy Snippet
                                        </Button>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/[0.02] dark:bg-white/[0.03] border border-white/5 dark:border-white/10 flex flex-col justify-center space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Instructions</span>
                                        </div>
                                        <ul className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic space-y-2">
                                            <li>1. Go to Shopify Admin &rarr; Online Store &rarr; Themes.</li>
                                            <li>2. Click **Actions** &rarr; **Edit Code**.</li>
                                            <li>3. Find `theme.liquid` and paste the code at the very bottom.</li>
                                            <li>4. Save and refresh your store.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Products Synced</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{merchant?.stats.products || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Orders Tracked</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{merchant?.stats.orders || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Upsell Events</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{merchant?.stats.upsells || 0}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSyncProducts}
                                        disabled={syncing}
                                        className="bg-slate-900 dark:bg-white dark:text-black text-white hover:bg-slate-800 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        {syncing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                                        Re-Sync Products
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => refreshMerchant()}
                                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] dark:border-slate-700"
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
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                                    <Store className="h-6 w-6 text-[#06B6D4]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Connect Your Shopify Store</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Enter your store name and access token to get started
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Shop Name</Label>
                                        <div className="flex items-center">
                                            <Input
                                                value={shopName}
                                                onChange={(e) => setShopName(e.target.value)}
                                                placeholder="my-store"
                                                className="h-12 rounded-l-lg rounded-r-none bg-white border-slate-200 font-bold focus-visible:ring-cyan-200"
                                            />
                                            <span className="h-12 px-3 flex items-center bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs text-slate-500 font-mono">
                                                .myshopify.com
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Access Token</Label>
                                        <Input
                                            type="password"
                                            value={accessToken}
                                            onChange={(e) => setAccessToken(e.target.value)}
                                            placeholder="shpat_xxxxxxxxxxxx"
                                            className="h-12 rounded-lg bg-white border-slate-200 font-mono font-bold focus-visible:ring-cyan-200"
                                        />
                                    </div>
                                </div>

                                {connectError && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-100">
                                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                        <p className="text-sm text-rose-500 font-bold">{connectError}</p>
                                    </div>
                                )}

                                {connectSuccess && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-50 border border-cyan-100">
                                        <CheckCircle2 className="h-4 w-4 text-[#06B6D4] shrink-0" />
                                        <p className="text-sm text-cyan-600 font-bold">{connectSuccess}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleConnectShopify}
                                    disabled={connecting}
                                    className="w-full h-14 bg-[#06B6D4] text-white hover:bg-[#0891B2] rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-cyan-500/10 group"
                                >
                                    {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Store className="h-4 w-4 mr-2" />}
                                    Connect Shopify Store
                                </Button>

                                <div className="p-6 rounded-lg border border-cyan-100 bg-cyan-50/20 space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-cyan-600 dark:text-[#06B6D4]">How to get your Access Token</h4>
                                    <ol className="text-xs text-slate-500 font-medium leading-relaxed space-y-2 list-decimal pl-4">
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

                        {/* Discount Range Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <Percent className="h-5 w-5 text-[#06B6D4]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Discount Range</h4>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Min-Max discount the AI can apply on upsell offers</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minimum Discount</Label>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-cyan-50 text-[#06B6D4] text-xs font-bold">{discountMin}%</span>
                                    </div>
                                    <Slider
                                        value={[discountMin]}
                                        onValueChange={(v) => {
                                            const newMin = v[0]
                                            setDiscountMin(newMin)
                                            if (newMin > discountMax) setDiscountMax(newMin)
                                        }}
                                        min={0}
                                        max={40}
                                        step={5}
                                        className="py-2"
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium italic">Lowest possible discount for any campaign</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Maximum Discount</Label>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-cyan-50 text-[#06B6D4] text-xs font-bold">{discountMax}%</span>
                                    </div>
                                    <Slider
                                        value={[discountMax]}
                                        onValueChange={(v) => {
                                            const newMax = v[0]
                                            setDiscountMax(newMax)
                                            if (newMax < discountMin) setDiscountMin(newMax)
                                        }}
                                        min={5}
                                        max={50}
                                        step={5}
                                        className="py-2"
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium italic">Highest possible discount for any campaign</p>
                                </div>
                            </div>

                            {/* Preview bar */}
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Range</span>
                                    <span className="text-xs font-bold text-slate-900">{discountMin}% — {discountMax}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-cyan-400 to-[#06B6D4] rounded-full transition-all"
                                        style={{
                                            left: `${(discountMin / 50) * 100}%`,
                                            width: `${((discountMax - discountMin) / 50) * 100}%`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] text-slate-400">0%</span>
                                    <span className="text-[9px] text-slate-400">50%</span>
                                </div>
                            </div>
                        </div>

                        {/* Gamified Progress Bar Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-[#06B6D4]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Gamified Progress Bar</h4>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Drive users to free shipping with AI-suggested impulse buys</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                    <Switch checked={progressBarActive} onCheckedChange={setProgressBarActive} className="data-[state=checked]:bg-[#06B6D4]" />
                                    <span className="text-xs font-bold text-slate-500">
                                        {progressBarActive ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Free Shipping Threshold (₹)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                                        <Input
                                            type="number"
                                            value={shippingThreshold}
                                            onChange={(e) => setShippingThreshold(parseInt(e.target.value))}
                                            className="h-11 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] pl-8 text-sm font-bold text-foreground"
                                            placeholder="1000"
                                        />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground font-medium italic mt-1 leading-relaxed">
                                        We'll suggest products that bridge the gap to this amount.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-500/[0.02] border border-blue-500/10 h-fit">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">AI Strategy</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-medium italic leading-relaxed">
                                        When enabled, our widget will automatically identify "low entropy" impulse buys (under <span className="text-blue-500 font-bold">₹{shippingThreshold}</span>) to boost your AOV.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveGeneral}
                            disabled={savingGeneral}
                            className="h-10 px-6 rounded-lg bg-[#06B6D4] text-white hover:bg-[#0891B2] text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/10"
                        >
                            {savingGeneral ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Settings
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
                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{'{name}'}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{'{product}'}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{'{recommendation}'}</span>
                                </div>
                                <Button
                                    onClick={handleSaveTemplate}
                                    disabled={savingTemplate}
                                >
                                    {savingTemplate && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Save Template
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/50 bg-secondary/50 p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
                            <div className="bg-background rounded-lg p-6 border border-border/40">
                                <p className="text-sm text-foreground mb-4">
                                    <strong>Subject:</strong> {parsePreview(emailSubject || 'Complete your purchase with {product}')}
                                </p>
                                <div className="text-sm text-muted-foreground space-y-3 whitespace-pre-wrap">
                                    {parsePreview(emailBody || "Hi {name}, we noticed you purchased {product}. Based on your order, we think you'll love {recommendation}!")}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* AI Configuration Tab */}
                <TabsContent value="ai" className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-7 space-y-6">
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-8 space-y-8 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Ollama Inference Core</h3>
                                    <p className="text-sm text-slate-400 mt-1 font-medium">
                                        Fine-tune the local brain of your upsell engine.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Inference Model</Label>
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
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Repetition Penalty</Label>
                                            <Input
                                                type="number"
                                                defaultValue={1.1}
                                                step={0.1}
                                                className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-slate-100">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Creativity (Temperature)</Label>
                                                <span className="text-xs font-bold text-[#06B6D4]">{temperature[0]}</span>
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
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Diversity (Top P)</Label>
                                                <span className="text-xs font-bold text-emerald-500">0.9</span>
                                            </div>
                                            <Slider
                                                defaultValue={[0.9]}
                                                max={1}
                                                step={0.05}
                                                className="py-4"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Max Reasoning Tokens</Label>
                                            <Input
                                                type="number"
                                                defaultValue={512}
                                                className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-bold"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stop Sequence</Label>
                                            <Input
                                                defaultValue='"JSON_END"'
                                                className="h-12 rounded-xl bg-foreground/[0.02] border-foreground/[0.06] font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full h-14 bg-[#06B6D4] text-white hover:bg-[#0891B2] rounded-lg font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-cyan-500/20 group">
                                    <Save className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                                    Synchronize Neural Engine
                                </Button>
                            </div>
                        </div>

                        <div className="xl:col-span-5 space-y-6">
                            <Card className="border-cyan-100 dark:border-cyan-900/30 bg-cyan-50/20 dark:bg-cyan-900/10 rounded-lg overflow-hidden">
                                <CardHeader className="border-b border-cyan-100/50 dark:border-cyan-900/30">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-[#06B6D4]" />
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Logic Preview</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="rounded-lg bg-slate-950 border border-slate-800 p-6 font-mono text-[11px] leading-relaxed text-cyan-400">
                                        <span className="text-slate-500">// System Instruction Fragment</span><br />
                                        "role": "system",<br />
                                        "content": "You are Velocity AI. Temperature is set to <span className="text-cyan-500 font-bold">{temperature[0]}</span>.
                                        Format output as 100% valid JSON. Ensure logic matches high-velocity ecommerce patterns."<br /><br />

                                        <span className="text-slate-500">// Inference Parameters</span><br />
                                        "num_predict": 512,<br />
                                        "top_p": 0.9,<br />
                                        "repeat_penalty": 1.1
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Real-time Connection: Stable</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed border-l-2 border-cyan-500/30 pl-4">
                                            "Changes made here affect the prompt engineering and response behavior of your local models instantly."
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="p-8 rounded-lg border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-orange-500">Localhost Optimization</h4>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
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
