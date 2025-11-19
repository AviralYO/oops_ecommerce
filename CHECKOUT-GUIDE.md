# 🎉 Razorpay Checkout - Quick Start Guide

## ✅ What's Been Done

I've implemented a complete Razorpay payment integration with:

1. **Full Checkout Flow**
   - Cart fetching from database
   - Shipping address form
   - GST calculation (18%)
   - Order summary with itemized list
   - Razorpay payment popup
   - Payment verification
   - Order confirmation page

2. **API Endpoints Created**
   - `POST /api/orders/create` - Creates Razorpay order
   - `POST /api/orders/verify` - Verifies payment & saves to database
   - `GET /api/orders` - Fetches customer orders
   - `GET/POST/DELETE /api/cart` - Cart management

3. **Security Features**
   - Server-side signature verification
   - Authenticated Supabase clients
   - Amount verification
   - Encrypted payment data (by Razorpay)

## 🚀 What You Need to Do

### Step 1: Create Razorpay Account (2 minutes)

1. Go to: https://dashboard.razorpay.com/signup
2. Sign up with your email
3. You'll get instant test access (no KYC needed for testing)

### Step 2: Get Your API Keys (30 seconds)

1. In Razorpay dashboard, go to: **Settings** → **API Keys**
2. Click **Generate Test Keys**
3. You'll see:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxx`

### Step 3: Add Keys to Your Project (30 seconds)

Open `.env.local` and replace these lines:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
```

With your actual keys from Step 2.

### Step 4: Restart Your Server

Stop the server (Ctrl+C) and run:
```bash
npm run dev
```

## 🧪 Test the Payment Flow

### Test Cards (Use these for testing):

**Card Number**: `4111 1111 1111 1111`  
**CVV**: Any 3 digits (e.g., `123`)  
**Expiry**: Any future date (e.g., `12/25`)  
**Name**: Any name

### Testing Steps:

1. **Login as Customer**
2. **Add products to cart** from the product grid
3. **Click the cart icon** in header
4. **Click "Proceed to Checkout"** (or go to `/checkout`)
5. **Fill shipping details**:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Address: 123 Test Street, Mumbai, India
6. **Click "Pay ₹XXX"**
7. **Razorpay popup opens**
8. **Enter test card details** (from above)
9. **Complete payment**
10. **You'll be redirected** to order confirmation page

## 📋 Payment Flow Diagram

```
Customer → Checkout Page → Fill Shipping Info
    ↓
Click "Pay Now" → Create Razorpay Order (API)
    ↓
Razorpay Popup Opens → Enter Card Details
    ↓
Payment Successful → Verify Signature (API)
    ↓
Save Order to Database → Clear Cart
    ↓
Order Confirmation Page → Show Order Details
```

## 🎯 What Happens Behind the Scenes

1. **Customer clicks "Pay"**
   - Frontend calls `/api/orders/create`
   - Server creates Razorpay order with amount
   - Returns order ID

2. **Razorpay popup opens**
   - Customer enters card details
   - Razorpay processes payment
   - Returns payment ID and signature

3. **Payment verification**
   - Frontend calls `/api/orders/verify` with payment details
   - Server verifies signature using crypto
   - Creates order in database
   - Creates order items
   - Clears cart
   - Returns order ID

4. **Order confirmation**
   - Redirect to `/customer/orders/[orderId]`
   - Shows order details, shipping address, items

## 🔐 Security Notes

✅ **What's Secure:**
- Signature verification prevents payment tampering
- Server-side secret key (never exposed to browser)
- Authenticated API calls with RLS policies
- Amount verification before order creation
- Payment data encrypted by Razorpay

⚠️ **Never Share:**
- Your `RAZORPAY_KEY_SECRET`
- Don't commit `.env.local` to Git

## 📱 Features Included

✅ Cart persistence in database  
✅ Real-time stock checking  
✅ GST calculation (18%)  
✅ Multiple payment methods (Card, UPI, Netbanking, Wallets)  
✅ Order history  
✅ Order confirmation page  
✅ Shipping address capture  
✅ Order tracking (order ID + payment ID)  

## 🐛 Troubleshooting

### "Razorpay is not defined"
- Make sure you've added API keys to `.env.local`
- Restart the server

### "Payment signature verification failed"
- Check that `RAZORPAY_KEY_SECRET` is correct
- Make sure you're using matching test/live keys

### "Cart is empty"
- Make sure you've added products as a customer first
- Check cart API is working: `/api/cart`

### "Order not found" after payment
- Check console for errors
- Verify `/api/orders/verify` is working
- Check database for orders table

## 🎊 You're All Set!

Once you add your Razorpay keys, the entire checkout flow will work:

1. ✅ Add to cart
2. ✅ Checkout
3. ✅ Pay with Razorpay
4. ✅ Order saved to database
5. ✅ Cart cleared
6. ✅ Order confirmation

---

**Need help?** Check the detailed guide in `RAZORPAY-SETUP.md`

**Razorpay Docs:** https://razorpay.com/docs/payments/
