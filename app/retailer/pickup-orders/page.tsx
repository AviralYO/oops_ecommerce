"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import RetailerLayout from "@/components/retailer/retailer-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Package, User, Phone } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface OfflineOrder {
  id: string
  product_id: string
  customer_id: string
  quantity: number
  total_amount: number
  pickup_datetime: string
  status: string
  customer_notes: string
  created_at: string
  products: {
    name: string
    price: number
    image_url: string
  }
  customer: {
    name: string
    email: string
    pincode: string
  }
}

export default function RetailerOfflineOrdersPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OfflineOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user && user.role === "retailer") {
      fetchOfflineOrders()
    }
  }, [user])

  const fetchOfflineOrders = async () => {
    setLoadingOrders(true)
    try {
      const response = await fetch("/api/offline-orders?type=retailer")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pickup orders",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching offline orders:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoadingOrders(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const response = await fetch("/api/offline-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order marked as ${newStatus.replace("_", " ")}`,
        })
        fetchOfflineOrders() // Refresh list
      } else {
        const error = await response.json()
        toast({
          title: "Failed",
          description: error.error || "Failed to update order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-500", label: "Scheduled" },
      ready: { color: "bg-green-500", label: "Ready for Pickup" },
      picked_up: { color: "bg-gray-500", label: "Picked Up" },
      cancelled: { color: "bg-red-500", label: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>
  }

  const getStatusActions = (order: OfflineOrder) => {
    switch (order.status) {
      case "scheduled":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, "ready")}
              disabled={updatingStatus === order.id}
              className="bg-green-500 hover:bg-green-600"
            >
              Mark Ready
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateOrderStatus(order.id, "cancelled")}
              disabled={updatingStatus === order.id}
            >
              Cancel
            </Button>
          </div>
        )
      case "ready":
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "picked_up")}
            disabled={updatingStatus === order.id}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Mark as Picked Up
          </Button>
        )
      default:
        return null
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "retailer") {
    return null
  }

  return (
    <RetailerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pickup Orders</h1>
          <p className="text-muted-foreground">Manage customer pickup appointments</p>
        </div>

        {loadingOrders ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading pickup orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 bg-card border-border text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Pickup Orders</h3>
            <p className="text-muted-foreground">
              Customers haven't scheduled any pickups yet. They'll appear here when customers select "Store Pickup" during checkout.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={order.products.image_url || "/placeholder.svg"}
                      alt={order.products.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{order.products.name}</h3>
                          <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-lg font-bold text-orange-600 mb-3">
                        {formatCurrency(order.total_amount)}
                      </p>

                      {/* Customer Info */}
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span><strong>Customer:</strong> {order.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span><strong>Pincode:</strong> {order.customer.pincode || "N/A"}</span>
                        </div>
                      </div>

                      {/* Pickup Time */}
                      <div className="grid md:grid-cols-2 gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span><strong>Pickup Date:</strong> {new Date(order.pickup_datetime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span><strong>Pickup Time:</strong> {new Date(order.pickup_datetime).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {order.customer_notes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            <strong>Customer Notes:</strong> {order.customer_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 border-t border-border">
                  {getStatusActions(order)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RetailerLayout>
  )
}
