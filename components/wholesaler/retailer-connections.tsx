"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RetailerConnectionsProps {
  retailers?: any[]
  searchTerm?: string
}

export default function RetailerConnections({ retailers, searchTerm = "" }: RetailerConnectionsProps) {
  const displayRetailers = retailers || []
  
  const filteredRetailers = displayRetailers.filter((retailer: any) => {
    const matchesSearch = searchTerm === "" || 
                         (retailer.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (retailer.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-bold mb-4">Connected Retailers</h3>
      {filteredRetailers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No retailers match your search." : "No retailers registered yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRetailers.map((retailer: any) => (
          <div key={retailer.id} className="p-4 rounded-lg bg-accent/30 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold">{retailer.name || retailer.email}</p>
                <p className="text-xs text-muted-foreground">{retailer.email}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1 mb-3">
              <p>{retailer.business_name || "Retailer"}</p>
            </div>
            <Button
              size="sm"
              className="w-full bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              View Details
            </Button>
          </div>
          ))}
        </div>
      )}
    </Card>
  )
}
