"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import CustomerLayout from "@/components/customer/customer-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react"

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  products: {
    name: string
    image_url: string
    description: string
  }
}

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  gst_amount: number
  shipping_amount: number
  created_at: string
  updated_at: string
  tracking_number?: string
  delivery_date?: string
  shipping_address: string
  order_items: OrderItem[]
}

export default function OrderDetailsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [statusHistory, setStatusHistory] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user && params.id) {
      fetchOrderDetails()
      fetchStatusHistory()
    }
  }, [user, params.id])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setLoadingOrder(false)
    }
  }

  const fetchStatusHistory = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}/status-history`)
      if (response.ok) {
        const data = await response.json()
        setStatusHistory(data.history || [])
      }
    } catch (error) {
      console.error("Failed to fetch status history:", error)
    }
  }

  if (loading || loadingOrder) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "customer" || !order) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getStatusSteps = () => {
    const steps = [
      { name: "Order Placed", status: "pending" },
      { name: "Confirmed", status: "confirmed" },
      { name: "Shipped", status: "shipped" },
      { name: "Delivered", status: "delivered" },
    ]

    const currentIndex = steps.findIndex(s => s.status === order.status.toLowerCase())
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
    }))
  }

  return (
    <CustomerLayout
      cartCount={0}
      onCartClick={() => router.push("/customer")}
      selectedCategory="all"
      onCategoryChange={() => {}}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.push("/customer/orders")}>
              ← Back to Orders
            </Button>
            <h1 className="text-3xl font-bold mt-2">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.order_number}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-white text-lg px-4 py-2`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        {/* Order Tracking Timeline */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-semibold mb-6">Order Tracking</h2>
          <div className="flex items-center justify-between relative">
            {getStatusSteps().map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step.completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.completed ? "✓" : index + 1}
                </div>
                <p className="text-sm mt-2 text-center">{step.name}</p>
              </div>
            ))}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 -z-0" />
          </div>

          {order.tracking_number && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-semibold text-lg">{order.tracking_number}</p>
            </div>
          )}

          {order.delivery_date && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-semibold text-lg">
                {new Date(order.delivery_date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </Card>

        {/* Detailed Status History Timeline */}
        {statusHistory.length > 0 && (
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-semibold mb-6">Status History</h2>
            <div className="relative">
              <div className="space-y-6">
                {statusHistory.map((history: any, index: number) => {
                  const getStatusIcon = (status: string) => {
                    switch (status.toLowerCase()) {
                      case "pending":
                        return <Clock className="h-5 w-5" />
                      case "confirmed":
                        return <Package className="h-5 w-5" />
                      case "shipped":
                        return <Truck className="h-5 w-5" />
                      case "delivered":
                        return <CheckCircle className="h-5 w-5" />
                      case "cancelled":
                        return <XCircle className="h-5 w-5" />
                      default:
                        return <Clock className="h-5 w-5" />
                    }
                  }

                  const getHistoryStatusColor = (status: string) => {
                    switch (status.toLowerCase()) {
                      case "pending":
                        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      case "confirmed":
                        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      case "shipped":
                        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                      case "delivered":
                        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      case "cancelled":
                        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      default:
                        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }
                  }

                  return (
                    <div key={history.id} className="relative pl-8">
                      {index !== statusHistory.length - 1 && (
                        <div className="absolute left-2.5 top-8 h-full w-0.5 bg-border" />
                      )}
                      <div className={`absolute left-0 top-1 p-1 rounded-full ${
                        index === 0 ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {getStatusIcon(history.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getHistoryStatusColor(history.status)} variant="outline">
                            {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                              Current Status
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.created_at).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {history.comment && (
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {history.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id}>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    {item.products.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.products.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ₹{item.price_at_purchase.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ₹{(item.quantity * item.price_at_purchase).toLocaleString()}
                    </p>
                    {order.status.toLowerCase() === "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => router.push(`/product/${item.product_id}?review=true`)}
                      >
                        Write Review
                      </Button>
                    )}
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{order.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₹{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Delivery Address */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <p className="whitespace-pre-line">{order.shipping_address}</p>
        </Card>

        {/* Order Info */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span className="font-medium">
                {new Date(order.created_at).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">Razorpay</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => router.push("/customer")} className="flex-1">
            Continue Shopping
          </Button>
          <Button onClick={() => router.push("/customer/orders")} variant="outline" className="flex-1">
            View All Orders
          </Button>
        </div>
      </div>
    </CustomerLayout>
  )
}
