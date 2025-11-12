import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const accessToken = request.cookies.get("sb-access-token")?.value
    
    console.log("[Auth /me] Access token exists:", !!accessToken)

    if (!accessToken) {
      console.log("[Auth /me] No access token found in cookies")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create Supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get user from Supabase session
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      console.error("[Auth /me] User error:", userError)
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
    return NextResponse.json(profileData)
  } catch (error) {
    console.error("[Auth /me] Catch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
