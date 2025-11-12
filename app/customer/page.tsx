"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import CustomerLayout from "@/components/customer/customer-layout"
import ProductGrid from "@/components/customer/product-grid"
import ShoppingCart from "@/components/customer/shopping-cart"

export default function CustomerDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<
    Array<{ id: string; name: string; price: number; quantity: number; image: string }>
  >([])
  const [showCart, setShowCart] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "customer") {
    return null
  }

  const addToCart = (product: { id: string; name: string; price: number; image: string }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }

  return (
    <CustomerLayout
      cartCount={cartItems.length}
      onCartClick={() => setShowCart(!showCart)}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
    >
      <div className="flex gap-6">
        <div className="flex-1">
          <ProductGrid onAddToCart={addToCart} selectedCategory={selectedCategory} />
        </div>
        {showCart && (
          <div className="w-96">
            <ShoppingCart items={cartItems} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} />
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
