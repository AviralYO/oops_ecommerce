# Payment Gateway Setup Guide (Razorpay)

This guide will walk you through setting up Razorpay payment gateway for your e-commerce platform.

## Prerequisites

- Razorpay account (Sign up at https://razorpay.com)
- Node.js and npm installed
- Environment variables configured

## Step 1: Create Razorpay Account

1. Go to https://razorpay.com and sign up
2. Complete the KYC verification (for live mode)
3. For testing, you can use Test Mode immediately

## Step 2: Get API Keys

1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate Test/Live Keys
4. You'll get:
   - **Key ID** (Public key - safe to expose in frontend)
   - **Key Secret** (Private key - NEVER expose to frontend)

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Razorpay Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_secret_key_here
```

⚠️ **Important**: 
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - This is public and used in frontend
- `RAZORPAY_KEY_SECRET` - This is private and ONLY used in backend API routes

## Step 4: Install Dependencies

The project already has `razorpay` package installed:

```bash
npm install razorpay
```

## Step 5: Test the Integration

### Test Card Details (For Test Mode)

Use these test card details provided by Razorpay:

#### Successful Payment
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

#### Failed Payment
- **Card Number**: 4111 1111 1111 1112
- **CVV**: Any 3 digits
- **Expiry**: Any future date

#### UPI Test
- **VPA**: success@razorpay
- **VPA (failed)**: failure@razorpay

#### Netbanking
Select any bank and use:
- **Username**: razorpay
- **Password**: razorpay

## How the Payment Flow Works

### 1. User adds items to cart
```typescript
// Frontend: components/customer/product-grid.tsx
const addToCart = async (product) => {
  await fetch("/api/cart", {
    method: "POST",
    body: JSON.stringify({ product_id: product.id, quantity: 1 })
  })
}
```

### 2. User proceeds to checkout
```typescript
// Frontend: app/customer/page.tsx
const handleCheckout = () => {
  router.push("/checkout")
}
```

### 3. Checkout page displays order summary
```typescript
// app/checkout/page.tsx
// User enters shipping details
// Displays cart items and total amount with GST
```

### 4. User clicks "Pay" button
```typescript
// Creates Razorpay order
const orderResponse = await fetch("/api/orders/create", {
  method: "POST",
  body: JSON.stringify({
    amount: totalAmount,
    currency: "INR"
  })
})
```

### 5. Backend creates Razorpay order
```typescript
// app/api/orders/create/route.ts
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const order = await razorpay.orders.create({
  amount: amount * 100, // Amount in paise
  currency: "INR"
})
```

### 6. Razorpay payment modal opens
```typescript
// Frontend: app/checkout/page.tsx
const razorpay = new window.Razorpay({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: orderData.amount,
  order_id: orderData.orderId,
  handler: async function(response) {
    // Payment successful
    await verifyPayment(response)
  }
})
razorpay.open()
```

### 7. User completes payment
- Razorpay handles the payment securely
- Returns payment details to your callback

### 8. Backend verifies payment signature
```typescript
// app/api/orders/verify/route.ts
const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest("hex")

if (generatedSignature === razorpay_signature) {
  // Payment verified - Create order in database
}
```

### 9. Order created in database
```typescript
// Creates order record
// Creates order items
// Clears cart
// Redirects to order confirmation page
```

## API Endpoints

### 1. Create Razorpay Order
**POST** `/api/orders/create`

Request:
```json
{
  "amount": 1000,
  "currency": "INR"
}
```

Response:
```json
{
  "orderId": "order_xyz123",
  "amount": 100000,
  "currency": "INR"
}
```

### 2. Verify Payment
**POST** `/api/orders/verify`

Request:
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_string",
  "orderDetails": {
    "total_amount": 1000,
    "shipping_address": "{...}",
    "items": [...]
  }
}
```

Response:
```json
{
  "success": true,
  "orderId": "uuid",
  "message": "Payment verified and order created successfully"
}
```

### 3. Fetch User Orders
**GET** `/api/orders`

Response:
```json
{
  "orders": [
    {
      "id": "uuid",
      "total_amount": 1000,
      "status": "confirmed",
      "payment_status": "completed",
      "order_items": [...]
    }
  ]
}
```

## Security Best Practices

1. ✅ **Never expose Key Secret** - Only use in backend
2. ✅ **Always verify payment signature** - Prevent tampering
3. ✅ **Validate amounts on backend** - Don't trust frontend
4. ✅ **Use HTTPS** - Encrypt data in transit
5. ✅ **Implement rate limiting** - Prevent abuse
6. ✅ **Log all transactions** - For debugging and auditing
7. ✅ **Handle webhooks** - For payment status updates

## Webhooks (Optional but Recommended)

Webhooks notify your server about payment status changes:

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`, etc.
4. Create webhook handler:

```typescript
// app/api/webhooks/razorpay/route.ts
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-razorpay-signature")
  const body = await request.text()
  
  // Verify webhook signature
  const isValid = validateWebhookSignature(body, signature, webhookSecret)
  
  if (isValid) {
    const event = JSON.parse(body)
    // Handle payment.captured, payment.failed, etc.
  }
}
```

## Testing Checklist

- [ ] Test successful payment flow
- [ ] Test failed payment
- [ ] Test payment cancellation
- [ ] Verify order is created in database
- [ ] Verify cart is cleared after payment
- [ ] Test order confirmation page
- [ ] Verify email notifications (if implemented)
- [ ] Test with different payment methods (Card, UPI, Netbanking)

## Going Live

1. Complete KYC verification in Razorpay Dashboard
2. Switch to Live API keys in `.env.local`
3. Test with small real transactions
4. Enable required payment methods
5. Set up webhooks for production
6. Monitor transactions in Razorpay Dashboard

## Troubleshooting

### Payment Modal Not Opening
- Check if Razorpay script is loaded: `window.Razorpay`
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- Check browser console for errors

### Payment Verification Failed
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check signature generation logic
- Ensure order_id and payment_id are correct

### Network Errors
- Check Supabase connection
- Verify API routes are accessible
- Check CORS settings

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Support: support@razorpay.com

## Summary

Your payment flow is now complete:
1. ✅ Cart management with database
2. ✅ Checkout page with shipping form
3. ✅ Razorpay order creation
4. ✅ Payment modal integration
5. ✅ Payment verification
6. ✅ Order creation in database
7. ✅ Order confirmation page

Just add your Razorpay API keys to `.env.local` and start testing!
