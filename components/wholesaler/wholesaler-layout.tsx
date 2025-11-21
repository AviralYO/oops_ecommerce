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

interface WholesalerLayoutProps {
  children: React.ReactNode
}

export default function WholesalerLayout({ children }: WholesalerLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

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
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/wholesaler")}>
              <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-500"></div>
              <span className="text-xl font-bold">LiveMART</span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-500 text-white ml-2">Wholesaler</span>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggleButton />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "W"}
                    </div>
                    <div className="text-sm text-left hidden md:block">
                      <div className="font-semibold">{user?.name || "Wholesaler"}</div>
                      <div className="text-xs text-muted-foreground capitalize">Wholesaler</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "Wholesaler"}</p>
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
                  onClick={() => router.push("/wholesaler")}
                  className="whitespace-nowrap"
                >
                  🏠 Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/wholesaler/profile")}
                  className="whitespace-nowrap"
                >
                  👤 Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/wholesaler/orders")}
                  className="whitespace-nowrap"
                >
                  📦 Orders
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/wholesaler/inventory")}
                  className="whitespace-nowrap"
                >
                  📋 Products
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/wholesaler/settings")}
                  className="whitespace-nowrap"
                >
                  ⚙️ Settings
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

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
