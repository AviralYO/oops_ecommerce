# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

When deploying to production (Vercel, Netlify, etc.), you **MUST** set these environment variables:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com  # <- CRITICAL FOR AUTH REDIRECTS
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_or_test_key
RAZORPAY_KEY_SECRET=your_secret_key

# DO NOT SET IN PRODUCTION
# NODE_TLS_REJECT_UNAUTHORIZED=0  # Only for development
```

### 2. Supabase Configuration

Update your Supabase project settings:

1. Go to **Authentication** → **URL Configuration**
2. Add your production URL to **Site URL**: `https://your-domain.com`
3. Add to **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/**` (for wildcard support)

### 3. Google OAuth Setup

Update Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `https://your-project.supabase.co/auth/v1/callback`
5. Add to **Authorized JavaScript origins**:
   - `https://your-domain.com`

### 4. Vercel Deployment Steps

1. **Push to GitHub** (already done)

2. **Import to Vercel**:
   ```bash
   # Or use Vercel dashboard
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - **IMPORTANT**: Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### 5. Post-Deployment

1. Test authentication flow
2. Verify cart operations work
3. Test checkout with Razorpay
4. Check all three user roles (customer, retailer, wholesaler)
5. Test dark mode toggle
6. Verify search functionality
7. Check order history and settings pages

## Common Issues

### Authentication Redirects to Localhost

**Problem**: After OAuth, users are redirected to `localhost` instead of your production URL.

**Solution**:
- Ensure `NEXT_PUBLIC_SITE_URL` is set in production environment variables
- Update Supabase redirect URLs to include your production domain
- Clear browser cache and test again

### Cart/Orders Not Working

**Problem**: 401 or 403 errors when accessing cart or orders.

**Solution**:
- Verify Supabase RLS policies are correct
- Check that authentication cookies are being set properly
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Images Not Loading

**Problem**: Product images return 404 or don't display.

**Solution**:
- Check Supabase Storage bucket policies
- Verify image URLs in database are correct
- Ensure storage bucket is public or has proper RLS policies

## Database Migrations

If you need to reset or update the database:

```sql
-- Run this in Supabase SQL Editor
-- (Located in supabase-schema.sql)
```

## Monitoring

After deployment, monitor:
- Vercel Analytics Dashboard
- Supabase Dashboard (API usage, auth events)
- Browser Console for any errors
- Network tab for failed requests

## Rollback

If something goes wrong:

```bash
# Revert to previous deployment
vercel rollback
```

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
