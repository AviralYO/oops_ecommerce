"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface OrderItem {
  id: string
  quantity: number
  price_at_purchase: number
  products: {
    name: string
    image_url: string
  }
}

interface Order {
  id: string
  total_amount: number
  shipping_address: string
  status: string
  payment_status: string
  payment_id: string
  created_at: string
  order_items: OrderItem[]
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      
      if (data.orders) {
        const foundOrder = data.orders.find((o: Order) => o.id === params.id)
        if (foundOrder) {
          setOrder(foundOrder)
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Order not found</p>
            <Button onClick={() => router.push("/customer")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shippingAddress = JSON.parse(order.shipping_address)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-3xl">
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-4">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order ID: </span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Payment ID: </span>
                <span className="font-mono">{order.payment_id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Status</span>
                <Badge variant="default">{order.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="default" className="bg-green-500">
                  {order.payment_status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{shippingAddress.name}</p>
                <p className="text-muted-foreground">{shippingAddress.email}</p>
                <p className="text-muted-foreground">{shippingAddress.phone}</p>
                <p className="text-muted-foreground mt-2">{shippingAddress.address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                  {item.products.image_url && (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.products.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price_at_purchase.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => router.push("/customer")} className="flex-1">
            Continue Shopping
          </Button>
          <Button onClick={() => router.push("/customer/profile")} variant="outline" className="flex-1">
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  )
}
