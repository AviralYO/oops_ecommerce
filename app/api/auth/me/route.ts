import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Get tokens from cookies
    const accessToken = request.cookies.get("sb-access-token")?.value
    const refreshToken = request.cookies.get("sb-refresh-token")?.value
    
    console.log("[Auth /me] Access token exists:", !!accessToken)
    console.log("[Auth /me] Refresh token exists:", !!refreshToken)

    if (!accessToken && !refreshToken) {
      console.log("[Auth /me] No tokens found in cookies")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create Supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let user = null
    let session = null

    // Try to get user with access token
    if (accessToken) {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(accessToken)
      
      if (!userError && authUser) {
        user = authUser
        console.log("[Auth /me] Access token valid, user found:", user.email)
      } else {
        console.log("[Auth /me] Access token invalid or expired:", userError?.message)
      }
    }

    // If access token failed, try to refresh using refresh token
    if (!user && refreshToken) {
      console.log("[Auth /me] Attempting token refresh...")
      const { data, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      })

      if (refreshError || !data.session || !data.user) {
        console.error("[Auth /me] Token refresh failed:", refreshError)
        
        // Clear invalid cookies
        const response = NextResponse.json({ error: "Session expired" }, { status: 401 })
        response.cookies.delete("sb-access-token")
        response.cookies.delete("sb-refresh-token")
        return response
      }

      user = data.user
      session = data.session
      console.log("[Auth /me] Token refresh successful:", user.email)
    }

    if (!user) {
      console.error("[Auth /me] No valid user found")
      return NextResponse.json({ error: "Session invalid" }, { status: 401 })
    }

    console.log("[Auth /me] User found:", user.email)

    // Get profile from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[Auth /me] Profile error:", profileError)
    }

    const profileData = profile || {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      role: user.user_metadata?.role || "customer",
    }

    console.log("[Auth /me] Returning profile:", profileData.email, profileData.role)
    
    // Create response
    const response = NextResponse.json(profileData)

    // If we refreshed the token, update the cookies
    if (session) {
      response.cookies.set("sb-access-token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: session.expires_in || 3600,
      })
      response.cookies.set("sb-refresh-token", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      console.log("[Auth /me] Updated cookies with refreshed tokens")
    }

    return response
  } catch (error) {
    console.error("[Auth /me] Catch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
