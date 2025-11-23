import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// POST - Send notification (email/SMS)
export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, notification_type, message_type, recipient, message_content } = body

    if (!user_id || !notification_type || !message_type || !recipient || !message_content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check user's notification preferences
    const { data: preferences } = await supabaseAdmin
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single()

    // If no preferences found, create default ones
    if (!preferences) {
      await supabaseAdmin
        .from("notification_preferences")
        .insert({
          user_id,
          email_notifications: true,
          sms_notifications: true,
          order_updates: true,
        })
    }

    // Check if user has enabled this type of notification
    const shouldSend =
      (notification_type === "email" && preferences?.email_notifications) ||
      (notification_type === "sms" && preferences?.sms_notifications)

    let status = "skipped"
    let errorMessage = null

    if (shouldSend) {
      try {
        if (notification_type === "email") {
          // Email sending logic (using a service like SendGrid, AWS SES, etc.)
          // For demo purposes, we'll just log it
          console.log("[Notification] Email to:", recipient, "Content:", message_content)
          status = "sent"
        } else if (notification_type === "sms") {
          // SMS sending logic (using Twilio)
          // For demo purposes, we'll just log it
          console.log("[Notification] SMS to:", recipient, "Content:", message_content)
          status = "sent"
        }
      } catch (error: any) {
        console.error("[Notification] Send error:", error)
        status = "failed"
        errorMessage = error.message
      }
    }

    // Log the notification
    const { data: log, error: logError } = await supabaseAdmin
      .from("notification_logs")
      .insert({
        user_id,
        notification_type,
        message_type,
        recipient,
        message_content,
        status,
        error_message: errorMessage,
      })
      .select()
      .single()

    if (logError) {
      console.error("[Notification] Log error:", logError)
    }

    return NextResponse.json({
      success: status === "sent",
      status,
      log_id: log?.id,
    })
  } catch (error: any) {
    console.error("[Notification] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Fetch notification preferences
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let userId: string

    if (authToken) {
      userId = authToken
    } else {
      const authenticatedSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      )

      const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      userId = user.id
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: preferences, error } = await supabaseAdmin
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("[Notification Preferences GET] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no preferences, return defaults
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          email_notifications: true,
          sms_notifications: true,
          order_updates: true,
          marketing_emails: false,
        },
      })
    }

    return NextResponse.json({ preferences })
  } catch (error: any) {
    console.error("[Notification Preferences GET] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let userId: string

    if (authToken) {
      userId = authToken
    } else {
      const authenticatedSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      )

      const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      userId = user.id
    }

    const body = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upsert preferences
    const { data: preferences, error } = await supabaseAdmin
      .from("notification_preferences")
      .upsert(
        {
          user_id: userId,
          ...body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (error) {
      console.error("[Notification Preferences PATCH] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error: any) {
    console.error("[Notification Preferences PATCH] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
