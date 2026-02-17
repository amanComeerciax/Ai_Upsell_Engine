import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { Package, Search, Filter, ArrowUpRight, TrendingUp, AlertCircle, MoreHorizontal, Loader2, RefreshCcw } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Product } from '@/types/dashboard'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { useMerchant } from '@/contexts/MerchantContext'

export default function InventoryPage() {
    const { syncProducts } = useMerchant()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
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
                lowStockItems: "0", // Could be calculated if stock field existed
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
                alert(`Shopify Sync Complete! Synced ${result.count} products.`);
            }
        } catch (error: any) {
            console.error("Sync failed:", error);
            alert(`Sync failed: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Global Inventory</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage products and monitor their individual upsell performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        variant="outline"
                        className="border-blue-500/20 bg-blue-500/[0.02] text-blue-500 hover:bg-blue-500/10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                    >
                        {syncing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-2" />}
                        Sync from Shopify
                    </Button>
                    <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold uppercase tracking-widest text-[10px] px-6">
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Stats Overview ... unchanged ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-blue-500" },
                    { label: "Upsell Performance", value: stats.upsellPerformance, icon: TrendingUp, color: "text-emerald-500" },
                    { label: "Low Stock Items", value: stats.lowStockItems, icon: AlertCircle, color: "text-amber-500" },
                    { label: "Total Revenue", value: stats.totalRevenue, icon: ArrowUpRight, color: "text-purple-500" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-foreground/[0.04] bg-foreground/[0.01]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-xl bg-foreground/[0.03] flex items-center justify-center">
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{stat.label}</p>
                                    <p className="text-2xl font-black mt-1">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Bar */}
            <Card className="border-foreground/[0.04] bg-foreground/[0.01]">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by SKU, name or category..."
                            className="bg-foreground/[0.02] border-foreground/[0.04] pl-10 rounded-xl h-11 focus-visible:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-foreground/[0.08] rounded-xl h-11 px-4 text-sm font-bold">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card className="border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Inventory...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-foreground/[0.02]">
                            <TableRow className="border-foreground/[0.04] hover:bg-transparent uppercase">
                                <TableHead className="text-[10px] font-black tracking-widest py-4">Product</TableHead>
                                <TableHead className="text-[10px] font-black tracking-widest">Category</TableHead>
                                <TableHead className="text-[10px] font-black tracking-widest text-right">Price</TableHead>
                                <TableHead className="text-[10px] font-black tracking-widest text-right">Upsells</TableHead>
                                <TableHead className="text-[10px] font-black tracking-widest text-right">Conv. Rate</TableHead>
                                <TableHead className="text-[10px] font-black tracking-widest text-right">Revenue</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} className="border-foreground/[0.04] hover:bg-foreground/[0.01] transition-colors group">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-foreground/[0.06] flex-shrink-0">
                                                {product.imageURL ? (
                                                    <img src={product.imageURL} alt={product.name} className="h-full w-full object-contain p-1" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-foreground/[0.02]">
                                                        <Package className="h-4 w-4 text-foreground/20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground group-hover:text-blue-500 transition-colors uppercase text-[12px]">{product.name}</p>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-50">SHP_{product.shopifyId || product.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-md bg-foreground/[0.03] text-[9px] font-black uppercase tracking-widest border border-foreground/[0.04]">
                                            {product.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-black text-sm">₹{Number(product.price).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-black text-blue-500">{product.timesRecommended || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-12 h-1.5 bg-foreground/[0.05] rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${product.conversionRate || 0}%` }} />
                                            </div>
                                            <span className="font-bold text-[10px]">{product.conversionRate || 0}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-black text-sm text-foreground">₹{Number(product.revenueGenerated || 0).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/[0.05]">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    )
}
