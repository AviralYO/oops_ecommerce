"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RetailerConnection {
  id: string
  name: string
  location: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  status: "active" | "inactive"
}

interface RetailerConnectionsProps {
  retailers?: RetailerConnection[]
}

export default function RetailerConnections({ retailers }: RetailerConnectionsProps) {
  const defaultRetailers: RetailerConnection[] = [
    {
      id: "1",
      name: "Tech Store",
      location: "Downtown",
      totalOrders: 24,
      totalSpent: 45000,
      lastOrder: "2024-11-05",
      status: "active",
    },
    {
      id: "2",
      name: "Prime Retail",
      location: "Mall District",
      totalOrders: 18,
      totalSpent: 32500,
      lastOrder: "2024-11-04",
      status: "active",
    },
    {
      id: "3",
      name: "Eco Store",
      location: "Green Plaza",
      totalOrders: 12,
      totalSpent: 18200,
      lastOrder: "2024-11-02",
      status: "active",
    },
    {
      id: "4",
      name: "City Market",
      location: "West Side",
      totalOrders: 15,
      totalSpent: 28000,
      lastOrder: "2024-10-30",
      status: "inactive",
    },
  ]

  const displayRetailers = retailers || defaultRetailers

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-bold mb-4">Connected Retailers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayRetailers.map((retailer) => (
          <div key={retailer.id} className="p-4 rounded-lg bg-accent/30 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold">{retailer.name}</p>
                <p className="text-xs text-muted-foreground">{retailer.location}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  retailer.status === "active" ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                }`}
              >
                {retailer.status}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1 mb-3">
              <p>Orders: {retailer.totalOrders}</p>
              <p>Total Spent: ${retailer.totalSpent.toFixed(2)}</p>
              <p>Last Order: {retailer.lastOrder}</p>
            </div>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
