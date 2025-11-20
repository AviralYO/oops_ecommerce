"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import RetailerLayout from "@/components/retailer/retailer-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: string
  image: string
}

export default function RetailerProducts() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?retailer=true")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
      }
    }

    if (user) {
      fetchProducts()
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "retailer") {
    return null
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <RetailerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
            + Add New Product
          </Button>
        </div>

        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <Input
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No products found</p>
                <p className="text-sm">Try adjusting your search or add new products</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="p-4 bg-muted/50 border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {product.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.status === "active" && (
                            <Badge className="bg-green-500 text-white">Active</Badge>
                          )}
                          {product.status === "low_stock" && (
                            <Badge className="bg-yellow-500 text-white">Low Stock</Badge>
                          )}
                          {product.status === "out_of_stock" && (
                            <Badge className="bg-red-500 text-white">Out of Stock</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="font-semibold text-lg">₹{product.price}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Stock</div>
                        <div className={`font-semibold text-lg ${
                          product.stock === 0 ? "text-red-500" :
                          product.stock < 10 ? "text-yellow-500" :
                          "text-green-500"
                        }`}>
                          {product.stock} units
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </RetailerLayout>
  )
}
