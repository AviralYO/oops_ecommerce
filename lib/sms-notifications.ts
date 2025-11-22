// SMS notification service using Twilio
import twilio from "twilio"

interface OrderSMSData {
  customerPhone: string
  customerName: string
  orderId: string
  totalAmount: number
  itemCount: number
}

interface ConfirmationSMSData {
  customerPhone: string
  customerName: string
  orderId: string
  estimatedDelivery?: string
}

export async function sendOrderPlacedSMS(data: OrderSMSData): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !phoneNumber) {
      console.error("[SMS] Twilio credentials not configured")
      return false
    }

    const twilioClient = twilio(accountSid, authToken)
    
    // Normalize and format phone number
    const normalizedPhone = data.customerPhone.replace(/\D/g, "")
    const formattedPhone = normalizedPhone.startsWith("+") ? normalizedPhone : `+91${normalizedPhone}`

    const message = `Hi ${data.customerName}! Your order #${data.orderId} has been placed successfully. Total: ₹${data.totalAmount} for ${data.itemCount} item(s). We'll notify you once it's confirmed by the retailer. - LiveMART`

    await twilioClient.messages.create({
      body: message,
      from: phoneNumber,
      to: formattedPhone,
    })

    console.log(`[SMS] Order placed notification sent to ${formattedPhone}`)
    return true
  } catch (error) {
    console.error("[SMS] Failed to send order placed notification:", error)
    return false
  }
}

export async function sendOrderConfirmedSMS(data: ConfirmationSMSData): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !phoneNumber) {
      console.error("[SMS] Twilio credentials not configured")
      return false
    }

    const twilioClient = twilio(accountSid, authToken)
    
    // Normalize and format phone number
    const normalizedPhone = data.customerPhone.replace(/\D/g, "")
    const formattedPhone = normalizedPhone.startsWith("+") ? normalizedPhone : `+91${normalizedPhone}`

    let message = `Hi ${data.customerName}! Great news! Your order #${data.orderId} has been confirmed by the retailer.`
    
    if (data.estimatedDelivery) {
      message += ` Expected delivery: ${data.estimatedDelivery}.`
    }
    
    message += ` Thank you for choosing LiveMART!`

    await twilioClient.messages.create({
      body: message,
      from: phoneNumber,
      to: formattedPhone,
    })

    console.log(`[SMS] Order confirmed notification sent to ${formattedPhone}`)
    return true
  } catch (error) {
    console.error("[SMS] Failed to send order confirmed notification:", error)
    return false
  }
}
