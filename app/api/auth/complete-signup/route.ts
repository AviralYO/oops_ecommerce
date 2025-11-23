import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

const completeSignupSchema = z.object({
  contact: z.string().min(1, "Contact is required"),
  name: z.string().min(1, "Name is required"),
  pincode: z.string().min(5, "Valid pincode is required"),
  role: z.enum(["customer", "retailer", "wholesaler"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = completeSignupSchema.parse(body)
    const { contact, name, pincode, role } = validatedData

    // Use admin client for user creation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create user with Supabase Auth (using email)
    // For phone numbers, you'd need to generate a unique email or use Supabase phone auth
    const isEmail = contact.includes("@")
    const authEmail = isEmail ? contact : `${contact}@temp.livemart.com`
    
    // Generate random password for OTP signup
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { name, role, pincode },
    })

    if (authError) {
      console.error("Supabase auth error:", authError)
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }

    // Create profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: authEmail,
        name,
        role,
        pincode,
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      )
    }

    // Create session cookie
    const response = NextResponse.json({
      success: true,
      message: "Account created successfully",
      id: authData.user.id,
      email: authEmail,
      name,
      role,
      pincode,
      createdAt: new Date().toISOString(),
    })

    // Set session cookie (7 days)
    response.cookies.set("auth-token", authData.user.id, {
      httpOnly: false, // Allow client-side access for debugging
      secure: false, // Allow in development
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    
    console.log("[Auth] Setting auth-token cookie for new user:", authData.user.id)

    return response
  } catch (error) {
    console.error("Complete signup error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to complete signup" },
      { status: 500 }
    )
  }
}
