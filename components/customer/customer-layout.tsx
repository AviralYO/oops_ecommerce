"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun, Home, User, Package, Heart, Settings, ChevronDown, Filter, Calendar } from "lucide-react"

interface CustomerLayoutProps {
  children: React.ReactNode
  cartCount: number
  onCartClick: () => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  sortBy?: string
  onSortChange?: (sort: string) => void
}

const categories = ["all", "electronics", "groceries", "clothing", "books", "home"]

export default function CustomerLayout({
  children,
  cartCount,
  onCartClick,
  selectedCategory,
  onCategoryChange,
  searchTerm = "",
  onSearchChange,
  sortBy = "featured",
  onSortChange,
}: CustomerLayoutProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && localSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(localSearch)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
              <span className="text-xl font-bold">LiveMART</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={localSearch}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <ThemeToggleButton />
              <Button
                onClick={onCartClick}
                className="relative bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="text-sm text-left hidden md:block">
                      <div className="font-semibold">{user?.name || "User"}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user?.role || "Customer"}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    🚪 Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Horizontal Navigation Menu */}
          <div className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center justify-between py-3 gap-4">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/customer")}
                    className="whitespace-nowrap gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/customer/profile")}
                    className="whitespace-nowrap gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/customer/orders")}
                    className="whitespace-nowrap gap-2"
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/customer/offline-orders")}
                    className="whitespace-nowrap gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Pickup Orders
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/customer/wishlist")}
                    className="whitespace-nowrap gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/customer/settings")}
                    className="whitespace-nowrap gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>

                {/* Categories and Sort Dropdowns */}
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="whitespace-nowrap gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="capitalize">{selectedCategory === "all" ? "All Categories" : selectedCategory}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Categories</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Array.isArray(categories) && categories.map((category) => (
                        <DropdownMenuItem
                          key={category}
                          onClick={() => onCategoryChange(category)}
                          className={selectedCategory === category ? "bg-orange-500/10 text-orange-600 font-medium" : ""}
                        >
                          <span className="capitalize">{category === "all" ? "All Categories" : category}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {onSortChange && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="whitespace-nowrap gap-2">
                          Sort: <span className="capitalize">{sortBy}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSortChange("featured")} className={sortBy === "featured" ? "bg-orange-500/10 text-orange-600 font-medium" : ""}>
                          Featured
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange("distance")} className={sortBy === "distance" ? "bg-orange-500/10 text-orange-600 font-medium" : ""}>
                          📍 Nearest First
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange("price-asc")} className={sortBy === "price-asc" ? "bg-orange-500/10 text-orange-600 font-medium" : ""}>
                          Price: Low to High
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange("price-desc")} className={sortBy === "price-desc" ? "bg-orange-500/10 text-orange-600 font-medium" : ""}>
                          Price: High to Low
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange("name-asc")} className={sortBy === "name-asc" ? "bg-orange-500/10 text-orange-600 font-medium" : ""}>
                          Name: A to Z
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSortChange("name-desc")} className={sortBy === "name-desc" ? "bg-orange-500/10 text-orange-600 font-medium" : ""}>
                          Name: Z to A
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden border-b border-border bg-background px-4 py-3">
        <input
          type="text"
          placeholder="Search products..."
          value={localSearch}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Main Content - Full Width */}
      <div className="w-full">
        <main className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-lg"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}
