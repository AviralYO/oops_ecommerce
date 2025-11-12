"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TrackingStep {
  step: number
  title: string
  description: string
  completed: boolean
  timestamp?: string
}

interface OrderTrackingData {
  orderNumber: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  estimatedDelivery: string
  currentLocation: string
  steps: TrackingStep[]
  carrier?: string
}

interface OrderTrackingProps {
  onTrack?: (orderNumber: string) => void
}

export default function OrderTracking({ onTrack }: OrderTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderTrackingData | null>(null)

  const mockOrdersDatabase: Record<string, OrderTrackingData> = {
    "ORD-2024-001": {
      orderNumber: "ORD-2024-001",
      status: "shipped",
      estimatedDelivery: "2024-11-08",
      currentLocation: "Distribution Center - City",
      carrier: "FastShip Express",
      steps: [
        {
          step: 1,
          title: "Order Placed",
          description: "Your order has been confirmed",
          completed: true,
          timestamp: "2024-11-05",
        },
        {
          step: 2,
          title: "Processing",
          description: "Order is being prepared for shipment",
          completed: true,
          timestamp: "2024-11-06",
        },
        { step: 3, title: "Shipped", description: "Package is on its way", completed: true, timestamp: "2024-11-06" },
        { step: 4, title: "Out for Delivery", description: "Package will be delivered today", completed: false },
        { step: 5, title: "Delivered", description: "Package has been delivered", completed: false },
      ],
    },
    "ORD-2024-002": {
      orderNumber: "ORD-2024-002",
      status: "delivered",
      estimatedDelivery: "2024-11-06",
      currentLocation: "Delivered to recipient",
      carrier: "FastShip Express",
      steps: [
        {
          step: 1,
          title: "Order Placed",
          description: "Your order has been confirmed",
          completed: true,
          timestamp: "2024-11-03",
        },
        {
          step: 2,
          title: "Processing",
          description: "Order is being prepared for shipment",
          completed: true,
          timestamp: "2024-11-04",
        },
        { step: 3, title: "Shipped", description: "Package is on its way", completed: true, timestamp: "2024-11-04" },
        {
          step: 4,
          title: "Out for Delivery",
          description: "Package was out for delivery",
          completed: true,
          timestamp: "2024-11-05",
        },
        {
          step: 5,
          title: "Delivered",
          description: "Package has been delivered",
          completed: true,
          timestamp: "2024-11-06",
        },
      ],
    },
    "ORD-2024-003": {
      orderNumber: "ORD-2024-003",
      status: "processing",
      estimatedDelivery: "2024-11-10",
      currentLocation: "Warehouse - Fulfillment Center",
      carrier: "PrimePack Logistics",
      steps: [
        {
          step: 1,
          title: "Order Placed",
          description: "Your order has been confirmed",
          completed: true,
          timestamp: "2024-11-05",
        },
        { step: 2, title: "Processing", description: "Order is being prepared for shipment", completed: true },
        { step: 3, title: "Shipped", description: "Package is on its way", completed: false },
        { step: 4, title: "Out for Delivery", description: "Package will be delivered soon", completed: false },
        { step: 5, title: "Delivered", description: "Package has been delivered", completed: false },
      ],
    },
  }

  const handleTrack = () => {
    const order = mockOrdersDatabase[trackingNumber.toUpperCase()]
    if (order) {
      setSelectedOrder(order)
      onTrack?.(trackingNumber)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-bold mb-4">Track Your Order</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter tracking number (e.g., ORD-2024-001)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleTrack()}
            className="bg-input border-border"
          />
          <Button
            onClick={handleTrack}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
          >
            Track
          </Button>
        </div>
      </Card>

      {selectedOrder && (
        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-xl font-bold">{selectedOrder.orderNumber}</p>
              </div>
              <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status.toUpperCase()}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Carrier</p>
                <p className="font-semibold">{selectedOrder.carrier}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Location</p>
                <p className="font-semibold">{selectedOrder.currentLocation}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Delivery</p>
                <p className="font-semibold">{selectedOrder.estimatedDelivery}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="space-y-4">
              {selectedOrder.steps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                        step.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      {step.completed ? "✓" : step.step}
                    </div>
                    {index < selectedOrder.steps.length - 1 && (
                      <div className={`w-0.5 h-12 my-1 ${step.completed ? "bg-green-500" : "bg-border"}`}></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`font-semibold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.timestamp && <p className="text-xs text-muted-foreground mt-1">{step.timestamp}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
