import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function PATCH(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, pincode } = body

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Determine user ID based on auth method
    let userId: string

    if (authToken) {
      // OTP authentication - authToken is the user ID
      userId = authToken
    } else {
      // OAuth authentication - verify token and get user
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

      const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

      if (userError || !user) {
        return NextResponse.json(
          { error: "Invalid session" },
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Update profile
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (pincode !== undefined) updateData.pincode = pincode

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("[Profile] Update error:", error)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error("[Profile] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
