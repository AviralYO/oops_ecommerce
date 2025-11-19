# 🛒 Razorpay Checkout Setup Guide

## Step 1: Create Razorpay Account

1. **Go to Razorpay**: https://dashboard.razorpay.com/signup
2. **Sign up** with your email
3. **Complete KYC** (for live payments, but we'll use test mode first)

## Step 2: Get API Keys

1. Go to **Settings** → **API Keys**
2. Click **Generate Test Keys**
3. You'll get:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxx`

⚠️ **IMPORTANT**: Never share your Key Secret publicly!

## Step 3: Add Keys to Environment

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

## Step 4: Install Razorpay Package

Run this command in your terminal:

```bash
npm install razorpay
```

## Step 5: Test Payment

Use Razorpay test cards:
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

## Features Implemented

✅ **Shopping Cart**
- Add/remove items
- Update quantities
- Real-time total calculation

✅ **Checkout Flow**
1. Review cart items
2. Enter shipping address
3. Click "Pay Now"
4. Razorpay payment popup opens
5. Complete payment
6. Order created in database
7. Redirect to order confirmation

✅ **Order Management**
- Orders saved with payment details
- Order status tracking
- Order history for customers

✅ **GST Calculation**
- 18% GST added automatically
- Shown separately in bill

✅ **Payment Security**
- Server-side verification
- Signature validation
- Secure payment flow

## How to Use

### For Testing:

1. Sign up as **Customer**
2. Browse products
3. Add items to cart
4. Click cart icon
5. Click "Proceed to Checkout"
6. Fill shipping address
7. Click "Pay ₹XXX"
8. Use test card details above
9. Complete payment
10. See order confirmation

### For Production:

1. Complete Razorpay KYC
2. Generate **Live API Keys**
3. Replace test keys in `.env.local`
4. Update NEXT_PUBLIC_RAZORPAY_KEY_ID with live key
5. Test thoroughly before launch

## API Endpoints Created

- `POST /api/orders/create` - Create Razorpay order
- `POST /api/orders/verify` - Verify payment signature
- `GET /api/orders` - Get customer orders

## Security Notes

✅ Server-side signature verification
✅ Amount verification before order creation
✅ Secure environment variables
✅ No sensitive data in frontend
✅ Payment data encrypted by Razorpay

## Need Help?

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: support@razorpay.com

---

**Everything is ready! Just add your API keys and test the checkout flow!** 🎉
