# Location-Based Product Sorting Setup Guide

## Overview
This guide helps you set up pincode-based location sorting so customers see products from nearby retailers first.

## ✅ Code Changes (Already Complete)
All code changes have been implemented:
- ✅ Signup form collects pincode
- ✅ API stores pincode in profiles table
- ✅ Products API sorts by location match
- ✅ Customer page passes pincode to products

## 🔧 Database Setup Required

### Step 1: Execute Database Schema
You **MUST** run this SQL in your Supabase SQL Editor:

```sql
-- Add pincode column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- Create index for faster location queries
CREATE INDEX IF NOT EXISTS idx_profiles_pincode ON profiles(pincode);
```

### Step 2: Verify the Changes
Run this to verify the column was added:

```sql
SELECT id, email, name, role, pincode FROM profiles LIMIT 5;
```

You should see the new `pincode` column.

## 🧪 Testing Location Sorting

### Test Scenario
1. **Create Test Retailer 1**:
   - Sign up as retailer
   - Email: retailer1@test.com
   - Pincode: `110001` (Delhi)
   - Add 2-3 products

2. **Create Test Retailer 2**:
   - Sign up as retailer
   - Email: retailer2@test.com
   - Pincode: `400001` (Mumbai)
   - Add 2-3 products

3. **Create Test Customer**:
   - Sign up as customer
   - Email: customer@test.com
   - Pincode: `110001` (same as Retailer 1)

4. **Verify Sorting**:
   - Login as the customer
   - Products from Retailer 1 (same pincode) should appear first
   - Products from Retailer 2 (different pincode) should appear after

## 📋 How It Works

### Backend Logic (in `/api/products`)
```typescript
// 1. Fetch products with retailer pincode
supabaseAdmin
  .from("products")
  .select(`*, retailer:retailer_id(id, name, pincode)`)

// 2. Sort by pincode match
products.sort((a, b) => {
  const aMatch = a.retailer?.pincode === userPincode ? 0 : 1
  const bMatch = b.retailer?.pincode === userPincode ? 0 : 1
  
  // Products with matching pincode come first
  if (aMatch !== bMatch) return aMatch - bMatch
  
  // Then sort by newest
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
})
```

### User Flow
1. **During Signup**: User enters 6-digit pincode
2. **Stored in Database**: Pincode saved in `profiles.pincode`
3. **Product Browsing**: Customer's pincode sent to `/api/products?pincode=110001`
4. **Smart Sorting**: Products from matching pincode appear first

## 🚨 Known Issues & Future Work

### Issue 1: Google OAuth Users
**Problem**: Google OAuth doesn't collect pincode yet  
**Impact**: OAuth users won't have pincode, no location sorting for them  
**Solution Needed**: Add pincode collection after OAuth flow

### Issue 2: Existing Users
**Problem**: Users created before this feature have `NULL` pincode  
**Impact**: No location sorting for existing users  
**Solution Needed**: Add pincode field to user settings pages

### Issue 3: Landing Page
**Problem**: Unauthenticated users on landing page (`app/page.tsx`) don't get location sorting  
**Status**: Not critical - they don't have pincode anyway  
**Future**: Could ask for pincode before showing products

## 📝 TODO List

- [ ] Execute `location-schema.sql` in Supabase SQL Editor
- [ ] Test location sorting with new signups
- [ ] Add pincode to Google OAuth flow
- [ ] Add pincode field to customer/retailer/wholesaler settings pages
- [ ] Show "Nearby" badge on products from same pincode
- [ ] Add pincode validation (check if valid Indian pincode)
- [ ] Expand to city/state based sorting (not just exact match)

## 🎯 Benefits

### For Customers
- See products from nearby retailers first
- Faster delivery from local sellers
- Better local shopping experience

### For Retailers
- Priority visibility to local customers
- Increased local sales
- Better inventory turnover

### For Platform
- Improved user experience
- Better conversion rates
- Local commerce promotion

## 📊 Database Schema

### Before
```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT
)
```

### After
```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT,
  pincode VARCHAR(10)  -- NEW!
)
```

## 🔍 Debugging Tips

### Products Not Sorting by Location?
1. Check if pincode column exists:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'pincode';
   ```

2. Check if user has pincode:
   ```sql
   SELECT id, email, pincode FROM profiles WHERE email = 'your-email@test.com';
   ```

3. Check browser console for API call:
   ```
   GET /api/products?pincode=110001
   ```

### No Products Showing?
- Check retailer has added products
- Check products are not `out-of-stock`
- Check Network tab for API errors

## 🚀 Next Steps

1. **Execute the database schema** - Most important!
2. **Test with new users** - Sign up with different pincodes
3. **Monitor user feedback** - See if sorting makes sense
4. **Iterate** - Add features like city-wide sorting, "nearby" badges

---

**Last Updated**: January 2025  
**Status**: Code Complete, Database Setup Pending
