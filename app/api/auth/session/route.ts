import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken, refreshToken, role } = body

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Missing tokens" },
        { status: 400 }
      )
    }

    console.log("[Session API] Setting session from tokens")

    // Create authenticated Supabase client with user's access token
    const { createClient } = require('@supabase/supabase-js')
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    // Get user data from access token
    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      console.error("[Session API] Error getting user:", userError)
      return NextResponse.json(
        { error: "Invalid tokens" },
        { status: 401 }
      )
    }

    console.log("[Session API] User authenticated:", user.email)

    // Check if profile exists using authenticated client
    const { data: profile, error: profileError } = await authenticatedSupabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    let userRole = role

    if (!profile) {
      // Create profile for new Google user using authenticated client
      console.log("[Session API] Creating new profile for Google user")
      
      const newProfile = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split("@")[0],
        role: role,
      }

      const { error: createError } = await authenticatedSupabase
        .from("profiles")
        .insert(newProfile)

      if (createError) {
        console.error("[Session API] Error creating profile:", createError)
      } else {
        console.log("[Session API] Profile created successfully")
      }
    } else {
      // Use existing role
      userRole = profile.role
      console.log("[Session API] Existing profile found, role:", userRole)
    }

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      role: userRole,
    })

    // Set auth cookies
    response.cookies.set("sb-access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("sb-refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    console.log("[Session API] Cookies set, returning success")

    return response
  } catch (error) {
    console.error("[Session API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
