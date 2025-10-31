# Storage Buckets - Quick Start Guide

## What Was Created

Your project now has **5 Supabase Storage buckets** set up and ready to use:

1. **media** - Website images, articles, blog posts
2. **testimonials** - Patient testimonial photos and videos
3. **procedures** - Procedure diagrams and educational images
4. **team** - Doctor and staff photos
5. **documents** - Private user documents and GDPR exports

## Quick Usage Examples

### In Admin Components

#### Upload an Article Featured Image

```typescript
import { storageService } from '@/services/storageService';

const handleUpload = async (file: File) => {
  const result = await storageService.uploadMediaFile(file, 'articles');
  console.log(result.publicUrl); // Use this URL in your database
};
```

#### Upload a Testimonial Image

```typescript
const result = await storageService.uploadTestimonialImage(file, testimonialId);
setImageUrl(result.publicUrl);
```

#### Upload a Procedure Image

```typescript
const result = await storageService.uploadProcedureImage(file, 'lasik');
```

## Component Updates

The following components have been updated to use Supabase Storage:

### ✅ MediaLibrary
- Now uploads files to the `media` bucket
- Files are organized by category
- Integrates with existing media database table

### ✅ TestimonialsManager
- Image uploads go to `testimonials/images/` bucket
- Video uploads go to `testimonials/videos/` bucket
- Supports both file uploads and YouTube/Vimeo links

### ✅ ArticlesManager
- Featured images upload to `media/{category}/` bucket
- Automatic file validation and unique naming
- Preview images after upload

## File Size Limits

- **Images**: 10 MB max
- **Videos**: 100 MB max
- **Documents**: 20 MB max

## Security

All buckets use Row Level Security (RLS):
- Public buckets: Anyone can read, only admins/editors can write
- Private buckets: Users can only access their own files

## Getting Public URLs

```typescript
// Simple method
const url = storageService.getPublicUrl('media', 'path/to/file.jpg');

// With transformations (resize, optimize)
const url = storageService.getTransformedImageUrl(
  'media',
  'path/to/file.jpg',
  { width: 800, quality: 80, format: 'webp' }
);
```

## Common Operations

### Upload
```typescript
await storageService.uploadFile({
  bucket: 'media',
  path: 'articles/my-image.jpg',
  file: fileObject
});
```

### Delete
```typescript
await storageService.deleteFile('media', 'articles/old-image.jpg');
```

### List Files
```typescript
const files = await storageService.listFiles('media', 'articles');
```

## Migration Applied

The database migration `create_storage_buckets.sql` has been applied, which:
- Created all 5 storage buckets
- Set up RLS policies for security
- Added helper functions for file management

## Next Steps

1. **Test uploads** in each admin component
2. **Migrate existing static images** if needed
3. **Set up periodic cleanup** for orphaned files
4. **Monitor storage usage** in Supabase Dashboard

## Need Help?

See the complete guide: `docs/storage/STORAGE_BUCKETS_GUIDE.md`
