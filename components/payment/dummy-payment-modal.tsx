"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle2 } from "lucide-react"

interface DummyPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onPaymentSuccess: (paymentDetails: any) => void
}

export function DummyPaymentModal({
  isOpen,
  onClose,
  amount,
  onPaymentSuccess,
}: DummyPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Card payment state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  // UPI state
  const [upiId, setUpiId] = useState("")

  // Net Banking state
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  // Wallet state
  const [walletType, setWalletType] = useState("")
  const [walletPhone, setWalletPhone] = useState("")

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const paymentDetails = {
      method: paymentMethod,
      amount,
      timestamp: new Date().toISOString(),
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      status: "success",
      details:
        paymentMethod === "card"
          ? {
              cardNumber: cardNumber.slice(-4),
              cardName,
            }
          : paymentMethod === "upi"
          ? {
              upiId,
            }
          : paymentMethod === "netbanking"
          ? {
              bankName,
              accountNumber: accountNumber.slice(-4),
            }
          : {
              walletType,
              walletPhone: walletPhone.slice(-4),
            },
    }

    setIsSuccess(true)
    setTimeout(() => {
      onPaymentSuccess(paymentDetails)
      handleClose()
    }, 1500)
  }

  const handleClose = () => {
    setIsProcessing(false)
    setIsSuccess(false)
    setCardNumber("")
    setCardName("")
    setExpiryDate("")
    setCvv("")
    setUpiId("")
    setBankName("")
    setAccountNumber("")
    setWalletType("")
    setWalletPhone("")
    onClose()
  }

  const isFormValid = () => {
    switch (paymentMethod) {
      case "card":
        return cardNumber.length >= 16 && cardName && expiryDate && cvv.length >= 3
      case "upi":
        return upiId.includes("@")
      case "netbanking":
        return bankName && accountNumber.length >= 8
      case "wallet":
        return walletType && walletPhone.length >= 10
      default:
        return false
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">Your order has been placed successfully</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Amount to pay: <span className="font-bold text-lg">₹{amount.toFixed(2)}</span>
          </p>
        </DialogHeader>

        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="upi">
              <Smartphone className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="netbanking">
              <Building2 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Wallet className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upi" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Enter any UPI ID (e.g., user@paytm, user@gpay)
            </div>
          </TabsContent>

          <TabsContent value="netbanking" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="State Bank of India"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletType">Wallet Type</Label>
              <select
                id="walletType"
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Wallet</option>
                <option value="paytm">Paytm</option>
                <option value="phonepe">PhonePe</option>
                <option value="googlepay">Google Pay</option>
                <option value="amazonpay">Amazon Pay</option>
                <option value="mobikwik">Mobikwik</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="walletPhone">Mobile Number</Label>
              <Input
                id="walletPhone"
                placeholder="9876543210"
                value={walletPhone}
                onChange={(e) => setWalletPhone(e.target.value)}
                maxLength={10}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
            disabled={!isFormValid() || isProcessing}
          >
            {isProcessing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          🔒 This is a dummy payment gateway. Enter any details to simulate payment.
        </p>
      </DialogContent>
    </Dialog>
  )
}
