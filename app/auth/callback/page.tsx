"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Check for hash parameters (implicit flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")

      // Check for query parameters (code flow)
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get("code")
      const role = searchParams.get("role") || "customer"

      if (accessToken && refreshToken) {
        // Handle implicit flow (hash-based)
        console.log("[Client Callback] Hash-based auth detected")
        
        try {
          // Set cookies via API
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, refreshToken, role }),
          })

          if (response.ok) {
            const data = await response.json()
            // Redirect based on role
            if (data.role === "retailer") {
              router.push("/retailer")
            } else if (data.role === "wholesaler") {
              router.push("/wholesaler")
            } else {
              router.push("/customer")
            }
          } else {
            router.push("/")
          }
        } catch (error) {
          console.error("[Client Callback] Error:", error)
          router.push("/")
        }
      } else if (code) {
        // Let server-side callback handle code flow
        console.log("[Client Callback] Code flow - redirecting to server callback")
        // Server will handle this
      } else {
        // No auth data, redirect home
        console.log("[Client Callback] No auth data found")
        router.push("/")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
