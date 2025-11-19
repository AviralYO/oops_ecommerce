"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

type UserRole = "customer" | "retailer" | "wholesaler" | null
type AuthMode = "role-select" | "login" | "signup"

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>("role-select")
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login, signup } = useAuth()
  const router = useRouter()

  const DEMO_CREDENTIALS = {
    customer: { email: "customer@example.com", password: "password123" },
    retailer: { email: "retailer@example.com", password: "password123" },
    wholesaler: { email: "wholesaler@example.com", password: "password123" },
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setMode("login")
    setError(null)
    if (role && DEMO_CREDENTIALS[role]) {
      setEmail(DEMO_CREDENTIALS[role].email)
      setPassword(DEMO_CREDENTIALS[role].password)
    }
  }

  const handleSwitch = () => {
    setMode(mode === "login" ? "signup" : "login")
    setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const userData = await login(email, password)
      console.log("[v0] Login successful, redirecting based on role:", userData?.role)

      // Redirect based on ACTUAL user role from database, not selected role
      setTimeout(() => {
        if (userData?.role === "retailer") {
          router.push("/retailer")
        } else if (userData?.role === "wholesaler") {
          router.push("/wholesaler")
        } else {
          router.push("/customer")
        }
        onClose()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const userData = await signup(name, email, password, selectedRole || "customer")
      console.log("[v0] Signup successful, redirecting based on role:", userData?.role)

      // Redirect based on ACTUAL user role from database
      setTimeout(() => {
        if (userData?.role === "retailer") {
          router.push("/retailer")
        } else if (userData?.role === "wholesaler") {
          router.push("/wholesaler")
        } else {
          router.push("/customer")
        }
        onClose()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole || "customer" }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || "Google sign-in failed")
      }

      // Redirect to Google OAuth
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No OAuth URL returned")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <Card className="bg-card border-border shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome to LiveMART</h2>
              <p className="text-muted-foreground text-sm">
                {mode === "role-select"
                  ? "Select your role to continue"
                  : `${mode === "login" ? "Sign in" : "Create account"} as ${selectedRole}`}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
                {error}
              </div>
            )}

            {mode === "role-select" ? (
              <div className="space-y-3">
                {[
                  { role: "customer" as UserRole, label: "Customer", icon: "👥" },
                  { role: "retailer" as UserRole, label: "Retailer", icon: "🏪" },
                  { role: "wholesaler" as UserRole, label: "Wholesaler", icon: "📦" },
                ].map(({ role, label, icon }) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="w-full p-4 rounded-lg border border-border hover:bg-primary/10 hover:border-primary transition-all flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="font-semibold">{label}</div>
                      <p className="text-xs text-muted-foreground">
                        {role === "customer" && "Browse and purchase items"}
                        {role === "retailer" && "Manage your store"}
                        {role === "wholesaler" && "Manage wholesale operations"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                {mode === "login" && (
                  <p className="text-xs text-muted-foreground">
                    Demo: Use {DEMO_CREDENTIALS[selectedRole || "customer"].email} with password "password123"
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full border-border hover:bg-accent/50"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <button
                  type="button"
                  onClick={handleSwitch}
                  className="w-full text-sm text-primary hover:underline mt-4"
                  disabled={isLoading}
                >
                  {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("role-select")
                    setSelectedRole(null)
                    setError(null)
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  ← Choose different role
                </button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
