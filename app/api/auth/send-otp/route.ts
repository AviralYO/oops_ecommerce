import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import twilio from "twilio"
import { otpStore } from "@/lib/otp-store"

const sendOTPSchema = z.object({
  contact: z.string().min(1, "Contact is required"),
  isSignup: z.boolean(),
  role: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = sendOTPSchema.parse(body)
    const { contact, isSignup, role } = validatedData

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Determine if contact is phone or email
    const isPhone = /^[+]?[\d\s-()]+$/.test(contact)

    if (isPhone) {
      // Normalize phone number - remove all non-digits for storage key
      const normalizedContact = contact.replace(/\D/g, "")
      
      // Format phone number (add +91 for India if no country code)
      const formattedPhone = contact.startsWith("+") ? contact : `+91${normalizedContact}`
      
      // Store OTP with 10-minute expiry using normalized contact as key
      const expiresAt = Date.now() + 10 * 60 * 1000
      otpStore.set(normalizedContact, { otp, expiresAt, isSignup, role: role || "customer" })
      
      // Initialize Twilio client inside function to ensure env vars are loaded
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER

      if (!accountSid || !authToken || !phoneNumber) {
        console.error("[Twilio] Missing credentials:", { 
          hasSid: !!accountSid, 
          hasToken: !!authToken, 
          hasPhone: !!phoneNumber 
        })
        return NextResponse.json(
          { error: "SMS service not configured. Please contact support." },
          { status: 500 }
        )
      }

      const twilioClient = twilio(accountSid, authToken)
      
      try {
        // Send SMS via Twilio
        await twilioClient.messages.create({
          body: `Your LiveMART verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
          from: phoneNumber,
          to: formattedPhone,
        })

        console.log(`[OTP] Sent to ${formattedPhone}`)
        
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully to your phone",
        })
      } catch (twilioError: any) {
        console.error("Twilio error:", twilioError)
        
        // Return more specific error messages
        if (twilioError.code === 21211) {
          return NextResponse.json(
            { error: "Invalid phone number. Please check and try again." },
            { status: 400 }
          )
        }
        
        if (twilioError.code === 21608) {
          return NextResponse.json(
            { error: "This phone number is not verified in your Twilio trial account. Please verify it first or upgrade your account." },
            { status: 400 }
          )
        }
        
        throw twilioError
      }
    } else {
      // Email OTP - not implemented yet
      return NextResponse.json(
        { error: "Email OTP not configured. Please use phone number." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    )
  }
}
