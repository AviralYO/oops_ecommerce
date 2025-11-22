# OTP Service Integration Guide

## Recommended OTP Services

### 1. **Twilio** (Most Popular - SMS & WhatsApp)
- **Pricing**: Pay-as-you-go, ~$0.0075 per SMS in India
- **Features**: SMS, WhatsApp, Voice OTP
- **Setup Time**: 15 minutes

### 2. **AWS SNS** (Best for AWS users)
- **Pricing**: $0.00645 per SMS in India
- **Features**: SMS only, highly scalable
- **Setup Time**: 20 minutes

### 3. **MSG91** (Popular in India)
- **Pricing**: ₹0.15 per SMS
- **Features**: SMS, Voice OTP, Email OTP
- **Setup Time**: 10 minutes

### 4. **Firebase Phone Auth** (Easiest)
- **Pricing**: Free tier available
- **Features**: Phone verification built-in
- **Setup Time**: 10 minutes

---

## Option 1: Twilio Integration (Recommended)

### Step 1: Sign Up & Get Credentials
1. Go to https://www.twilio.com/try-twilio
2. Sign up and verify your phone
3. Get your credentials from console:
   - Account SID
   - Auth Token
   - Twilio Phone Number

### Step 2: Install Twilio SDK
```bash
npm install twilio
```

### Step 3: Add Environment Variables
Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Step 4: Update send-otp API
Replace the current send-otp route with:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const otpStore = new Map<string, { otp: string; expiresAt: number; isSignup: boolean; role: string }>()

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
    
    // Store OTP with 10-minute expiry
    const expiresAt = Date.now() + 10 * 60 * 1000
    otpStore.set(contact, { otp, expiresAt, isSignup, role: role || "customer" })

    // Determine if contact is phone or email
    const isPhone = /^[+]?[\d\s-()]+$/.test(contact)

    if (isPhone) {
      // Send SMS via Twilio
      await client.messages.create({
        body: `Your LiveMART OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: contact.startsWith("+") ? contact : `+91${contact}`, // Add country code if missing
      })
    } else {
      // For email, use your email service (see email section below)
      // Or return error for now
      return NextResponse.json(
        { error: "Email OTP not configured yet. Please use phone number." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
```

---

## Option 2: MSG91 Integration (Best for India)

### Step 1: Sign Up
1. Go to https://msg91.com/
2. Sign up and verify
3. Get API Key from dashboard

### Step 2: Add Environment Variables
```env
MSG91_API_KEY=your_api_key
MSG91_SENDER_ID=your_sender_id
MSG91_TEMPLATE_ID=your_template_id
```

### Step 3: Update send-otp API
```typescript
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const otpStore = new Map<string, { otp: string; expiresAt: number; isSignup: boolean; role: string }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contact, isSignup, role } = body

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000
    otpStore.set(contact, { otp, expiresAt, isSignup, role: role || "customer" })

    // Send OTP via MSG91
    const response = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": process.env.MSG91_API_KEY!,
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: contact,
        otp: otp,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send OTP via MSG91")
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
```

---

## Option 3: Firebase Phone Auth (Easiest)

### Step 1: Setup Firebase
1. Go to https://console.firebase.google.com/
2. Create project
3. Enable Phone Authentication
4. Add your app

### Step 2: Install Firebase
```bash
npm install firebase
```

### Step 3: Create Firebase Config
Create `lib/firebase.ts`:
```typescript
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

### Step 4: Use Firebase in Component
Firebase handles OTP on the client side:
```typescript
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"

// In your component:
const sendOTP = async (phoneNumber: string) => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible'
  })
  
  const confirmationResult = await signInWithPhoneNumber(
    auth, 
    phoneNumber, 
    recaptchaVerifier
  )
  
  // Save confirmationResult for verification
}

const verifyOTP = async (otp: string) => {
  await confirmationResult.confirm(otp)
  // User verified!
}
```

---

## Email OTP (Using Resend)

### Step 1: Sign Up
1. Go to https://resend.com/
2. Get API Key

### Step 2: Install
```bash
npm install resend
```

### Step 3: Send Email OTP
```typescript
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'LiveMART <onboarding@yourdomain.com>',
  to: contact,
  subject: 'Your OTP Code',
  html: `<h1>Your OTP is: ${otp}</h1><p>Valid for 10 minutes.</p>`,
})
```

---

## My Recommendation

**For Production: Use Twilio**
- ✅ Most reliable
- ✅ Great documentation
- ✅ Supports SMS + WhatsApp
- ✅ Works globally

**For India-focused: Use MSG91**
- ✅ Cheaper in India
- ✅ Better delivery rates in India
- ✅ Good support

**For Quick Start: Use Firebase**
- ✅ Free tier
- ✅ No backend needed
- ✅ Handles everything

---

## Next Steps

1. Choose your service
2. Sign up and get API keys
3. Add environment variables
4. Update `send-otp/route.ts`
5. Test with real phone number
6. Remove `dev_otp` from response

Let me know which service you want to use, and I'll help you integrate it!
