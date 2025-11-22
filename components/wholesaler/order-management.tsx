"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface WholesaleOrder {
  id: string
  orderNumber: string
  retailer: string
  quantity: number
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered"
  date: string
  items: number
}

interface OrderManagementProps {
  orders?: WholesaleOrder[]
  onStatusUpdate?: (id: string, status: string) => void
  searchTerm?: string
}

export default function OrderManagement({ orders, onStatusUpdate, searchTerm = "" }: OrderManagementProps) {
  const [localOrders, setLocalOrders] = useState<WholesaleOrder[]>(orders || [])

  const handleStatusUpdate = (id: string, newStatus: string) => {
    const updated = localOrders.map((order) => (order.id === id ? { ...order, status: newStatus as any } : order))
    setLocalOrders(updated)
    onStatusUpdate?.(id, newStatus)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextStatus = (current: string) => {
    const statusFlow: Record<string, string> = {
      pending: "confirmed",
      confirmed: "shipped",
      shipped: "delivered",
      delivered: "delivered",
    }
    return statusFlow[current] || current
  }
  
  const filteredOrders = localOrders.filter((order) => {
    const matchesSearch = searchTerm === "" || 
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.retailer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold">Order Management</h3>
        <p className="text-sm text-muted-foreground">Track and manage all wholesale orders</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Order ID</th>
              <th className="text-left px-6 py-3 font-semibold">Retailer</th>
              <th className="text-left px-6 py-3 font-semibold">Quantity</th>
              <th className="text-left px-6 py-3 font-semibold">Items</th>
              <th className="text-left px-6 py-3 font-semibold">Total</th>
              <th className="text-left px-6 py-3 font-semibold">Status</th>
              <th className="text-left px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  {searchTerm ? "No orders match your search." : "No orders yet."}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4 font-semibold">{order.orderNumber}</td>
                <td className="px-6 py-4">{order.retailer}</td>
                <td className="px-6 py-4">{order.quantity} units</td>
                <td className="px-6 py-4">{order.items} items</td>
                <td className="px-6 py-4 font-semibold">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  {order.status !== "delivered" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                      onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                    >
                      {getNextStatus(order.status) === order.status ? "Complete" : "Update"}
                    </Button>
                  )}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
