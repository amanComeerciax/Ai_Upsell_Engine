import { useState, useEffect } from 'react'
import { Save, Sparkles, Store, RefreshCw, Unplug, CheckCircle2, AlertCircle, Loader2, Zap, Layout, Mail, Terminal, Settings2 } from 'lucide-react'
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
import { useMerchant } from '@/contexts/MerchantContext'

export default function SettingsPage() {
    const { merchant, isShopifyConnected, connectShopify, syncProducts, disconnectShopify, refreshMerchant, updateSettings } = useMerchant()

    const [timingStrategy, setTimingStrategy] = useState('purchase')
    const [delayHours, setDelayHours] = useState(48)
    const [enabled, setEnabled] = useState(true)
    const [temperature, setTemperature] = useState([0.7])

    const [shopName, setShopName] = useState('')
    const [accessToken, setAccessToken] = useState('')
    const [connecting, setConnecting] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [connectError, setConnectError] = useState<string | null>(null)
    const [syncResult, setSyncResult] = useState<string | null>(null)

    const [emailSubject, setEmailSubject] = useState('')
    const [emailBody, setEmailBody] = useState('')
    const [savingTemplate, setSavingTemplate] = useState(false)

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
            await connectShopify(shopName, accessToken)
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
        <div className="space-y-5 animate-fade-in pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Settings2 className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-semibold text-violet-500">Configuration</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium max-w-lg">
                        Fine-tune your <span className="text-gray-700 font-semibold">engine settings</span> and manage integrations.
                    </p>
                </div>
            </div>

            {/* Merchant Info */}
            {merchant && (
                <div className="glass-card p-5 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Status</span>
                        <span className="text-sm font-semibold text-gray-700">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Plan</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-semibold">
                            {merchant.plan}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-medium text-gray-500">{merchant.stats.products} Products / {merchant.stats.orders} Orders</span>
                    </div>
                </div>
            )}

            {/* Settings Tabs */}
            <Tabs defaultValue="integration" className="space-y-5">
                <TabsList className="bg-white/80 border border-gray-200 rounded-xl p-1 gap-1 h-auto shadow-sm">
                    <TabsTrigger value="integration" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                        <Store className="h-3.5 w-3.5 mr-1.5" />
                        Integration
                    </TabsTrigger>
                    <TabsTrigger value="general" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                        <Layout className="h-3.5 w-3.5 mr-1.5" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                        <Terminal className="h-3.5 w-3.5 mr-1.5" />
                        AI Config
                    </TabsTrigger>
                </TabsList>

                {/* Integration Tab */}
                <TabsContent value="integration" className="space-y-5 animate-fade-in">
                    {isShopifyConnected ? (
                        <div className="space-y-5">
                            <div className="glass-card p-8">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Shopify Connected</h3>
                                            <p className="text-sm text-emerald-500 font-semibold mt-0.5">{merchant?.shopify_shop_name}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleDisconnect}
                                        className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold px-5 h-10"
                                    >
                                        <Unplug className="h-4 w-4 mr-2" />
                                        Disconnect
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-2">Widget Script Snippet</h4>
                                            <p className="text-xs text-gray-400 font-medium mb-4 leading-relaxed">
                                                Copy this into your theme's <code className="text-violet-600 font-semibold">theme.liquid</code> before the closing tag.
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <div className="p-4 rounded-xl bg-gray-900 font-mono text-xs text-violet-400 break-all select-all leading-relaxed border border-gray-800">
                                                {scriptSnippet}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(scriptSnippet);
                                                alert('Snippet copied to clipboard!');
                                            }}
                                            className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/20"
                                        >
                                            Copy Snippet
                                        </Button>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                            <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">Setup Instructions</span>
                                        </div>
                                        <ol className="text-xs text-gray-500 font-medium leading-relaxed space-y-3 list-decimal pl-5">
                                            <li>Navigate to Shopify Admin → Themes → Edit Code</li>
                                            <li>Locate <code className="text-violet-600 font-semibold">theme.liquid</code> in Layout</li>
                                            <li>Paste the script snippet at the bottom</li>
                                            <li>Clear browser cache and refresh</li>
                                        </ol>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                                    {[
                                        { label: "Products", value: merchant?.stats.products || 0 },
                                        { label: "Orders", value: merchant?.stats.orders || 0 },
                                        { label: "Upsells", value: merchant?.stats.upsells || 0 },
                                    ].map(s => (
                                        <div key={s.label} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={handleSyncProducts}
                                        disabled={syncing}
                                        className="h-10 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/20"
                                    >
                                        {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                        Sync Products
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => refreshMerchant()}
                                        className="h-10 px-6 border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>

                                {syncResult && (
                                    <p className="mt-4 text-xs font-semibold text-emerald-500">{syncResult}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center">
                                    <Store className="h-6 w-6 text-violet-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Connect Shopify</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-0.5">
                                        Authorize the AI engine to access your Shopify data.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Shop Name</Label>
                                    <div className="flex items-center">
                                        <Input
                                            value={shopName}
                                            onChange={(e) => setShopName(e.target.value)}
                                            placeholder="store-name"
                                            className="h-11 rounded-l-xl rounded-r-none bg-gray-50 border-gray-200 focus-visible:ring-violet-200 text-sm"
                                        />
                                        <span className="h-11 px-4 flex items-center bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl text-xs text-gray-400 font-medium">
                                            .myshopify.com
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin API Token</Label>
                                    <Input
                                        type="password"
                                        value={accessToken}
                                        onChange={(e) => setAccessToken(e.target.value)}
                                        placeholder="shpat_••••••••"
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-violet-200 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            {connectError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-500 font-medium">{connectError}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleConnectShopify}
                                disabled={connecting}
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/20"
                            >
                                {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                                Connect Store
                            </Button>

                            <div className="p-5 rounded-xl border border-violet-100 bg-violet-50/50 space-y-3">
                                <h4 className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">How to get your API token</h4>
                                <ol className="text-xs text-gray-500 font-medium leading-relaxed space-y-2 list-decimal pl-5">
                                    <li>Admin → Settings → Apps → Develop apps</li>
                                    <li>Create app with <code className="text-violet-600 font-semibold">read/write_products</code> & <code className="text-violet-600 font-semibold">read/write_orders</code></li>
                                    <li>Add <code className="text-violet-600 font-semibold">read/write_script_tags</code> for widget injection</li>
                                    <li>Install and copy the Access Token</li>
                                </ol>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-5 animate-fade-in">
                    <div className="glass-card p-8 space-y-8">
                        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Upsell Settings</h3>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">
                                    Define triggers for AI recommendations.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                <Switch checked={enabled} onCheckedChange={setEnabled} className="data-[state=checked]:bg-violet-500" />
                                <span className="text-xs font-semibold text-gray-600">
                                    {enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Timing Strategy</Label>
                                <Select value={timingStrategy} onValueChange={setTimingStrategy}>
                                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-200 bg-white shadow-lg">
                                        <SelectItem value="purchase" className="text-xs font-medium py-2">Purchase-based (48h delay)</SelectItem>
                                        <SelectItem value="delivery" className="text-xs font-medium py-2">Post-delivery</SelectItem>
                                        <SelectItem value="smart" className="text-xs font-medium py-2">AI-powered selection</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Delay (Hours)</Label>
                                <Input
                                    type="number"
                                    value={delayHours}
                                    onChange={(e) => setDelayHours(parseInt(e.target.value))}
                                    className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm font-semibold"
                                />
                            </div>
                        </div>

                        <Button className="h-10 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/20">
                            <Save className="h-4 w-4 mr-2" />
                            Save Settings
                        </Button>
                    </div>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <div className="glass-card p-8 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Email Template</h3>
                                <p className="text-xs text-gray-400 font-medium mt-1">Configure your email template fields.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Subject Line</Label>
                                    <Input
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Complete your purchase with {product}"
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm focus-visible:ring-violet-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Body</Label>
                                    <Textarea
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Hi {name}, we noticed you purchased {product}..."
                                        rows={6}
                                        className="rounded-xl bg-gray-50 border-gray-200 text-sm leading-relaxed p-4 focus-visible:ring-violet-200"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap pt-1">
                                    {['{name}', '{product}', '{recommendation}'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setEmailBody(prev => prev + tag)}
                                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors border border-violet-100"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleSaveTemplate}
                                    disabled={savingTemplate}
                                    className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/20"
                                >
                                    {savingTemplate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Template
                                </Button>
                            </div>
                        </div>

                        <div className="glass-card p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-800">Preview</h3>
                                <Sparkles className="h-4 w-4 text-violet-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="pb-4 border-b border-gray-100">
                                    <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">Subject</p>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {emailSubject ? parsePreview(emailSubject) : 'Complete your purchase with Premium Headphones'}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Body</p>
                                    <div className="text-sm text-gray-500 space-y-3 font-medium leading-relaxed border-l-2 border-violet-200 pl-4">
                                        {emailBody ? parsePreview(emailBody) : (
                                            <>
                                                <p>Hi John,</p>
                                                <p>We noticed you purchased Premium Headphones. Based on your order, we think you'll love our Wireless Mouse!</p>
                                                <p className="font-bold text-violet-600 text-xs">Get 20% off with code UPSELL20</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* AI Tab */}
                <TabsContent value="ai" className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                        <div className="xl:col-span-7">
                            <div className="glass-card p-8 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">AI Parameters</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-0.5">
                                        Configure the local Ollama model settings.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Model</Label>
                                            <Select defaultValue="dolphin-llama3:latest">
                                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm font-medium">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gray-200 bg-white shadow-lg">
                                                    <SelectItem value="dolphin-llama3:latest" className="text-xs font-medium py-2">dolphin-llama3:latest</SelectItem>
                                                    <SelectItem value="phi3:mini" className="text-xs font-medium py-2">phi3:mini (Fast)</SelectItem>
                                                    <SelectItem value="mistral:latest" className="text-xs font-medium py-2">mistral:latest</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Repetition Penalty</Label>
                                            <Input
                                                type="number"
                                                defaultValue={1.1}
                                                step={0.1}
                                                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-sm font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Temperature</Label>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 text-xs font-bold">{temperature[0]}</span>
                                            </div>
                                            <Slider
                                                value={temperature}
                                                onValueChange={setTemperature}
                                                max={1}
                                                step={0.1}
                                                className="py-2"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Top P</Label>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold">0.92</span>
                                            </div>
                                            <Slider
                                                defaultValue={[0.92]}
                                                max={1}
                                                step={0.01}
                                                className="py-2"
                                            />
                                        </div>
                                    </div>

                                    <Button className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/20">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save AI Config
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-5">
                            <div className="glass-card p-6 space-y-5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-violet-500" />
                                    <h4 className="text-sm font-bold text-gray-800">Prompt Preview</h4>
                                </div>
                                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 font-mono text-xs leading-relaxed text-violet-400 shadow-lg">
                                    <span className="text-gray-500">// Prompt Config</span><br />
                                    <span className="text-purple-400">"role"</span>: <span className="text-emerald-400">"system"</span>,<br />
                                    <span className="text-purple-400">"context"</span>: <span className="text-emerald-400">"ecommerce"</span>,<br />
                                    <span className="text-purple-400">"temperature"</span>: <span className="text-white font-bold">{temperature[0]}</span>,<br />
                                    <span className="text-purple-400">"output_format"</span>: <span className="text-emerald-400">"strict_json"</span>,<br />
                                    <span className="text-purple-400">"top_p"</span>: <span className="text-white font-bold">0.92</span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium border-l-2 border-violet-200 pl-3 leading-relaxed">
                                    These parameters update the prompt engineering across all AI execution blocks.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
