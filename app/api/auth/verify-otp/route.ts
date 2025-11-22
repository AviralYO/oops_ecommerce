import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { otpStore } from "@/lib/otp-store"

const verifyOTPSchema = z.object({
  contact: z.string().min(1, "Contact is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  isSignup: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifyOTPSchema.parse(body)
    const { contact, otp, isSignup } = validatedData

    // Normalize contact - remove all non-digits for lookup
    const normalizedContact = contact.replace(/\D/g, "")

    // Retrieve stored OTP using normalized contact
    const storedData = otpStore.get(normalizedContact)

    if (!storedData) {
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new OTP." },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(normalizedContact)
      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      )
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      )
    }

    // OTP verified successfully
    if (!isSignup) {
      // For login, fetch user from database
      // Try to find user by email (stored with temp domain for phone numbers)
      const searchEmail = contact.includes("@") ? contact : `${normalizedContact}@temp.livemart.com`
      
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", searchEmail)
        .single()

      if (error || !profiles) {
        return NextResponse.json(
          { error: "User not found. Please sign up first." },
          { status: 404 }
        )
      }

      // Store verified contact in OTP store for session creation
      otpStore.set(normalizedContact, { ...storedData, otp: "VERIFIED" })

      // Create session cookie
      const response = NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        id: profiles.id,
        email: profiles.email,
        name: profiles.name,
        role: profiles.role,
        pincode: profiles.pincode,
        createdAt: profiles.created_at,
      })

      // Set session cookie (7 days)
      response.cookies.set("auth-token", profiles.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })

      return response
    } else {
      // For signup, just verify OTP - user will complete signup in next step
      otpStore.set(normalizedContact, { ...storedData, otp: "VERIFIED" })
      
      return NextResponse.json({
        success: true,
        message: "OTP verified. Please complete your profile.",
      })
    }
  } catch (error) {
    console.error("Verify OTP error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}
