# Image Upload Setup Guide (Supabase Storage)

## Problem
Images uploaded by retailers aren't showing on products.

## Solution: Configure Supabase Storage

### Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** (left sidebar)
3. Click **"Create a new bucket"**
4. Bucket details:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Check this box** (IMPORTANT!)
   - **File size limit**: 50 MB (or as needed)
   - **Allowed MIME types**: Leave empty (or add: `image/jpeg,image/jpg,image/png,image/webp`)
5. Click **"Create bucket"**

### Step 2: Set Bucket Policies (Make it Public)

If you didn't check "Public bucket", you need to set policies:

1. Click on the `product-images` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Add this policy for **SELECT (read)**:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );
```

6. Click **"Review"** → **"Save policy"**

7. Add policy for **INSERT (upload)** - Authenticated users only:

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );
```

8. Add policy for **DELETE** - Users can delete their own files:

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1] );
```

### Step 3: Verify Configuration

1. Go back to **Storage** → **product-images** bucket
2. Check that **"Public"** badge is visible
3. Try uploading a test image from the UI
4. Copy the public URL and test in browser

### Step 4: Test Image Upload in App

1. Login as **Retailer**
2. Go to **Dashboard** → **Add New Product**
3. Fill in product details
4. Click **"Choose File"** and select an image
5. Click **"Upload Image"**
6. You should see: ✅ "Image uploaded successfully"
7. The image URL should be saved
8. Submit the product form
9. Check if image appears in product grid

### Common Issues & Fixes

#### Issue 1: "Bucket not found"
**Fix**: Make sure bucket name is exactly `product-images` (no spaces, lowercase)

#### Issue 2: "Access denied" or "Unauthorized"
**Fix**: 
- Check bucket is marked as **Public**
- Add the SELECT policy shown above

#### Issue 3: Images not displaying (broken image icon)
**Fix**:
- Check the image URL in database (should start with your Supabase URL)
- Example: `https://your-project.supabase.co/storage/v1/object/public/product-images/...`
- Make sure the URL is saved in the `image_url` field in products table

#### Issue 4: CORS errors in browser console
**Fix**: Supabase storage should handle CORS automatically, but if issues persist:
1. Go to Storage settings
2. Add your domain to allowed origins

### Verify Image URLs

Run this SQL in Supabase SQL Editor to check if images are saved:

```sql
SELECT id, name, image_url 
FROM products 
WHERE image_url IS NOT NULL 
LIMIT 10;
```

All image URLs should start with:
`https://[your-project-id].supabase.co/storage/v1/object/public/product-images/`

### Alternative: Use External CDN

If Supabase storage isn't working, you can use:
- **Cloudinary** (free tier: 25GB storage)
- **Imgur** (free image hosting)
- **AWS S3** (paid but reliable)

Just update the upload API endpoint to use the chosen service.

---

## Quick Checklist

- [ ] Create `product-images` bucket in Supabase
- [ ] Enable **Public** access on bucket
- [ ] Add SELECT policy for public read access
- [ ] Add INSERT policy for authenticated uploads
- [ ] Test upload from retailer dashboard
- [ ] Verify image URL is saved in database
- [ ] Check image displays in product grid

