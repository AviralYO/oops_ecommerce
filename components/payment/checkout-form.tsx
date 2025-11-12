"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, convertUSDtoINR } from "@/lib/currency"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CheckoutFormProps {
  cartItems?: CartItem[]
  onSubmit?: (paymentData: any) => void
}

export default function CheckoutForm({ cartItems, onSubmit }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)

  const defaultCartItems: CartItem[] = [
    { id: "1", name: "Wireless Headphones", price: convertUSDtoINR(79.99), quantity: 1 },
    { id: "2", name: "Organic Coffee Beans", price: convertUSDtoINR(12.99), quantity: 2 },
  ]

  const items = cartItems || defaultCartItems
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.18 // 18% GST in India
  const shipping = subtotal > 500 ? 0 : 50 // Free shipping above ₹500
  const total = subtotal + tax + shipping

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      onSubmit?.({
        ...formData,
        paymentMethod,
        amount: total,
        timestamp: new Date().toISOString(),
      })
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold mb-4">Billing Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Full Address</label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <Input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className="bg-input border-border"
                  required
                />
              </div>
            </div>
          </form>
        </Card>

        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold mb-4">Payment Method</h3>
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="font-medium">Credit / Debit Card</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50">
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="font-medium">Digital Wallet</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-accent/50">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="font-medium">Bank Transfer</span>
            </label>
          </div>

          {paymentMethod === "card" && (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                <Input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <Input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="4532 1234 5678 9010"
                  className="bg-input border-border"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <Input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="bg-input border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <Input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    className="bg-input border-border"
                    required
                  />
                </div>
              </div>
            </form>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold h-12"
          >
            {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
          </Button>
        </Card>
      </div>

      {/* Order Summary */}
      <div>
        <Card className="bg-card border-border p-6 sticky top-24">
          <h3 className="text-lg font-bold mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4 pb-4 border-b border-border">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                {shipping === 0 ? "FREE" : formatCurrency(shipping)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold">{formatCurrency(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
