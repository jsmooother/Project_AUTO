# Supabase Storage Bucket Setup

This guide helps you set up the required Supabase Storage buckets for creative generation and logo storage.

## Required Buckets

1. **`creatives`** - Stores generated creative images (feed, story, reel variants)
2. **`logos`** - Stores customer logos discovered from websites

## Setup Steps

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/[your-project-id]
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Create bucket `creatives`:
   - **Name**: `creatives`
   - **Public bucket**: ✅ **Enable** (required for Meta to access images)
   - **File size limit**: 10 MB (or higher)
   - **Allowed MIME types**: `image/png,image/jpeg,image/jpg,image/webp`
5. Create bucket `logos`:
   - **Name**: `logos`
   - **Public bucket**: ✅ **Enable** (for logo preview in UI)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/png,image/jpeg,image/jpg,image/svg+xml,image/webp`

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
# npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Create buckets
supabase storage create creatives --public
supabase storage create logos --public
```

### Option 3: Via SQL (if you have direct DB access)

```sql
-- Note: Storage buckets are managed via Supabase Storage API, not SQL
-- Use Dashboard or CLI instead
```

## Verify Setup

After creating buckets, verify they exist:

1. In Supabase Dashboard → Storage, you should see both `creatives` and `logos` buckets
2. Both should show as **Public** (green indicator)
3. Test upload via your app or API

## Environment Variables

Ensure these are set in your `.env`:

```bash
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**Important**: Use the **Service Role Key** (not the anon key) for worker operations. This key has full access to storage.

## Bucket Structure

### Creatives Bucket
Files are stored as: `{customerId}/{inventoryItemId}/{variant}.png`
- Example: `81be90e1-fbfb-41d0-a7a2-eb4dfa6c9f3c/abc123/feed.png`

### Logos Bucket  
Files are stored as: `{customerId}/logo.{ext}`
- Example: `81be90e1-fbfb-41d0-a7a2-eb4dfa6c9f3c/logo.png`

## Public URL Format

Public URLs are automatically generated as:
```
{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
```

Example:
```
https://rshurngbtyrqvfrsfuwp.supabase.co/storage/v1/object/public/creatives/81be90e1-fbfb-41d0-a7a2-eb4dfa6c9f3c/abc123/feed.png
```

## Troubleshooting

### "STORAGE_NOT_CONFIGURED" error
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Verify buckets exist in Supabase Dashboard
- Ensure buckets are set to **Public**

### "Storage putObject failed" error
- Check Service Role Key has storage permissions
- Verify bucket name matches exactly (`creatives`, `logos`)
- Check file size limits aren't exceeded

### Images not accessible by Meta
- Ensure buckets are **Public** (not private)
- Verify public URL format is correct
- Test URL in browser - should show image directly
