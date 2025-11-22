"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import RetailerLayout from "@/components/retailer/retailer-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"

interface Wholesaler {
  id: string
  email: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
  image?: string
  retailer_id: string
}

interface CartItem {
  product: Product
  quantity: number
  wholesaler: Wholesaler
}

export default function WholesaleOrders() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("browse")
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [selectedWholesaler, setSelectedWholesaler] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user?.role === "retailer") {
      fetchConnectedWholesalers()
      fetchOrders()
    }
  }, [user])

  const fetchConnectedWholesalers = async () => {
    try {
      const response = await fetch("/api/wholesaler-connections?type=retailer")
      if (response.ok) {
        const data = await response.json()
        const connected = data.connections
          .filter((c: any) => c.status === "accepted")
          .map((c: any) => c.wholesaler)
        setWholesalers(connected)
      }
    } catch (error) {
      console.error("Error fetching wholesalers:", error)
    }
  }

  const fetchWholesalerProducts = async (wholesalerId: string) => {
    setLoadingProducts(true)
    try {
      const response = await fetch(`/api/products?retailer_id=${wholesalerId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/wholesale-orders?type=retailer")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const handleWholesalerSelect = (wholesalerId: string) => {
    setSelectedWholesaler(wholesalerId)
    fetchWholesalerProducts(wholesalerId)
  }

  const addToCart = (product: Product) => {
    const wholesaler = wholesalers.find(w => w.id === selectedWholesaler)
    if (!wholesaler) return

    const existingItem = cart.find(item => item.product.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1, wholesaler }])
    }
    toast.success("Added to cart")
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    setPlacingOrder(true)
    try {
      // Group cart items by wholesaler
      const ordersByWholesaler = cart.reduce((acc, item) => {
        const wholesalerId = item.wholesaler.id
        if (!acc[wholesalerId]) {
          acc[wholesalerId] = {
            wholesaler_id: wholesalerId,
            items: []
          }
        }
        acc[wholesalerId].items.push({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_purchase: item.product.price
        })
        return acc
      }, {} as any)

      // Place orders for each wholesaler
      for (const wholesalerId in ordersByWholesaler) {
        const orderData = ordersByWholesaler[wholesalerId]
        const totalAmount = orderData.items.reduce(
          (sum: number, item: any) => sum + (item.price_at_purchase * item.quantity),
          0
        )

        const response = await fetch("/api/wholesale-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wholesaler_id: wholesalerId,
            items: orderData.items,
            total_amount: totalAmount
          })
        })

        if (!response.ok) {
          throw new Error("Failed to place order")
        }
      }

      toast.success("Orders placed successfully!")
      setCart([])
      setActiveTab("orders")
      fetchOrders()
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order")
    } finally {
      setPlacingOrder(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

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
          <h1 className="text-3xl font-bold mb-2">Wholesale Orders</h1>
          <p className="text-muted-foreground">Order products from your connected wholesalers</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse Products</TabsTrigger>
            <TabsTrigger value="cart">Cart ({cart.length})</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select Wholesaler</h2>
              {wholesalers.length === 0 ? (
                <p className="text-muted-foreground">No connected wholesalers. Connect with wholesalers first.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wholesalers.map((wholesaler) => (
                    <Card
                      key={wholesaler.id}
                      className={`p-4 cursor-pointer hover:border-primary ${
                        selectedWholesaler === wholesaler.id ? "border-primary" : ""
                      }`}
                      onClick={() => handleWholesalerSelect(wholesaler.id)}
                    >
                      <h3 className="font-semibold">{wholesaler.name}</h3>
                      <p className="text-sm text-muted-foreground">{wholesaler.email}</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {selectedWholesaler && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Available Products</h2>
                {loadingProducts ? (
                  <p>Loading products...</p>
                ) : products.length === 0 ? (
                  <p className="text-muted-foreground">No products available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="p-4">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded mb-4"
                          />
                        )}
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="secondary">{product.category}</Badge>
                          <span className="text-sm text-muted-foreground">Stock: {product.quantity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                          <Button size="sm" onClick={() => addToCart(product)}>
                            Add to Cart
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cart" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 border-b pb-4">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          From: {item.wholesaler.name}
                        </p>
                        <p className="text-sm font-medium">{formatCurrency(item.product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateQuantity(item.product.id, 0)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-xl font-bold">{formatCurrency(cartTotal)}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={placeOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order History</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {order.wholesaler?.name}
                          </p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product?.name} x {item.quantity}</span>
                            <span>{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RetailerLayout>
  )
}
