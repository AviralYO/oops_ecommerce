# TEST CHECKLIST - Before Submission

## 🗄️ STEP 1: Run Database Migration (REQUIRED)

**Local Supabase:**
1. Open local Supabase at http://localhost:54323 (or your Supabase URL)
2. Go to SQL Editor
3. Run this command:
```sql
\i review-notification-schema.sql
```
OR copy-paste the entire contents of `review-notification-schema.sql`

**Verify Tables Created:**
```sql
SELECT * FROM product_reviews LIMIT 1;
SELECT * FROM notification_preferences LIMIT 1;
SELECT * FROM notification_logs LIMIT 1;
SELECT * FROM offline_orders LIMIT 1;
```

---

## 🧪 STEP 2: Test Reviews System

**Test Flow:**
1. Open http://localhost:3000
2. Login as customer
3. Go to any product page
4. Scroll to "Write a Review" section
5. Select rating (1-5 stars)
6. Write review text
7. Click "Submit Review"
8. ✅ Review should appear in the list below

**API Test:**
```bash
# Get reviews for product
curl http://localhost:3000/api/reviews?product_id=YOUR_PRODUCT_ID

# Post a review (with auth cookie)
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "product-uuid",
    "rating": 5,
    "review_text": "Great product!",
    "order_id": "order-uuid"
  }'
```

---

## 📍 STEP 3: Test Distance Filtering

**Test Flow:**
1. Go to http://localhost:3000/search
2. Find "Your Pincode" input field
3. Enter a pincode (e.g., "110001")
4. Use "Max Distance" slider (default 50km)
5. ✅ Products should filter based on distance

**What to Check:**
- Products from same/nearby pincodes appear first
- Distant products disappear when slider reduced
- Works with different pincode formats

---

## 🔔 STEP 4: Test Notifications API

**API Test:**
```bash
# Get user notification preferences
curl http://localhost:3000/api/notifications

# Update preferences
curl -X PATCH http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "email_notifications": true,
    "sms_notifications": false,
    "order_updates": true
  }'

# Send notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "notification_type": "email",
    "message_type": "order_shipped",
    "recipient": "test@example.com",
    "message_content": "Your order #12345 has been shipped!"
  }'
```

**What to Check:**
- Console logs show notification sending
- notification_logs table has entries
- Status is "sent" or "failed"

---

## 📅 STEP 5: Test Offline Orders

**API Test:**
```bash
# Create offline order
curl -X POST http://localhost:3000/api/offline-orders \
  -H "Content-Type: application/json" \
  -d '{
    "retailer_id": "retailer-uuid",
    "product_id": "product-uuid",
    "quantity": 2,
    "total_amount": 1500,
    "pickup_datetime": "2025-11-25T15:00:00Z",
    "customer_notes": "Will arrive at 3 PM"
  }'

# Get customer's offline orders
curl http://localhost:3000/api/offline-orders?type=customer

# Update order status
curl -X PATCH http://localhost:3000/api/offline-orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-uuid",
    "status": "ready"
  }'
```

**What to Check:**
- Order created in offline_orders table
- google_calendar_event_id is set
- Notification sent to customer

---

## ✅ STEP 6: Verify Stock Reduction

**Test Flow:**
1. Login as customer
2. Add products to cart
3. Go to checkout
4. Complete payment (dummy)
5. ✅ Check Supabase: product.stock_quantity should decrease

**SQL Verification:**
```sql
-- Before order: check current stock
SELECT id, name, stock_quantity FROM products WHERE id = 'product-uuid';

-- After order: stock should be reduced
SELECT id, name, stock_quantity FROM products WHERE id = 'product-uuid';
```

---

## 🎯 PRE-DEPLOYMENT CHECKLIST

- [ ] Local database migration successful
- [ ] Reviews showing on product pages
- [ ] Distance filter working in search
- [ ] Notifications API responding (200 OK)
- [ ] Offline orders API responding (200 OK)
- [ ] Stock reduces when customer orders
- [ ] No console errors in browser
- [ ] Server starts without errors
- [ ] All API endpoints tested

---

## 🚀 WHEN EVERYTHING WORKS LOCALLY

Run these commands:
```bash
git add .
git commit -m "feat: Add reviews, notifications, distance filters, and offline orders - Module completion"
git push origin main
```

Then run the same SQL migration on **Production Supabase**!

---

## ❌ TROUBLESHOOTING

**Issue: "Table does not exist" errors**
- Solution: Run `review-notification-schema.sql` in Supabase

**Issue: "Cannot find module" errors**
- Solution: Check imports, restart dev server

**Issue: "Unauthorized" on API calls**
- Solution: Login first, cookies must be set

**Issue: Reviews not showing**
- Solution: Check product_reviews table has data
- Check API returns reviews: `/api/reviews?product_id=X`

**Issue: Distance filter not working**
- Solution: Check retailer has pincode set in profile
- Check products have retailer relation loaded
