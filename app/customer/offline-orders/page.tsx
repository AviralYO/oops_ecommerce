"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import CustomerLayout from "@/components/customer/customer-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Package, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface OfflineOrder {
  id: string
  product_id: string
  retailer_id: string
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
  retailer: {
    name: string
    pincode: string
    email: string
  }
}

export default function OfflineOrdersPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OfflineOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Form state
  const [productId, setProductId] = useState("")
  const [retailerId, setRetailerId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) {
      fetchOfflineOrders()
    }
  }, [user])

  const fetchOfflineOrders = async () => {
    setLoadingOrders(true)
    try {
      const response = await fetch("/api/offline-orders?type=customer")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch offline orders",
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!productId || !retailerId || !pickupDate || !pickupTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const pickupDatetime = new Date(`${pickupDate}T${pickupTime}:00`)
      
      const response = await fetch("/api/offline-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          retailer_id: retailerId,
          quantity,
          pickup_datetime: pickupDatetime.toISOString(),
          customer_notes: notes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Pickup scheduled successfully. You'll receive a confirmation notification.",
        })
        setShowCreateForm(false)
        // Reset form
        setProductId("")
        setRetailerId("")
        setQuantity(1)
        setPickupDate("")
        setPickupTime("")
        setNotes("")
        // Refresh orders
        fetchOfflineOrders()
      } else {
        const error = await response.json()
        toast({
          title: "Failed",
          description: error.error || "Failed to schedule pickup",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating offline order:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "customer") {
    return null
  }

  return (
    <CustomerLayout
      cartCount={0}
      onCartClick={() => {}}
      selectedCategory="all"
      onCategoryChange={() => {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Offline Pickup Orders</h1>
            <p className="text-muted-foreground">Schedule in-store pickups and avoid delivery charges</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {showCreateForm ? "Cancel" : "Schedule Pickup"}
          </Button>
        </div>

        {/* Create Order Form */}
        {showCreateForm && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold mb-4">Schedule New Pickup</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product ID *</Label>
                  <Input
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter product ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Retailer ID *</Label>
                  <Input
                    value={retailerId}
                    onChange={(e) => setRetailerId(e.target.value)}
                    placeholder="Enter retailer ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pickup Date *</Label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pickup Time *</Label>
                  <Input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Special Instructions (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or instructions for the retailer..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-600">
                  {submitting ? "Scheduling..." : "Schedule Pickup"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Info message when no pickup orders */}
        {!loadingOrders && orders.length === 0 && !showCreateForm && (
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">No Pickup Orders Yet</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  You haven't scheduled any store pickups. During checkout, select "Store Pickup" to avoid delivery charges and pick up directly from retailers.
                </p>
                <Button 
                  onClick={() => router.push("/customer")}
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  Browse Products
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Orders List */}
        {loadingOrders ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your scheduled pickups...</p>
            </div>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={order.products.image_url || "/placeholder.svg"}
                      alt={order.products.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{order.products.name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                      <p className="text-lg font-bold text-orange-600 mt-1">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(order.pickup_datetime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(order.pickup_datetime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{order.retailer.name}</span>
                  </div>
                </div>
                
                {order.customer_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {order.customer_notes}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </CustomerLayout>
  )
}
