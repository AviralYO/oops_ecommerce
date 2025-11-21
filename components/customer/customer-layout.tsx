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
import { Moon, Sun } from "lucide-react"

interface CustomerLayoutProps {
  children: React.ReactNode
  cartCount: number
  onCartClick: () => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
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
}: CustomerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
              <nav className="flex items-center gap-1 overflow-x-auto py-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/customer")}
                  className="whitespace-nowrap"
                >
                  🏠 Home
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/customer/profile")}
                  className="whitespace-nowrap"
                >
                  👤 Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/customer/orders")}
                  className="whitespace-nowrap"
                >
                  📦 My Orders
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/customer/wishlist")}
                  className="whitespace-nowrap"
                >
                  ❤️ Wishlist
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/customer/settings")}
                  className="whitespace-nowrap"
                >
                  ⚙️ Settings
                </Button>

                {/* Category Pills */}
                <div className="h-8 w-px bg-border mx-2"></div>
                <div className="flex gap-2">
                  {Array.isArray(categories) && categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      onClick={() => onCategoryChange(category)}
                      className={`whitespace-nowrap capitalize ${
                        selectedCategory === category ? "bg-orange-500 hover:bg-orange-600 text-white" : ""
                      }`}
                      size="sm"
                    >
                      {category === "all" ? "All" : category}
                    </Button>
                  ))}
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
