import { useEffect, useState } from 'react'
import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    Shield, 
    Crown,
    ExternalLink,
    Store
} from 'lucide-react'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

interface Merchant {
    id: number;
    business_name: string | null;
    email: string | null;
    shopify_shop_name: string | null;
    plan: string | null;
    subscription_status: string | null;
    role: string;
    created_at: string;
}

export default function AdminMerchants() {
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchMerchants()
    }, [])

    const fetchMerchants = async () => {
        try {
            const res = await apiClient.get('/admin/merchants')
            setMerchants(res.data)
        } catch (err) {
            console.error('[Admin] Fetch merchants failed:', err)
            toast.error('Failed to load merchant list')
        } finally {
            setLoading(false)
        }
    }

    const updatePlan = async (id: number, plan: string) => {
        try {
            await apiClient.patch(`/admin/merchants/${id}`, { plan })
            toast.success(`Merchant updated to ${plan} plan`)
            fetchMerchants()
        } catch (err) {
            toast.error('Failed to update merchant plan')
        }
    }

    const filteredMerchants = merchants.filter(m => 
        m.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.shopify_shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Merchants...</div>
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <Store className="h-8 w-8 text-[#06B6D4]" />
                        Merchant Directory
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage all registered stores and subscriptions.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 font-bold text-[#06B6D4] bg-cyan-50 border-cyan-200">
                    {merchants.length} Total Stores
                </Badge>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                    <Input 
                        placeholder="Search by name, email or shop URL..." 
                        className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-cyan-200 rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-11 rounded-lg font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-slate-700">Business</TableHead>
                            <TableHead className="font-bold text-slate-700">Shopify Store</TableHead>
                            <TableHead className="font-bold text-slate-700">Plan</TableHead>
                            <TableHead className="font-bold text-slate-700">Created</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMerchants.map((merchant) => (
                            <TableRow key={merchant.id} className="group hover:bg-cyan-50/30 transition-colors">
                                <TableCell>
                                    <div className="font-extrabold text-slate-900">{merchant.business_name || 'Unnamed Merchant'}</div>
                                    <div className="text-xs text-slate-400 font-medium">{merchant.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 font-bold text-[#06B6D4] hover:underline cursor-pointer">
                                        {merchant.shopify_shop_name || 'Not Connected'}
                                        {merchant.shopify_shop_name && <ExternalLink className="h-3 w-3" />}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            className={merchant.plan === 'pro' 
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold" 
                                                : "bg-slate-50 text-slate-600 border-slate-100 font-bold"
                                            }
                                        >
                                            {merchant.plan === 'pro' && <Crown className="h-3 w-3 mr-1" />}
                                            {merchant.plan?.toUpperCase()}
                                        </Badge>
                                        {merchant.role === 'admin' && (
                                            <Badge className="bg-cyan-50 text-cyan-700 border-cyan-100 font-bold">
                                                <Shield className="h-3 w-3 mr-1" /> ADMIN
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-500">
                                    {new Date(merchant.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white border-transparent">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                                            <DropdownMenuLabel className="font-bold px-3 py-1.5 text-xs text-gray-400 uppercase tracking-widest">Plan Management</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => updatePlan(merchant.id, 'pro')} className="rounded-lg font-semibold">
                                                <Crown className="h-4 w-4 mr-2 text-amber-500" /> Upgrade to Pro
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updatePlan(merchant.id, 'free')} className="rounded-lg font-semibold">
                                                Downgrade to Free
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="rounded-lg font-semibold text-red-500">
                                                Deactivate Merchant
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
