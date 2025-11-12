"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import WholesalerLayout from "@/components/wholesaler/wholesaler-layout"
import WholesaleMetrics from "@/components/wholesaler/wholesale-metrics"
import OrderManagement from "@/components/wholesaler/order-management"
import StockManagement from "@/components/wholesaler/stock-management"
import RetailerConnections from "@/components/wholesaler/retailer-connections"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WholesalerDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

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
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="retailers">Retailers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="stock" className="space-y-6">
            <StockManagement />
          </TabsContent>

          <TabsContent value="retailers" className="space-y-6">
            <RetailerConnections />
          </TabsContent>
        </Tabs>
      </div>
    </WholesalerLayout>
  )
}
