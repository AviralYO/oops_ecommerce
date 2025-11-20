"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import CustomerLayout from "@/components/customer/customer-layout"
import ProductGrid from "@/components/customer/product-grid"
import ShoppingCart from "@/components/customer/shopping-cart"
import { useToast } from "@/hooks/use-toast"

export default function CustomerDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<
    Array<{ id: string; product_id: string; name: string; price: number; quantity: number; image: string }>
  >([])
  const [showCart, setShowCart] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingCart, setLoadingCart] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) {
      fetchCart()
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        const formattedItems = (data.cartItems || []).map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          name: item.products?.name || "Unknown Product",
          price: item.products?.price || 0,
          quantity: item.quantity,
          image: item.products?.image_url || "/placeholder.svg",
        }))
        setCartItems(formattedItems)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "customer") {
    return null
  }

  const addToCart = async (product: { id: string; name: string; price: number; image: string }) => {
    setLoadingCart(true)
    try {
      console.log("Attempting to add to cart:", product.id)
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      })

      console.log("Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Success:", data)
        await fetchCart()
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        })
      } else {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Error response:", error)
        toast({
          title: "Error",
          description: error.error || "Failed to add to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Exception:", error)
      toast({
        title: "Error",
        description: "Network error - check console",
        variant: "destructive",
      })
    } finally {
      setLoadingCart(false)
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCart()
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: cartItemId, quantity: newQuantity }),
      })

      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out",
        variant: "destructive",
      })
      return
    }
    router.push("/checkout")
  }

  return (
    <CustomerLayout
      cartCount={cartItems.length}
      onCartClick={() => setShowCart(!showCart)}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="flex gap-6">
        <div className="flex-1">
          <ProductGrid onAddToCart={addToCart} selectedCategory={selectedCategory} searchTerm={searchTerm} />
        </div>
        {showCart && (
          <div className="w-96">
            <ShoppingCart 
              items={cartItems} 
              onRemove={removeFromCart} 
              onUpdateQuantity={updateQuantity}
              onCheckout={handleCheckout}
              loading={loadingCart}
            />
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}
