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
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-accent rounded-lg">
              ☰
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
              <span className="text-xl font-bold">LiveMART</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
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
                  <div className="text-sm text-left">
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
                <ThemeToggle />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/customer/profile")}>
                  👤 View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/customer/orders")}>
                  📦 My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/customer/wishlist")}>
                  ❤️ My Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/customer/settings")}>
                  ⚙️ Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  🚪 Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } transition-all duration-200 bg-card border-r border-border fixed h-screen overflow-y-auto lg:static lg:w-64 z-30`}
        >
          <nav className="p-6 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Categories</h3>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full text-left px-4 py-2 rounded-lg capitalize transition-colors ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {category === "all" ? "All Products" : category}
              </button>
            ))}

            <div className="pt-8 mt-8 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/customer/profile")}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => router.push("/customer/orders")}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  <span>📦</span>
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => router.push("/customer/wishlist")}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  <span>❤️</span>
                  <span>My Wishlist</span>
                </button>
                <button
                  onClick={() => router.push("/customer/settings")}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">{children}</main>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? (
        <>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark Mode</span>
        </>
      )}
    </DropdownMenuItem>
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
