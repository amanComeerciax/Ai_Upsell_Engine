import { useState, useEffect, useMemo } from 'react'
import apiClient from '@/lib/api-client'
import {
    Package, Search, Filter, ArrowUpRight, TrendingUp, AlertCircle,
    MoreHorizontal, Loader2, RefreshCcw, Pencil, BarChart2, Trash2,
    ChevronLeft, ChevronRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Product } from '@/types/dashboard'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useMerchant } from '@/contexts/MerchantContext'
import { cn } from '@/lib/utils'

type EditForm = { name: string; category: string; price: string }

export default function InventoryPage() {
    const navigate = useNavigate()
    const { syncProducts } = useMerchant()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const PAGE_SIZE = 12
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState<EditForm>({ name: '', category: '', price: '' })
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [stats, setStats] = useState({
        totalProducts: "0",
        upsellPerformance: "+0%",
        lowStockItems: "0",
        totalRevenue: "₹0"
    })

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, statsRes] = await Promise.all([
                apiClient.get('/products'),
                apiClient.get('/products/stats')
            ]);
            setProducts(productsRes.data);
            setStats({
                totalProducts: statsRes.data.totalProducts.toLocaleString(),
                upsellPerformance: statsRes.data.performanceIncrease,
                lowStockItems: "0",
                totalRevenue: `₹${Number(statsRes.data.totalRevenue).toLocaleString()}`
            });
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const result = await syncProducts();
            if (result) {
                await fetchData();
                toast.success(`Shopify Sync Complete! Synced ${result.count} products.`);
            }
        } catch (error: any) {
            console.error("Sync failed:", error);
            toast.error(`Sync failed: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    }

    const openEditModal = (product: Product) => {
        setEditingProduct(product)
        setEditForm({ name: product.name, category: product.category, price: String(product.price) })
    }

    const handleSaveEdit = async () => {
        if (!editingProduct) return
        setSaving(true)
        try {
            await apiClient.patch(`/products/${editingProduct.id}`, {
                name: editForm.name,
                category: editForm.category,
                price: parseFloat(editForm.price),
            })
            toast.success(`"${editForm.name}" updated successfully!`)
            setEditingProduct(null)
            await fetchData()
        } catch (err: any) {
            toast.error(`Failed to update: ${err?.response?.data?.error || err.message}`)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (product: Product) => {
        if (!confirm(`⚠️ Delete "${product.name}"?\n\nThis will also remove all related upsell history. This cannot be undone.`)) return
        setDeletingId(product.id)
        try {
            await apiClient.delete(`/products/${product.id}`)
            toast.success(`"${product.name}" removed from inventory.`)
            await fetchData()
        } catch (err: any) {
            toast.error(`Failed to delete: ${err?.response?.data?.error || err.message}`)
        } finally {
            setDeletingId(null)
        }
    }

    useEffect(() => { fetchData(); }, []);

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const pageWindow = useMemo(() => {
        const delta = 2;
        const range: number[] = [];
        for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
            range.push(i);
        }
        return range;
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-5 animate-fade-in pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Package className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-semibold text-violet-500">Inventory Control</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium max-w-lg">
                        Manage your catalog and monitor <span className="text-gray-700 font-semibold">performance</span> per SKU.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        variant="outline"
                        className="h-10 border-violet-200 bg-violet-50/50 text-violet-600 hover:bg-violet-100/50 rounded-xl text-xs font-semibold px-5"
                    >
                        {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                        Sync Shopify
                    </Button>
                    <Button className="h-10 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold px-5 shadow-lg shadow-violet-500/20">
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-violet-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 flex items-center justify-center">
                            <Package className="h-5 w-5 text-violet-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{stats.totalProducts}</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">Total Products</p>
                </div>
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">{stats.upsellPerformance}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{stats.upsellPerformance}</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">AI Lift</p>
                </div>
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-amber-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{stats.lowStockItems}</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">Stock Alerts</p>
                </div>
                <div className="glass-card p-5 group cursor-pointer hover:shadow-lg hover:shadow-purple-500/5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 flex items-center justify-center">
                            <ArrowUpRight className="h-5 w-5 text-purple-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 tracking-tight">{stats.totalRevenue}</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">Total Revenue</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Filters */}
                <div className="glass-card p-4 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or category..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="bg-white/60 border-gray-200 pl-10 h-10 rounded-xl text-sm focus-visible:ring-violet-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-10 border-gray-200 rounded-xl px-4 text-xs font-semibold text-gray-600 hover:bg-violet-50">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <span className="text-xs font-medium text-gray-400 px-3">
                            {filteredProducts.length} results
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-24 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                            <span className="text-sm font-medium text-gray-400">Loading products...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/80">
                                    <TableRow className="border-gray-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-semibold text-gray-400 py-3 px-6 uppercase tracking-wider">Product</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Category</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-gray-400 text-right px-6 uppercase tracking-wider">Price</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-gray-400 text-right px-6 uppercase tracking-wider">Revenue</TableHead>
                                        <TableHead className="w-[60px] px-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20">
                                                <p className="text-sm font-medium text-gray-400">
                                                    {searchQuery ? `No matches for "${searchQuery}"` : 'No products. Sync your catalog.'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedProducts.map((product) => (
                                        <TableRow key={product.id} className="border-gray-50 hover:bg-violet-50/30 transition-colors group">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        {product.imageURL ? (
                                                            <img src={product.imageURL} alt={product.name} className="h-full w-full object-contain p-1.5" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-700 group-hover:text-violet-600 transition-colors">{product.name}</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">SKU_{product.shopifyId || product.id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-50/50 text-gray-500 text-xs font-medium">
                                                    {product.category}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-6 font-semibold text-sm text-gray-700">
                                                ₹{Number(product.price).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-emerald-500">₹{Number(product.revenueGenerated || 0).toLocaleString()}</span>
                                                        <span className="text-[10px] text-gray-400">({product.conversionRate || 0}%)</span>
                                                    </div>
                                                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${product.conversionRate || 0}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100"
                                                            disabled={deletingId === product.id}>
                                                            {deletingId === product.id
                                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                                : <MoreHorizontal className="h-4 w-4 text-gray-400" />}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl border-gray-200 bg-white shadow-lg p-1.5 w-48">
                                                        <DropdownMenuItem
                                                            className="gap-2 text-xs font-medium py-2.5 rounded-lg cursor-pointer"
                                                            onClick={() => openEditModal(product)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 text-violet-500" /> Edit Product
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="gap-2 text-xs font-medium py-2.5 rounded-lg cursor-pointer"
                                                            onClick={() => navigate('/dashboard/analytics')}
                                                        >
                                                            <BarChart2 className="h-3.5 w-3.5 text-purple-500" /> View Analytics
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-1 bg-gray-100" />
                                                        <DropdownMenuItem
                                                            className="gap-2 text-xs font-medium py-2.5 rounded-lg cursor-pointer text-red-500 focus:text-red-500"
                                                            onClick={() => handleDelete(product)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-xs font-medium text-gray-400">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-white"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {pageWindow.map(page => (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? 'default' : 'ghost'}
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 rounded-lg text-xs font-semibold",
                                            page === currentPage
                                                ? "bg-violet-500 text-white shadow-md shadow-violet-500/20"
                                                : "hover:bg-white text-gray-500"
                                        )}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-white"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setEditingProduct(null) }}>
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-lg space-y-6 shadow-glass-xl">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                            <p className="text-xs font-medium text-gray-400 mt-1 font-mono">ID: {editingProduct.id}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Product Name</label>
                                <Input
                                    value={editForm.name}
                                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                    className="rounded-xl h-11 bg-gray-50 border-gray-200 focus-visible:ring-violet-200 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Category</label>
                                    <Input
                                        value={editForm.category}
                                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                        className="rounded-xl h-11 bg-gray-50 border-gray-200 focus-visible:ring-violet-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Price (₹)</label>
                                    <Input
                                        type="number"
                                        value={editForm.price}
                                        onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                                        className="rounded-xl h-11 bg-gray-50 border-gray-200 focus-visible:ring-violet-200 text-sm font-bold text-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-500/20"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setEditingProduct(null)}
                                disabled={saving}
                                className="flex-1 h-11 rounded-xl border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
