"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import RetailerLayout from "@/components/retailer/retailer-layout"
import InventoryTable from "@/components/retailer/inventory-table"
import SalesMetrics from "@/components/retailer/sales-metrics"
import ProductForm from "@/components/retailer/product-form"
import OrdersPanel from "@/components/retailer/orders-panel"
import WholesalerConnections from "@/components/retailer/wholesaler-connections"
import InventoryAlerts from "@/components/retailer/inventory-alerts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RetailerDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [wholesalers, setWholesalers] = useState<any[]>([])

  // Fetch products from database
  const fetchProducts = async () => {
    if (!user) return
    
    setLoadingProducts(true)
    try {
      const response = await fetch(`/api/products?retailer_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Fetch wholesalers from database
  const fetchWholesalers = async () => {
    try {
      const response = await fetch("/api/profiles?role=wholesaler")
      if (response.ok) {
        const data = await response.json()
        setWholesalers(data.profiles || [])
      }
    } catch (error) {
      console.error("Error fetching wholesalers:", error)
    }
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user && user.role === "retailer") {
      fetchProducts()
      fetchWholesalers()
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "retailer") {
    return null
  }

  const handleAddProduct = async (product: any) => {
    await fetchProducts() // Refresh product list
  }

  const handleUpdateProduct = async (id: string, updates: Partial<any>) => {
    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        await fetchProducts() // Refresh product list
      } else {
        const { error } = await response.json()
        alert(`Error updating product: ${error}`)
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchProducts() // Refresh product list
      } else {
        const { error } = await response.json()
        alert(`Error deleting product: ${error}`)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    }
  }

  return (
    <RetailerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Retailer Dashboard</h1>
          <p className="text-muted-foreground">Manage your inventory, track sales, and optimize your store</p>
        </div>

        <SalesMetrics products={products} />

        <InventoryAlerts products={products} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wholesalers">Wholesalers</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Inventory</h2>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <InventoryTable products={products} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} searchTerm={searchTerm} />
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="wholesalers">
            <WholesalerConnections wholesalers={wholesalers} />
          </TabsContent>

          <TabsContent value="add-product">
            <ProductForm onSubmit={handleAddProduct} />
          </TabsContent>
        </Tabs>
      </div>
    </RetailerLayout>
  )
}
