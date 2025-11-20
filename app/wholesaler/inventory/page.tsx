"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import WholesalerLayout from "@/components/wholesaler/wholesaler-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface InventoryItem {
  id: number
  name: string
  category: string
  stock: number
  reorderLevel: number
  wholesalePrice: number
  retailPrice: number
  status: string
}

export default function WholesalerInventory() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    // Fetch inventory from API
    if (user) {
      // Mock data for demo
      setInventory([
        {
          id: 1,
          name: "Premium Cotton T-Shirts",
          category: "Clothing",
          stock: 500,
          reorderLevel: 100,
          wholesalePrice: 250,
          retailPrice: 499,
          status: "in_stock"
        },
        {
          id: 2,
          name: "Sports Running Shoes",
          category: "Footwear",
          stock: 85,
          reorderLevel: 100,
          wholesalePrice: 1800,
          retailPrice: 2999,
          status: "low_stock"
        },
        {
          id: 3,
          name: "Leather Laptop Bags",
          category: "Accessories",
          stock: 250,
          reorderLevel: 50,
          wholesalePrice: 900,
          retailPrice: 1499,
          status: "in_stock"
        },
        {
          id: 4,
          name: "Stainless Steel Water Bottles",
          category: "Lifestyle",
          stock: 15,
          reorderLevel: 50,
          wholesalePrice: 180,
          retailPrice: 299,
          status: "critical"
        },
      ])
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "wholesaler") {
    return null
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) return { label: "Out of Stock", color: "bg-red-500" }
    if (item.stock < item.reorderLevel / 2) return { label: "Critical", color: "bg-red-500" }
    if (item.stock < item.reorderLevel) return { label: "Low Stock", color: "bg-yellow-500" }
    return { label: "In Stock", color: "bg-green-500" }
  }

  return (
    <WholesalerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">Track and manage your wholesale inventory</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
            + Add New Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Items</div>
            <div className="text-3xl font-bold">{inventory.length}</div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">In Stock</div>
            <div className="text-3xl font-bold text-green-500">
              {inventory.filter(i => i.stock >= i.reorderLevel).length}
            </div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">Low Stock</div>
            <div className="text-3xl font-bold text-yellow-500">
              {inventory.filter(i => i.stock < i.reorderLevel && i.stock > 0).length}
            </div>
          </Card>
          <Card className="bg-card border-border p-6">
            <div className="text-sm text-muted-foreground mb-1">Out of Stock</div>
            <div className="text-3xl font-bold text-red-500">
              {inventory.filter(i => i.stock === 0).length}
            </div>
          </Card>
        </div>

        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <Input
              placeholder="Search inventory by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-4">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No items found</p>
                <p className="text-sm">Try adjusting your search or add new inventory</p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item)
                return (
                  <Card key={item.id} className="p-4 bg-muted/50 border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          {item.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge className={`${stockStatus.color} text-white`}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Stock</div>
                          <div className="font-semibold text-lg">{item.stock} units</div>
                          <div className="text-xs text-muted-foreground">Reorder: {item.reorderLevel}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Wholesale</div>
                          <div className="font-semibold text-lg">₹{item.wholesalePrice}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Retail</div>
                          <div className="font-semibold text-lg">₹{item.retailPrice}</div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-purple-500">
                            Restock
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </WholesalerLayout>
  )
}
