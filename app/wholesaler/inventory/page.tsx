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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<InventoryItem>>({})

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("/api/products?wholesaler=true&inventory=true")
        if (response.ok) {
          const data = await response.json()
          setInventory(data.products || [])
        } else {
          setInventory([])
        }
      } catch (error) {
        console.error("Error fetching inventory:", error)
        setInventory([])
      }
    }

    if (user) {
      fetchInventory()
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

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditValues({
      wholesalePrice: item.wholesalePrice,
      retailPrice: item.retailPrice,
      reorderLevel: item.reorderLevel
    })
  }

  const handleSaveEdit = async (itemId: number) => {
    try {
      const response = await fetch(`/api/products/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wholesale_price: editValues.wholesalePrice,
          retail_price: editValues.retailPrice
        })
      })

      if (response.ok) {
        // Refresh inventory
        const invResponse = await fetch("/api/products?wholesaler=true&inventory=true")
        if (invResponse.ok) {
          const data = await invResponse.json()
          setInventory(data.products || [])
        }
        setEditingId(null)
        setEditValues({})
      }
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleRestock = async (itemId: number, currentStock: number) => {
    const amount = prompt("Enter amount to add to stock:", "0")
    if (!amount || isNaN(Number(amount))) return

    const newStock = currentStock + Number(amount)

    try {
      const response = await fetch(`/api/products/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_quantity: newStock })
      })

      if (response.ok) {
        // Refresh inventory
        const invResponse = await fetch("/api/products?wholesaler=true&inventory=true")
        if (invResponse.ok) {
          const data = await invResponse.json()
          setInventory(data.products || [])
        }
      }
    } catch (error) {
      console.error("Error restocking:", error)
    }
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

                        {editingId === item.id ? (
                          <>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground mb-1">Wholesale ₹</div>
                              <Input
                                type="number"
                                value={editValues.wholesalePrice || ""}
                                onChange={(e) => setEditValues({...editValues, wholesalePrice: Number(e.target.value)})}
                                className="w-24 h-8"
                              />
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-muted-foreground mb-1">Retail ₹</div>
                              <Input
                                type="number"
                                value={editValues.retailPrice || ""}
                                onChange={(e) => setEditValues({...editValues, retailPrice: Number(e.target.value)})}
                                className="w-24 h-8"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => handleSaveEdit(item.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Wholesale</div>
                              <div className="font-semibold text-lg">₹{item.wholesalePrice || "N/A"}</div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Retail</div>
                              <div className="font-semibold text-lg">₹{item.retailPrice || "N/A"}</div>
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-purple-500"
                                onClick={() => handleRestock(item.id, item.stock)}
                              >
                                Restock
                              </Button>
                            </div>
                          </>
                        )}
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
