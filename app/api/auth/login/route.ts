import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // Create Supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error("[Supabase] Login auth error:", authError)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("[Supabase] Profile fetch error:", profileError)
    }

    const profileData = profile || {
      id: authData.user.id,
      name: authData.user.user_metadata?.name || email.split("@")[0],
      email,
      role: authData.user.user_metadata?.role || "customer",
    }

    // Create response
    const response = NextResponse.json(profileData, { status: 200 })

    // Set session cookies
    if (authData.session) {
      response.cookies.set("sb-access-token", authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: authData.session.expires_in || 3600,
      })
      response.cookies.set("sb-refresh-token", authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    console.log("[Supabase] Login successful:", email)
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Supabase] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
