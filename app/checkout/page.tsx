"use client"

import { useState } from "react"
import CheckoutForm from "@/components/payment/checkout-form"

export default function CheckoutPage() {
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  const handlePaymentSubmit = (paymentData: any) => {
    const newOrderNumber = `ORD-${Date.now()}`
    setOrderNumber(newOrderNumber)
    setPaymentSuccess(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
            <span className="text-xl font-bold">LiveMART</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {paymentSuccess ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">Your order has been placed successfully.</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 mb-6 text-left">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                <p className="font-semibold">November 10, 2024</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You will receive an email confirmation shortly. Track your order using the order number above.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold">
                Track Order
              </button>
              <button className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-accent">
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Checkout</h1>
              <p className="text-muted-foreground">Complete your purchase securely</p>
            </div>
            <CheckoutForm onSubmit={handlePaymentSubmit} />
          </div>
        )}
      </main>
    </div>
  )
}
