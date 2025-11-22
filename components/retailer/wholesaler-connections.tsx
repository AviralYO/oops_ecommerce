"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WholesalerConnectionsProps {
  wholesalers?: any[]
}

export default function WholesalerConnections({ wholesalers }: WholesalerConnectionsProps) {
  const [displayWholesalers, setDisplayWholesalers] = useState(wholesalers || [])
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
  }, [])

  useEffect(() => {
    setDisplayWholesalers(wholesalers || [])
  }, [wholesalers])

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/wholesaler-connections?type=retailer")
      if (response.ok) {
        const data = await response.json()
        const connected = new Set(
          data.connections
            .filter((c: any) => c.status === "accepted")
            .map((c: any) => c.wholesaler_id)
        )
        setConnectedIds(connected)
      } else {
        // Table might not exist yet, just continue without connections
        console.log("Connections table not yet set up")
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    }
  }

  const handleConnect = async (wholesalerId: string) => {
    // Check if already connected
    if (connectedIds.has(wholesalerId)) {
      alert("You are already connected to this wholesaler!")
      return
    }

    setLoading(wholesalerId)
    try {
      const response = await fetch("/api/wholesaler-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wholesaler_id: wholesalerId }),
      })

      if (response.ok) {
        // Refetch connections to get the updated list
        await fetchConnections()
        alert("Connected to wholesaler successfully!")
      } else {
        const data = await response.json()
        const errorMsg = data.error || data.message || "Failed to connect"
        
        // Check for duplicate key error
        if (errorMsg.includes("duplicate") || errorMsg.includes("unique constraint") || errorMsg.includes("Already connected")) {
          // Refetch to sync state
          await fetchConnections()
          alert("You are already connected to this wholesaler!")
        } else {
          alert(`Error: ${errorMsg}`)
        }
      }
    } catch (error) {
      console.error("Error connecting:", error)
      alert("Failed to connect to wholesaler")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-bold mb-4">Available Wholesalers</h3>
      {displayWholesalers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No wholesalers available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayWholesalers.map((wholesaler) => {
            const isConnected = connectedIds.has(wholesaler.id)
            const isLoading = loading === wholesaler.id

            return (
              <div key={wholesaler.id} className="p-4 rounded-lg bg-accent/30 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{wholesaler.name || wholesaler.email}</p>
                    <p className="text-sm text-muted-foreground">{wholesaler.email}</p>
                  </div>
                  {isConnected && (
                    <span className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded">Connected</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Wholesaler
                </p>
                <Button
                  size="sm"
                  onClick={() => handleConnect(wholesaler.id)}
                  disabled={isConnected || isLoading}
                  className="w-full bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white disabled:opacity-50"
                >
                  {isLoading ? "Connecting..." : isConnected ? "Connected" : "Connect"}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
