# 🧪 Feature Testing Guide

## ⚠️ CRITICAL FIRST STEP: Database Migration

**YOU MUST RUN THIS SQL IN SUPABASE FIRST!**

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `review-notification-schema.sql` 
3. Paste and run it
4. Verify success: Run `SELECT * FROM product_reviews LIMIT 1;`

**Without this, reviews, notifications, and offline orders will NOT work!**

---

## 📍 Where to Find Each Feature

### 1. ✅ Distance-Based Filtering (Module 3)
**Location**: `/search` page (http://localhost:3000/search)

**What to see**:
- "Your Pincode" input field
- "Maximum Distance (km)" slider (1-100 km)
- Products filtered by distance from your pincode

**How to test**:
1. Navigate to http://localhost:3000/search
2. Enter your pincode (e.g., `110001`)
3. Adjust the distance slider
4. Products beyond the distance will disappear

---

### 2. ✅ Product Reviews System (Module 5)
**Location**: `/product/[id]/reviews` page

**What to see**:
- List of existing reviews with ratings
- Form to submit new review (rating 1-5 stars + text)
- Product's average rating updates automatically

**How to test**:
1. Go to customer dashboard: http://localhost:3000/customer
2. Click on any product
3. Then navigate to http://localhost:3000/product/{PRODUCT_ID}/reviews
4. Submit a review with rating and text
5. Refresh - you should see your review appear

**API Endpoints**:
- `GET /api/reviews?product_id={id}` - Fetch reviews
- `POST /api/reviews` - Submit review

---

### 3. ✅ Notification System (Module 5)
**Location**: Automatic (triggers on order status changes)

**What to see**:
- When order status changes → notification sent
- Email and SMS notifications (currently console logs - need Twilio/SendGrid setup)
- Notification preferences per user
- All notifications logged in database

**How to test**:
1. Place an order as customer
2. Login as retailer who owns the product
3. Go to http://localhost:3000/retailer/orders
4. Update order status (e.g., Pending → Confirmed → Shipped)
5. Check terminal logs - you'll see notification attempts
6. Check Supabase `notification_logs` table for entries

**API Endpoints**:
- `POST /api/notifications` - Send notification
- `GET /api/notifications` - Get user preferences
- `PATCH /api/notifications` - Update preferences

---

### 4. ✅ Offline Orders with Calendar Integration (Module 4)
**Location**: `/api/offline-orders` (API-only, no UI page yet)

**What it does**:
- Schedule product pickup appointments
- Google Calendar event ID stored (placeholder - needs Google Calendar API setup)
- Sends notification reminder to customer

**How to test** (using API):
```bash
# Create offline order
curl -X POST http://localhost:3000/api/offline-orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "your-customer-uuid",
    "retailer_id": "retailer-uuid",
    "product_id": "product-uuid",
    "quantity": 2,
    "total_amount": 299.99,
    "pickup_datetime": "2025-11-25T14:00:00Z",
    "customer_notes": "Please have it ready by 2 PM"
  }'
```

**API Endpoints**:
- `GET /api/offline-orders?type=customer` - Get customer's scheduled pickups
- `GET /api/offline-orders?type=retailer` - Get retailer's scheduled pickups
- `POST /api/offline-orders` - Create new pickup appointment
- `PATCH /api/offline-orders` - Update pickup status

---

### 5. ✅ Automatic Stock Reduction (Module 2)
**Location**: Already working in `/api/orders/place`

**What it does**:
- When order placed → product quantity automatically reduced
- If quantity becomes 0 → status changes to "out-of-stock"
- Already implemented, no extra testing needed

---

## 🔍 Common Issues & Solutions

### Issue: "Reviews not showing"
**Solution**: Run the database migration SQL first!

### Issue: "Distance filter not working"
**Solution**: Make sure:
1. You're on `/search` page (not `/customer` page)
2. Your user profile has a pincode set
3. Products have retailer pincode populated

### Issue: "Notifications not sending"
**Solution**: Notifications are logged but emails/SMS won't actually send without:
- Twilio API keys for SMS
- SendGrid/Resend API keys for email
- Check terminal logs to see notification attempts

### Issue: "Order status history 500 error"
**Solution**: Fixed! The bug was `user.id` instead of `userId`. Restart server.

---

## 📊 Database Tables to Check

After running migration, verify these tables exist:

```sql
-- Check reviews
SELECT * FROM product_reviews LIMIT 5;

-- Check notifications
SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 10;

-- Check offline orders
SELECT * FROM offline_orders ORDER BY created_at DESC LIMIT 5;

-- Check notification preferences
SELECT * FROM notification_preferences LIMIT 5;
```

---

## ✅ Quick Testing Checklist

- [ ] Run `review-notification-schema.sql` in Supabase
- [ ] Verify tables created
- [ ] Test distance filter at http://localhost:3000/search
- [ ] Submit a product review at /product/{id}/reviews
- [ ] Update an order status (as retailer) and check notification logs
- [ ] Use API to create offline order (optional)
- [ ] Verify stock reduces when placing orders

---

## 🚀 Next Steps for Production

1. **Google Calendar API**: Add real calendar event creation
2. **Email Service**: Set up SendGrid/Resend for email notifications
3. **SMS Service**: Set up Twilio for SMS notifications
4. **UI for Offline Orders**: Create customer-facing page to schedule pickups
5. **Distance Calculation**: Replace pincode difference with real geocoding API

