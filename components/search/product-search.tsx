"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, convertUSDtoINR } from "@/lib/currency"

interface Product {
  id: string
  name: string
  price: number
  category: string
  rating: number
  reviews: number
  inStock: boolean
}

interface ProductSearchProps {
  products?: Product[]
  onProductSelect?: (product: Product) => void
}

export default function ProductSearch({ products, onProductSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 10000]) // Updated to INR range

  const defaultProducts: Product[] = [
    {
      id: "1",
      name: "Wireless Headphones",
      price: convertUSDtoINR(79.99),
      category: "electronics",
      rating: 4.5,
      reviews: 128,
      inStock: true,
    },
    {
      id: "2",
      name: "Organic Coffee Beans",
      price: convertUSDtoINR(12.99),
      category: "groceries",
      rating: 4.8,
      reviews: 256,
      inStock: true,
    },
    { id: "3", name: "Cotton T-Shirt", price: convertUSDtoINR(24.99), category: "clothing", rating: 4.2, reviews: 89, inStock: true },
    {
      id: "4",
      name: "Smart Speaker",
      price: convertUSDtoINR(99.99),
      category: "electronics",
      rating: 4.6,
      reviews: 342,
      inStock: false,
    },
    { id: "5", name: "Running Shoes", price: convertUSDtoINR(89.99), category: "clothing", rating: 4.7, reviews: 201, inStock: true },
    { id: "6", name: "Coffee Maker", price: convertUSDtoINR(45.99), category: "home", rating: 4.4, reviews: 156, inStock: true },
  ]

  const displayProducts = products || defaultProducts
  const categories = ["all", "electronics", "groceries", "clothing", "home"]

  const filteredProducts = useMemo(() => {
    return displayProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [displayProducts, searchTerm, selectedCategory, priceRange])

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Products</label>
            <Input
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                      : ""
                  }
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="flex-1 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="flex-1 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="bg-card border-border p-4 hover:border-orange-500 transition-colors cursor-pointer"
              onClick={() => onProductSelect?.(product)}
            >
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  {!product.inStock && <Badge className="bg-red-500/20 text-red-700">Out of Stock</Badge>}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg">{formatCurrency(product.price)}</p>
                <div className="text-right">
                  <p className="text-sm font-semibold">⭐ {product.rating}</p>
                  <p className="text-xs text-muted-foreground">{product.reviews} reviews</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
