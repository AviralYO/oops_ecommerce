import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Handle OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const role = searchParams.get("role") || "customer"
  const next = searchParams.get("next") ?? "/"

  if (code) {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      console.log("[OAuth Callback] User ID:", data.user.id, "Email:", data.user.email)

      // Check if profile exists
      const { data: profile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      console.log("[OAuth Callback] Profile fetch result:", profile, "Error:", profileFetchError)

      let userRole = role

      // If no profile, create one (for Google sign-in)
      if (!profile && data.user.email) {
        console.log("[OAuth Callback] Creating new profile for:", data.user.email)
        
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email.split("@")[0],
            role: role,
          })
          .select()
          .single()

        if (profileError) {
          console.error("[OAuth Callback] Profile creation error:", profileError)
        } else {
          console.log("[OAuth Callback] Profile created successfully:", newProfile)
        }
      } else if (profile) {
        console.log("[OAuth Callback] Profile already exists, using role:", profile.role)
        userRole = profile.role
      }

      // Determine redirect based on role
      let redirectPath = "/"
      if (userRole === "customer") {
        redirectPath = "/customer"
      } else if (userRole === "retailer") {
        redirectPath = "/retailer"
      } else if (userRole === "wholesaler") {
        redirectPath = "/wholesaler"
      }

      console.log("[OAuth Callback] Redirecting to:", redirectPath, "for user:", data.user.email)

      // Redirect with session
      const response = NextResponse.redirect(new URL(redirectPath, request.url))
      response.cookies.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: data.session.expires_in || 3600,
        path: "/",
      })
      response.cookies.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      
      console.log("[OAuth Callback] Cookies set for:", data.user.email)
      return response
    }
  }

  // Return to home if error
  return NextResponse.redirect(new URL("/", request.url))
}
