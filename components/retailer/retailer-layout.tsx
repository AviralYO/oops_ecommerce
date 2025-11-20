"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

interface RetailerLayoutProps {
  children: React.ReactNode
}

export default function RetailerLayout({ children }: RetailerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

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
            <ThemeToggleButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "R"}
                </div>
                <div className="text-sm text-left">
                  <div className="font-semibold">{user?.name || "Retailer"}</div>
                  <div className="text-xs text-muted-foreground capitalize">Retailer</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Retailer"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ThemeToggle />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/retailer/profile")}>
                👤 View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/retailer/products")}>
                📦 My Products
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/retailer/orders")}>
                🛒 Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/retailer/settings")}>
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
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Menu</h3>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold transition-colors">
              Dashboard
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors">
              Orders
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors">
              Inventory
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors">
              Analytics
            </button>

            <div className="pt-8 mt-8 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Account</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors">
                  Settings
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors">
                  Help
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors">
                  Logout
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
