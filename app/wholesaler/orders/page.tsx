"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import WholesalerLayout from "@/components/wholesaler/wholesaler-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface Order {
  id: number
  orderId: string
  retailer: string
  items: number
  total: number
  status: string
  date: string
  deliveryDate?: string
}

export default function WholesalerOrders() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    // Fetch orders from API
    if (user) {
      // Mock data for demo
      setOrders([
        {
          id: 1,
          orderId: "WHL-2024-001",
          retailer: "Fashion Store Mumbai",
          items: 15,
          total: 45000,
          status: "pending",
          date: "2024-01-15"
        },
        {
          id: 2,
          orderId: "WHL-2024-002",
          retailer: "Footwear Hub Delhi",
          items: 8,
          total: 28000,
          status: "confirmed",
          date: "2024-01-14",
          deliveryDate: "2024-01-18"
        },
        {
          id: 3,
          orderId: "WHL-2024-003",
          retailer: "Sports World Bangalore",
          items: 25,
          total: 72000,
          status: "shipped",
          date: "2024-01-13",
          deliveryDate: "2024-01-17"
        },
        {
          id: 4,
          orderId: "WHL-2024-004",
          retailer: "Lifestyle Outlet Pune",
          items: 12,
          total: 35000,
          status: "delivered",
          date: "2024-01-12",
          deliveryDate: "2024-01-15"
        },
      ])
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "wholesaler") {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const filterOrders = (status?: string) => {
    let filtered = orders

    if (status) {
      filtered = filtered.filter((order) => order.status === status)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.retailer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  return (
    <WholesalerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wholesale Orders</h1>
          <p className="text-muted-foreground">Manage and track orders from your retail partners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
            <div className="text-3xl font-bold">{orders.length}</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-500">
              {orders.filter(o => o.status === "pending").length}
            </div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">Shipped</div>
            <div className="text-3xl font-bold text-purple-500">
              {orders.filter(o => o.status === "shipped").length}
            </div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">Revenue</div>
            <div className="text-3xl font-bold text-green-500">
              ₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
            </div>
          </Card>
        </div>

        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <Input
              placeholder="Search orders by ID or retailer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterOrders().map((order) => (
                <OrderCard key={order.id} order={order} getStatusColor={getStatusColor} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {filterOrders("pending").map((order) => (
                <OrderCard key={order.id} order={order} getStatusColor={getStatusColor} />
              ))}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {filterOrders("confirmed").map((order) => (
                <OrderCard key={order.id} order={order} getStatusColor={getStatusColor} />
              ))}
            </TabsContent>

            <TabsContent value="shipped" className="space-y-4">
              {filterOrders("shipped").map((order) => (
                <OrderCard key={order.id} order={order} getStatusColor={getStatusColor} />
              ))}
            </TabsContent>

            <TabsContent value="delivered" className="space-y-4">
              {filterOrders("delivered").map((order) => (
                <OrderCard key={order.id} order={order} getStatusColor={getStatusColor} />
              ))}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </WholesalerLayout>
  )
}

function OrderCard({ order, getStatusColor }: { order: Order; getStatusColor: (status: string) => string }) {
  return (
    <Card className="p-4 bg-muted/50 border-border">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{order.orderId}</h3>
            <Badge className={`${getStatusColor(order.status)} text-white`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{order.retailer}</p>
            <p>Items: {order.items} products</p>
            <p>Order Date: {new Date(order.date).toLocaleDateString()}</p>
            {order.deliveryDate && (
              <p>Expected Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="text-right space-y-3">
          <div className="text-2xl font-bold text-purple-500">
            ₹{order.total.toLocaleString()}
          </div>
          <div className="flex gap-2">
            {order.status === "pending" && (
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                Confirm
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                Mark Shipped
              </Button>
            )}
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
