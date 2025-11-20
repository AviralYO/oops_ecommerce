# Supabase Storage Setup Guide

## Setting up Product Images Storage

To enable product image uploads and display, you need to configure Supabase Storage:

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter bucket name: `product-images`
5. **Important**: Set bucket as **Public** (toggle the public option)
6. Click **Create Bucket**

### 2. Configure Bucket Policies

After creating the bucket, set up the following policies:

#### Allow Authenticated Users to Upload
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Allow Authenticated Users to Delete Their Own Files
```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Allow Public Read Access
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

### 3. Enable Public Access

Alternatively, you can enable public access through the UI:

1. Click on the `product-images` bucket
2. Go to **Configuration**
3. Toggle **Public bucket** to ON
4. Save changes

### 4. Test Upload

After configuration, test by:
1. Login as a retailer
2. Go to "Add Product" tab
3. Upload an image
4. Check console logs for the uploaded URL
5. Verify the image displays in the customer view

### Troubleshooting

**Images not loading?**
- Check if bucket is set to **Public**
- Verify the URL format: `https://<project-ref>.supabase.co/storage/v1/object/public/product-images/<user-id>/<filename>`
- Check browser console for CORS errors
- Ensure Storage policies are correctly set

**Upload fails?**
- Check authentication is working
- Verify user has permission to upload
- Check file size (max 5MB)
- Check file type (only JPEG, PNG, WebP allowed)

### URL Format

Public URLs should look like:
```
https://your-project.supabase.co/storage/v1/object/public/product-images/user-id/timestamp-random.jpg
```

If you see authentication errors, the bucket might not be public or policies are incorrect.
