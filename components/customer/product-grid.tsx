"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image_url: string | null
  category: string
  status: string
  retailer_id: string
  retailer?: {
    pincode?: string
  }
}

interface ProductGridProps {
  onAddToCart: (product: { id: string; name: string; price: number; image: string }) => void
  selectedCategory: string
  searchTerm?: string
  sortBy?: string
  userPincode?: string
}

export default function ProductGrid({ onAddToCart, selectedCategory, searchTerm = "", sortBy = "featured", userPincode }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [userPincode])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Fetch all products that are in-stock or low-stock (not out-of-stock)
      // Include pincode for location-based sorting
      const url = userPincode ? `/api/products?pincode=${userPincode}` : "/api/products"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        // Filter out out-of-stock products
        const availableProducts = (data.products || []).filter((p: Product) => p.status !== "out-of-stock")
        setProducts(availableProducts)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory
    const matchesSearch = searchTerm === "" || 
                         p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Calculate distance between two pincodes based on first 4 digits match
  const calculatePincodeDistance = (userPincode: string, retailerPincode: string): number => {
    if (!userPincode || !retailerPincode) return 999999 // No pincode = far away
    
    // Extract first 4 digits for region matching
    const userRegion = userPincode.substring(0, 4)
    const retailerRegion = retailerPincode.substring(0, 4)
    
    // Count matching digits from the start
    let matchingDigits = 0
    for (let i = 0; i < Math.min(userPincode.length, retailerPincode.length); i++) {
      if (userPincode[i] === retailerPincode[i]) {
        matchingDigits++
      } else {
        break
      }
    }
    
    // Return distance score (lower = closer)
    // 6 matching digits = same pincode (distance 0)
    // 4 matching digits = same region (distance 2)
    // 0 matching digits = far away (distance 6)
    return 6 - matchingDigits
  }

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        if (!userPincode) return 0 // No sorting if user has no pincode
        const distanceA = calculatePincodeDistance(userPincode, a.retailer?.pincode || "")
        const distanceB = calculatePincodeDistance(userPincode, b.retailer?.pincode || "")
        return distanceA - distanceB
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      case "featured":
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Featured Products</h1>
        <p className="text-muted-foreground">Browse and shop from local retailers</p>
      </div>

      {sortedProducts.length === 0 ? (
        <Card className="bg-card/50 border-border p-12 text-center">
          <p className="text-muted-foreground text-lg">No products found in this category</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <Card
              key={product.id}
              className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', product.image_url)
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">📦</div>'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    product.status === "in-stock" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {product.status.replace("-", " ")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                <p className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block mb-3 capitalize">
                  {product.category}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.quantity} available
                  </div>
                </div>

                <Button
                  onClick={() =>
                    onAddToCart({ 
                      id: product.id, 
                      name: product.name, 
                      price: product.price, 
                      image: product.image_url || "/placeholder.svg" 
                    })
                  }
                  disabled={product.status === "out-of-stock"}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold disabled:opacity-50"
                >
                  {product.status === "out-of-stock" ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
