"use client"

import { useState, useEffect, type ReactNode } from "react"
import { AuthContext, type User } from "@/lib/auth-context"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to check auth status
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: 'include',
        cache: 'no-store'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        console.log("[AuthProvider] User authenticated:", userData.email)
        return userData
      } else {
        setUser(null)
        console.log("[AuthProvider] No user authenticated")
        return null
      }
    } catch (err) {
      console.error("[AuthProvider] Auth check failed:", err)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login failed")
      }

      const userData = await response.json()
      setUser(userData)
      console.log("[v0] User logged in:", userData.email, "Role:", userData.role)
      return userData
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, role: string, pincode?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, pincode }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Signup failed")
      }

      const userData = await response.json()
      setUser(userData)
      console.log("[v0] User signed up:", userData.email, "Role:", userData.role)
      return userData
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      console.log("[v0] User logged out")
    } catch (err) {
      console.error("Logout failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async () => {
    return await checkAuth()
  }

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    refreshAuth,
    isAuthenticated: user !== null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
