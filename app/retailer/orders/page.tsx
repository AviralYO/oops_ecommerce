"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import RetailerLayout from "@/components/retailer/retailer-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react"

interface OrderItem {
  id: string
  quantity: number
  price_at_purchase: number
  products: {
    id: string
    name: string
    image_url: string
  }
}

interface Order {
  id: string
  order_number: string
  customer_id: string
  total_amount: number
  gst_amount: number
  shipping_amount: number
  status: string
  shipping_address: string
  created_at: string
  updated_at: string
  profiles: {
    name: string
    email: string
  }
  order_items: OrderItem[]
}

export default function RetailerOrders() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  const fetchOrders = async () => {
    try {
      setFetchLoading(true)
      console.log("Fetching retailer orders...")
      const response = await fetch("/api/retailer/orders")
      console.log("Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Orders data:", data)
        console.log("Number of orders:", data.orders?.length)
        setOrders(data.orders || [])
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        setOrders([])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
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
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.profiles.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  if (fetchLoading) {
    return (
      <RetailerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </RetailerLayout>
    )
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
              {filterOrders().length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders found</p>
                </Card>
              ) : (
                filterOrders().map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getStatusColor={getStatusColor}
                    onStatusUpdate={fetchOrders}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {filterOrders("pending").length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending orders</p>
                </Card>
              ) : (
                filterOrders("pending").map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getStatusColor={getStatusColor}
                    onStatusUpdate={fetchOrders}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {filterOrders("confirmed").length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No confirmed orders</p>
                </Card>
              ) : (
                filterOrders("confirmed").map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getStatusColor={getStatusColor}
                    onStatusUpdate={fetchOrders}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="shipped" className="space-y-4">
              {filterOrders("shipped").length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shipped orders</p>
                </Card>
              ) : (
                filterOrders("shipped").map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getStatusColor={getStatusColor}
                    onStatusUpdate={fetchOrders}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="delivered" className="space-y-4">
              {filterOrders("delivered").length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No delivered orders</p>
                </Card>
              ) : (
                filterOrders("delivered").map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getStatusColor={getStatusColor}
                    onStatusUpdate={fetchOrders}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </RetailerLayout>
  )
}

function OrderCard({ 
  order, 
  getStatusColor,
  onStatusUpdate 
}: { 
  order: Order
  getStatusColor: (status: string) => string
  onStatusUpdate: () => void
}) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState(order.status)
  const [comment, setComment] = useState("")
  const [updating, setUpdating] = useState(false)

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) {
      toast({
        title: "No Change",
        description: "Please select a different status",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)

    try {
      const response = await fetch("/api/retailer/orders/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          status: newStatus,
          comment: comment || `Status updated to ${newStatus}`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Order status updated successfully",
        })
        setIsDialogOpen(false)
        setComment("")
        onStatusUpdate()
      } else {
        throw new Error(data.error || "Failed to update status")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0)
  
  try {
    const shippingAddress = JSON.parse(order.shipping_address)
    var addressText = `${shippingAddress.name}, ${shippingAddress.address}`
  } catch {
    var addressText = order.shipping_address
  }

  return (
    <Card className="p-6 bg-muted/50 border-border">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-xl">{order.order_number}</h3>
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Customer:</strong> {order.profiles.name}</p>
              <p><strong>Email:</strong> {order.profiles.email}</p>
              <p><strong>Items:</strong> {totalItems} product(s)</p>
              <p><strong>Address:</strong> {addressText}</p>
              <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="text-right space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Amount</div>
              <div className="text-3xl font-bold text-orange-500">
                ₹{order.total_amount.toFixed(2)}
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Order Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Order Number</Label>
                    <p className="text-sm font-mono text-muted-foreground">{order.order_number}</p>
                  </div>
                  <div>
                    <Label>Current Status</Label>
                    <p className="text-sm">
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="status">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment (Optional)</Label>
                    <Textarea
                      id="comment"
                      placeholder="Add a note about this status update..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleUpdateStatus} 
                    disabled={updating || newStatus === order.status}
                    className="w-full"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-3">Order Items:</p>
          <div className="grid gap-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm bg-background p-3 rounded-md">
                {item.products.image_url && (
                  <img 
                    src={item.products.image_url} 
                    alt={item.products.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.products.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity} × ₹{item.price_at_purchase}</p>
                </div>
                <p className="font-semibold">₹{(item.quantity * item.price_at_purchase).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
