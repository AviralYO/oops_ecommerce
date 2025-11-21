"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import LoginModal from "@/components/login-modal"
import { useTheme } from "next-themes"
import {
  Moon, Sun, Search, ShoppingCart, User,
  Truck, Shield, Headphones, Star,
  ChevronRight, Heart, Eye
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  quantity: number
  rating?: number
  reviews?: number
}

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push(`/${user.role}`)
    }
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const categories = ["all", ...new Set(products.map(p => p.category))]
  const featuredProducts = products.slice(0, 6)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleProductClick = (productId: string) => {
    if (isAuthenticated) {
      router.push(`/product/${productId}`)
    } else {
      setShowLogin(true)
    }
  }

  const handleCartClick = () => {
    if (isAuthenticated) {
      router.push("/customer")
    } else {
      setShowLogin(true)
    }
  }

  const handleProfileClick = () => {
    if (isAuthenticated && user) {
      router.push(`/${user.role}`)
    } else {
      setShowLogin(true)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                L
              </div>
              <span className="text-2xl font-bold">LiveMART</span>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={handleCartClick}>
                <ShoppingCart className="h-5 w-5" />
              </Button>

              {isAuthenticated && user ? (
                <Button variant="ghost" onClick={handleProfileClick} className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              ) : (
                <Button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to LiveMART</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Discover amazing products from local retailers
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "All Products" : selectedCategory}
            </h2>
            <p className="text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-border"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white">
                        {product.name.charAt(0)}
                      </div>
                    )}
                    {product.quantity < 10 && product.quantity > 0 && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                        Only {product.quantity} left
                      </Badge>
                    )}
                    {product.quantity === 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-500">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product.id)
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
                <span className="text-xl font-bold">LiveMART</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting customers, retailers, and wholesalers seamlessly.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => router.push("/")} className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Browse Products
                  </button>
                </li>
                <li>
                  <button onClick={() => isAuthenticated ? router.push("/customer/orders") : setShowLogin(true)} className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Track Orders
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Return Policy
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setShowLogin(true)} className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Become a Retailer
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowLogin(true)} className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Wholesaler Program
                  </button>
                </li>
                <li>
                  <button onClick={() => isAuthenticated ? handleProfileClick() : setShowLogin(true)} className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Seller Dashboard
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button className="text-muted-foreground hover:text-orange-500 transition-colors">
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
