import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    // Sign out from Supabase if logged in
    if (accessToken) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
    }

    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 })

    // Clear Supabase auth cookies
    response.cookies.set("sb-access-token", "", {
      httpOnly: true,
      maxAge: 0,
    })
    response.cookies.set("sb-refresh-token", "", {
      httpOnly: true,
      maxAge: 0,
    })

    console.log("[Supabase] Logout successful")
    return response
  } catch (error) {
    console.error("[Supabase] Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
