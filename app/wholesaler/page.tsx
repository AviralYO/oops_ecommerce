"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import WholesalerLayout from "@/components/wholesaler/wholesaler-layout"
import WholesaleMetrics from "@/components/wholesaler/wholesale-metrics"
import OrderManagement from "@/components/wholesaler/order-management"
import StockManagement from "@/components/wholesaler/stock-management"
import RetailerConnections from "@/components/wholesaler/retailer-connections"
import WholesalerProductForm from "@/components/wholesaler/product-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WholesalerDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [retailers, setRetailers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user && user.role === "wholesaler") {
      fetchRetailers()
      fetchProducts()
    }
  }, [user])

  const fetchRetailers = async () => {
    try {
      const response = await fetch("/api/profiles?role=retailer")
      if (response.ok) {
        const data = await response.json()
        setRetailers(data.profiles || [])
      }
    } catch (error) {
      console.error("Error fetching retailers:", error)
    }
  }

  const fetchProducts = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/products?retailer_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleAddProduct = async (product: any) => {
    await fetchProducts()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "wholesaler") {
    return null
  }

  return (
    <WholesalerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Wholesaler Dashboard</h1>
          <p className="text-muted-foreground">Manage orders, inventory, and retailer relationships</p>
        </div>

        <WholesaleMetrics />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="retailers">Retailers</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Orders</h2>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <OrderManagement searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="stock" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Stock</h2>
              <input
                type="text"
                placeholder="Search stock..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <StockManagement searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Products</h2>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {products.length} products in inventory
            </div>
          </TabsContent>

          <TabsContent value="retailers" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Retailers</h2>
              <input
                type="text"
                placeholder="Search retailers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <RetailerConnections retailers={retailers} searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="add-product">
            <WholesalerProductForm onSubmit={handleAddProduct} />
          </TabsContent>
        </Tabs>
      </div>
    </WholesalerLayout>
  )
}
