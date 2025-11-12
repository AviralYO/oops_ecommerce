"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, convertUSDtoINR } from "@/lib/currency"

interface Product {
  id: string
  name: string
  price: number
  rating: number
  image: string
  category: string
  retailer: string
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: convertUSDtoINR(79.99),
    rating: 4.5,
    image: "/wireless-headphones.png",
    category: "electronics",
    retailer: "TechStore",
  },
  {
    id: "2",
    name: "Organic Coffee Beans",
    price: convertUSDtoINR(12.99),
    rating: 4.8,
    image: "/pile-of-coffee-beans.png",
    category: "groceries",
    retailer: "Fresh Market",
  },
  {
    id: "3",
    name: "Cotton T-Shirt",
    price: convertUSDtoINR(24.99),
    rating: 4.2,
    image: "/cotton-tshirt.png",
    category: "clothing",
    retailer: "Fashion Hub",
  },
  {
    id: "4",
    name: "JavaScript Guide",
    price: convertUSDtoINR(34.99),
    rating: 4.7,
    image: "/javascript-book.png",
    category: "books",
    retailer: "BookWorld",
  },
  {
    id: "5",
    name: "Smart Speaker",
    price: convertUSDtoINR(99.99),
    rating: 4.6,
    image: "/smart-speaker.png",
    category: "electronics",
    retailer: "TechStore",
  },
  {
    id: "6",
    name: "Yoga Mat",
    price: convertUSDtoINR(29.99),
    rating: 4.4,
    image: "/rolled-yoga-mat.png",
    category: "home",
    retailer: "Home Living",
  },
]

interface ProductGridProps {
  onAddToCart: (product: { id: string; name: string; price: number; image: string }) => void
  selectedCategory: string
}

export default function ProductGrid({ onAddToCart, selectedCategory }: ProductGridProps) {
  const filteredProducts =
    selectedCategory === "all" ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter((p) => p.category === selectedCategory)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Featured Products</h1>
        <p className="text-muted-foreground">Browse and shop from local retailers</p>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="bg-card/50 border-border p-12 text-center">
          <p className="text-muted-foreground text-lg">No products found in this category</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <span className="text-xs bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-700 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-3">by {product.retailer}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">⭐ {product.rating}</span>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    onAddToCart({ id: product.id, name: product.name, price: product.price, image: product.image })
                  }
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold"
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
