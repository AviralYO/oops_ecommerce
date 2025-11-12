"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Wholesaler {
  id: string
  name: string
  rating: number
  productsAvailable: number
  minOrder: number
  connected: boolean
}

interface WholesalerConnectionsProps {
  wholesalers?: Wholesaler[]
}

export default function WholesalerConnections({ wholesalers }: WholesalerConnectionsProps) {
  const defaultWholesalers: Wholesaler[] = [
    {
      id: "1",
      name: "Global Supplies Co",
      rating: 4.8,
      productsAvailable: 245,
      minOrder: 500,
      connected: true,
    },
    {
      id: "2",
      name: "Prime Distribution",
      rating: 4.5,
      productsAvailable: 189,
      minOrder: 1000,
      connected: true,
    },
    {
      id: "3",
      name: "EcoTrade Ltd",
      rating: 4.3,
      productsAvailable: 156,
      minOrder: 750,
      connected: false,
    },
    {
      id: "4",
      name: "Rapid Traders",
      rating: 4.6,
      productsAvailable: 312,
      minOrder: 600,
      connected: false,
    },
  ]

  const displayWholesalers = wholesalers || defaultWholesalers

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-bold mb-4">Available Wholesalers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayWholesalers.map((wholesaler) => (
          <div key={wholesaler.id} className="p-4 rounded-lg bg-accent/30 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold">{wholesaler.name}</p>
                <p className="text-sm text-muted-foreground">Rating: {wholesaler.rating}⭐</p>
              </div>
              {wholesaler.connected && (
                <span className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded">Connected</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {wholesaler.productsAvailable} products • Min order: ${wholesaler.minOrder}
            </p>
            <Button
              size="sm"
              className={
                wholesaler.connected
                  ? "w-full bg-gray-600 hover:bg-gray-700 text-white"
                  : "w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              }
            >
              {wholesaler.connected ? "Manage" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
