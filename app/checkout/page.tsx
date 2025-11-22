"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { DummyPaymentModal } from "@/components/payment/dummy-payment-modal"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  products: {
    name: string
    price: number
    image_url: string
  }
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()
      if (data.cartItems) {
        setCartItems(data.cartItems)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.products.price * item.quantity,
      0
    )
  }

  const calculateGST = () => {
    return calculateSubtotal() * 0.18
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST()
  }



  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
      toast({
        title: "Error",
        description: "Please fill all shipping details",
        variant: "destructive",
      })
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    // Open payment modal
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setLoading(true)

    try {
      // Place order with payment details
      const orderResponse = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_amount: calculateTotal(),
          gst_amount: calculateGST(),
          shipping_address: JSON.stringify(shippingInfo),
          payment_details: JSON.stringify(paymentDetails),
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.products.price,
          })),
        }),
      })

      const orderData = await orderResponse.json()

      if (orderResponse.ok) {
        toast({
          title: "Success!",
          description: "Payment successful. Order placed!",
        })
        router.push(`/customer/orders`)
      } else {
        throw new Error(orderData.error || "Failed to place order")
      }
    } catch (error: any) {
      console.error("Order error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowPaymentModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={() => router.push("/customer")}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={shippingInfo.name}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, address: e.target.value })
                      }
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Processing..." : `Pay ₹${calculateTotal().toFixed(2)}`}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.products.name} x {item.quantity}
                        </span>
                        <span>₹{(item.products.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{calculateGST().toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Secure Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>✓ Powered by Razorpay</p>
                    <p>✓ 100% Secure Payment</p>
                    <p>✓ Multiple payment options</p>
                    <p>✓ Encrypted transactions</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <DummyPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={calculateTotal()}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
