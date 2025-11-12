"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  orderNumber: string
  wholesaler: string
  quantity: number
  total: number
  status: "pending" | "completed" | "shipped"
  date: string
}

interface OrdersPanelProps {
  orders?: Order[]
}

export default function OrdersPanel({ orders }: OrdersPanelProps) {
  const defaultOrders: Order[] = [
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      wholesaler: "Global Supplies Co",
      quantity: 50,
      total: 2500,
      status: "pending",
      date: "2024-11-05",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      wholesaler: "Prime Distribution",
      quantity: 100,
      total: 4500,
      status: "completed",
      date: "2024-11-03",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      wholesaler: "EcoTrade Ltd",
      quantity: 75,
      total: 3200,
      status: "shipped",
      date: "2024-11-01",
    },
  ]

  const displayOrders = orders || defaultOrders

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
      <div className="space-y-4">
        {displayOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border"
          >
            <div className="flex-1">
              <p className="font-semibold">{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">{order.wholesaler}</p>
              <p className="text-sm text-muted-foreground">
                {order.quantity} units • ${order.total.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">{order.date}</span>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
