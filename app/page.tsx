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
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">LiveMART</span>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
                <Input
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-full focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:bg-muted"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={handleCartClick} className="hover:bg-muted relative">
                <ShoppingCart className="h-5 w-5" />
              </Button>

              {isAuthenticated && user ? (
                <Button variant="ghost" onClick={handleProfileClick} className="gap-2 hover:bg-muted">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </Button>
              ) : (
                <Button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold ml-2">
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
              <Input
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-full focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Shop Smart<br />from Local Retailers
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Discover amazing products from trusted retailers and wholesalers near you. Fast delivery, great prices, authentic products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowLogin(true)}
                  className="bg-white hover:bg-gray-100 text-orange-600 font-semibold text-base px-8 py-3 h-auto rounded-lg transition-all hover:shadow-lg"
                >
                  Start Shopping
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold text-base px-8 py-3 h-auto rounded-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-white border border-white/20">
                  <Truck className="h-8 w-8 mb-3" />
                  <p className="font-semibold">Fast Delivery</p>
                  <p className="text-sm text-white/80">Quick shipping to your location</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-white border border-white/20">
                  <Shield className="h-8 w-8 mb-3" />
                  <p className="font-semibold">Secure Payments</p>
                  <p className="text-sm text-white/80">Safe and verified transactions</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-white border border-white/20">
                  <Star className="h-8 w-8 mb-3" />
                  <p className="font-semibold">Quality Products</p>
                  <p className="text-sm text-white/80">Trusted verified sellers</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 text-white border border-white/20">
                  <Headphones className="h-8 w-8 mb-3" />
                  <p className="font-semibold">24/7 Support</p>
                  <p className="text-sm text-white/80">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4 relative z-10">
        <div className="bg-white dark:bg-card shadow-md rounded-xl p-6 text-center border border-border">
          <Truck className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-semibold">Free Shipping</p>
          <p className="text-xs text-muted-foreground">On orders over ₹500</p>
        </div>
        <div className="bg-white dark:bg-card shadow-md rounded-xl p-6 text-center border border-border">
          <Shield className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-semibold">100% Secure</p>
          <p className="text-xs text-muted-foreground">Safe checkout</p>
        </div>
        <div className="bg-white dark:bg-card shadow-md rounded-xl p-6 text-center border border-border">
          <RotatedReturn className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-semibold">Easy Returns</p>
          <p className="text-xs text-muted-foreground">Within 7 days</p>
        </div>
        <div className="bg-white dark:bg-card shadow-md rounded-xl p-6 text-center border border-border">
          <Headphones className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-semibold">24/7 Support</p>
          <p className="text-xs text-muted-foreground">Dedicated help</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Shop by Category</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 font-semibold whitespace-nowrap" : "whitespace-nowrap"}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && selectedCategory === "all" && filteredProducts.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="text-muted-foreground mt-2">Handpicked collections just for you</p>
              </div>
              <Button variant="ghost" className="gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <Card className="overflow-hidden border-border hover:shadow-xl transition-all duration-300 h-full flex flex-col">
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
                      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/20 to-transparent p-3 flex justify-between items-start">
                        {product.quantity < 5 && product.quantity > 0 && (
                          <Badge className="bg-red-500/90 text-white">Limited</Badge>
                        )}
                        {product.quantity === 0 && (
                          <Badge className="bg-gray-600/90 text-white">Out of Stock</Badge>
                        )}
                        <button className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
                          <Heart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">(28)</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-lg font-bold text-orange-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductClick(product.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">
                {selectedCategory === "all" ? "All Products" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </h2>
              <p className="text-muted-foreground mt-2">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <Card className="overflow-hidden border-border hover:shadow-xl transition-all duration-300 h-full flex flex-col">
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
                      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/20 to-transparent p-3 flex justify-between items-start">
                        {product.quantity < 5 && product.quantity > 0 && (
                          <Badge className="bg-red-500/90 text-white">Limited</Badge>
                        )}
                        {product.quantity === 0 && (
                          <Badge className="bg-gray-600/90 text-white">Out of Stock</Badge>
                        )}
                        <button className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
                          <Heart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">(28)</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-lg font-bold text-orange-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductClick(product.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}

function RotatedReturn() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3 7v6h6M21 17v-6h-6" />
      <path d="M18.5 9C19.5 7.5 21 6 21 6M5.5 15C4.5 16.5 3 18 3 18" />
    </svg>
  )
}
