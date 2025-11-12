"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
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
  const [products, setProducts] = useState([
    {
      id: "1",
      name: "Wireless Headphones",
      sku: "WH-001",
      quantity: 45,
      price: 6639, // ₹6,639 (converted from $79.99)
      category: "electronics",
      status: "in-stock",
    },
    {
      id: "2",
      name: "Organic Coffee Beans",
      sku: "CB-002",
      quantity: 120,
      price: 1078, // ₹1,078 (converted from $12.99)
      category: "groceries",
      status: "in-stock",
    },
    {
      id: "3",
      name: "Cotton T-Shirt",
      sku: "CT-003",
      quantity: 8,
      price: 2074, // ₹2,074 (converted from $24.99)
      category: "clothing",
      status: "low-stock",
    },
    {
      id: "4",
      name: "Smart Speaker",
      sku: "SS-004",
      quantity: 0,
      price: 8299, // ₹8,299 (converted from $99.99)
      category: "electronics",
      status: "out-of-stock",
    },
  ])
  const [showAddProduct, setShowAddProduct] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "retailer") {
    return null
  }

  const handleAddProduct = (product: any) => {
    setProducts([...products, { ...product, id: Date.now().toString() }])
    setShowAddProduct(false)
  }

  const handleUpdateProduct = (id: string, updatedProduct: any) => {
    setProducts(products.map((p) => (p.id === id ? updatedProduct : p)))
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <RetailerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Retailer Dashboard</h1>
          <p className="text-muted-foreground">Manage your inventory, track sales, and optimize your store</p>
        </div>

        <SalesMetrics products={products} />

        <InventoryAlerts />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wholesalers">Wholesalers</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <InventoryTable products={products} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="wholesalers">
            <WholesalerConnections />
          </TabsContent>

          <TabsContent value="add-product">
            <ProductForm onSubmit={handleAddProduct} />
          </TabsContent>
        </Tabs>
      </div>
    </RetailerLayout>
  )
}
