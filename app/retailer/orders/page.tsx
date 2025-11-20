"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import RetailerLayout from "@/components/retailer/retailer-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Order {
  id: number
  orderId: string
  customer: string
  items: number
  total: number
  status: string
  date: string
}

export default function RetailerOrders() {
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
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders?retailer=true")
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders([])
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "retailer") {
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
          order.customer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  return (
    <RetailerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage and track your customer orders</p>
        </div>

        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <Input
              placeholder="Search orders by ID or customer name..."
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
    </RetailerLayout>
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
            <p>Customer: {order.customer}</p>
            <p>Items: {order.items} products</p>
            <p>Date: {new Date(order.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500 mb-2">
            ₹{order.total.toLocaleString()}
          </div>
          <button className="text-sm text-primary hover:underline">
            View Details →
          </button>
        </div>
      </div>
    </Card>
  )
}
