// Shared OTP storage (in production, use Redis or database)
// This needs to be in a separate file to be shared across API routes

interface OTPData {
  otp: string
  expiresAt: number
  isSignup: boolean
  role: string
}

class OTPStore {
  private store: Map<string, OTPData>

  constructor() {
    this.store = new Map()
  }

  set(contact: string, data: OTPData) {
    this.store.set(contact, data)
    console.log(`[OTP Store] Stored OTP for ${contact}, expires at ${new Date(data.expiresAt).toLocaleTimeString()}`)
    console.log(`[OTP Store] Total keys after set:`, Array.from(this.store.keys()))
  }

  get(contact: string): OTPData | undefined {
    const data = this.store.get(contact)
    console.log(`[OTP Store] Retrieved OTP for ${contact}:`, data ? 'Found' : 'Not found')
    console.log(`[OTP Store] All keys in store:`, Array.from(this.store.keys()))
    return data
  }

  delete(contact: string) {
    this.store.delete(contact)
    console.log(`[OTP Store] Deleted OTP for ${contact}`)
  }

  has(contact: string): boolean {
    return this.store.has(contact)
  }
}

// Use global variable to persist across hot reloads in development
declare global {
  var otpStoreInstance: OTPStore | undefined
}

// Export a singleton instance that persists across module reloads
export const otpStore = globalThis.otpStoreInstance ?? new OTPStore()

if (process.env.NODE_ENV !== 'production') {
  globalThis.otpStoreInstance = otpStore
}
