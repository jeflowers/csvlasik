# Supabase Storage Buckets Guide

## Overview

This project uses Supabase Storage for managing all media files, providing secure, scalable, and performant file storage with automatic CDN distribution.

## Available Buckets

### 1. **media** (Public)
- **Purpose**: General website media and article images
- **Access**: Public read, authenticated admin/editor write
- **File Types**: JPEG, PNG, WebP, GIF, SVG
- **Max Size**: 10 MB
- **Directory Structure**:
  ```
  media/
  ├── articles/          # Article featured images
  ├── blog/              # Blog post images
  ├── general/           # General website images
  ├── educational/       # Educational content
  └── innovation/        # Innovation-related images
  ```

### 2. **testimonials** (Public)
- **Purpose**: Patient testimonial photos and videos
- **Access**: Public read, authenticated admin/editor write
- **File Types**:
  - Images: JPEG, PNG, WebP
  - Videos: MP4, MOV
- **Max Size**:
  - Images: 10 MB
  - Videos: 100 MB
- **Directory Structure**:
  ```
  testimonials/
  ├── images/
  │   └── {testimonialId}/    # Organized by testimonial
  └── videos/
      └── {testimonialId}/    # Organized by testimonial
  ```

### 3. **procedures** (Public)
- **Purpose**: Procedure-related educational media
- **Access**: Public read, authenticated admin/editor write
- **File Types**: JPEG, PNG, WebP, SVG
- **Max Size**: 10 MB
- **Directory Structure**:
  ```
  procedures/
  ├── lasik/             # LASIK procedure images
  ├── prk/               # PRK procedure images
  ├── icl/               # ICL procedure images
  └── educational/       # General educational diagrams
  ```

### 4. **team** (Public)
- **Purpose**: Team member photos and staff images
- **Access**: Public read, authenticated admin write only
- **File Types**: JPEG, PNG, WebP
- **Max Size**: 10 MB
- **Directory Structure**:
  ```
  team/
  ├── doctors/           # Doctor headshots
  └── staff/             # Staff photos
  ```

### 5. **documents** (Private)
- **Purpose**: Private documents and compliance files
- **Access**: Authenticated users (own files only), admins (all files)
- **File Types**: PDF, DOC, DOCX, TXT, JSON
- **Max Size**: 20 MB
- **Directory Structure**:
  ```
  documents/
  ├── {userId}/
  │   ├── gdpr/          # GDPR export documents
  │   ├── compliance/    # Compliance documents
  │   └── general/       # General user documents
  ```

## Using the Storage Service

### Import the Service

```typescript
import { storageService } from '@/services/storageService';
```

### Basic Operations

#### Upload a File

```typescript
// Generic upload
const result = await storageService.uploadFile({
  bucket: 'media',
  path: 'articles/my-article.jpg',
  file: fileObject
});

console.log(result.publicUrl); // https://...
```

#### Get Public URL

```typescript
const url = storageService.getPublicUrl('media', 'articles/my-article.jpg');
```

#### Delete a File

```typescript
await storageService.deleteFile('media', 'articles/old-image.jpg');
```

#### List Files

```typescript
const files = await storageService.listFiles('media', 'articles');
```

### Specialized Upload Methods

#### Upload Media File (Articles/Blog)

```typescript
const result = await storageService.uploadMediaFile(
  file,
  'articles' // category
);
```

#### Upload Testimonial Image

```typescript
const result = await storageService.uploadTestimonialImage(
  file,
  '123' // testimonialId (optional)
);
```

#### Upload Testimonial Video

```typescript
const result = await storageService.uploadTestimonialVideo(
  file,
  '123' // testimonialId (optional)
);
```

#### Upload Procedure Image

```typescript
const result = await storageService.uploadProcedureImage(
  file,
  'lasik' // procedure type: 'lasik' | 'prk' | 'icl'
);
```

#### Upload Team Photo

```typescript
const result = await storageService.uploadTeamPhoto(
  file,
  'doctors' // category: 'doctors' | 'staff'
);
```

#### Upload Private Document

```typescript
const result = await storageService.uploadDocument(
  file,
  userId,
  'gdpr' // category
);
```

### Image Transformations

Get optimized and resized images:

```typescript
const transformedUrl = storageService.getTransformedImageUrl(
  'media',
  'articles/large-image.jpg',
  {
    width: 800,
    height: 600,
    quality: 80,
    format: 'webp'
  }
);
```

### File Validation

```typescript
// Validate any file
const validation = storageService.validateFile(file, 10); // 10 MB max
if (!validation.valid) {
  console.error(validation.error);
}

// Validate image
const imageValidation = storageService.validateImageFile(file);

// Validate video
const videoValidation = storageService.validateVideoFile(file);
```

### Bulk Operations

```typescript
// Upload multiple files
const results = await storageService.uploadMultipleFiles(
  [file1, file2, file3],
  'media',
  'articles' // path prefix
);

// Delete multiple files
await storageService.deleteMultipleFiles(
  'media',
  ['path/to/file1.jpg', 'path/to/file2.jpg']
);
```

## Component Integration Examples

### MediaLibrary Component

```typescript
import { storageService } from '../../services/storageService';

const handleUpload = async (file: File) => {
  try {
    const result = await storageService.uploadMediaFile(
      file,
      'articles'
    );

    // Save to database
    await apiService.uploadMedia(file, {
      file_path: result.publicUrl,
      category: 'Articles',
      alt_text: '',
      caption: ''
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Testimonials Manager

```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const result = await storageService.uploadTestimonialImage(
    file,
    testimonialId?.toString()
  );

  setFormData(prev => ({
    ...prev,
    image_url: result.publicUrl
  }));
};
```

### Articles Manager

```typescript
const handleFeaturedImageUpload = async (file: File) => {
  const category = formData.category?.toLowerCase() || 'general';
  const result = await storageService.uploadMediaFile(file, category);

  setFormData(prev => ({
    ...prev,
    featured_image: result.publicUrl
  }));
};
```

## Security

### Row Level Security (RLS)

All buckets have RLS policies enabled:

#### Public Buckets (media, testimonials, procedures, team)
- ✅ Anyone can read/download files
- ✅ Only authenticated admin/editor users can upload
- ✅ Only file owners or admins can delete

#### Private Buckets (documents)
- ✅ Only authenticated users can view their own files
- ✅ Admins can access all files
- ✅ Only file owners can delete their files

### Best Practices

1. **Always validate files before upload**
   ```typescript
   const validation = storageService.validateImageFile(file);
   if (!validation.valid) {
     throw new Error(validation.error);
   }
   ```

2. **Use descriptive file names**
   ```typescript
   const fileName = storageService.generateUniqueFileName(file.name);
   // Output: 1698765432-a3b5c7-my-image.jpg
   ```

3. **Organize files in subdirectories**
   ```typescript
   // Good
   const path = `articles/${articleId}/${fileName}`;

   // Bad
   const path = fileName;
   ```

4. **Clean up unused files**
   - Use the `cleanup_orphaned_storage_files()` database function
   - Run periodically to remove files not referenced in the database

5. **Use image transformations for performance**
   ```typescript
   // Don't serve full-size images
   const url = storageService.getTransformedImageUrl(
     'media',
     path,
     { width: 800, quality: 80, format: 'webp' }
   );
   ```

## Database Integration

The storage service integrates with your database through the `media` table:

```sql
-- Example: Store media reference
INSERT INTO media (filename, filepath, mimetype, size, uploaded_by)
VALUES (
  'my-image.jpg',
  'media/articles/1698765432-a3b5c7-my-image.jpg',
  'image/jpeg',
  1024000,
  auth.uid()
);
```

## Maintenance

### Cleanup Orphaned Files

Run this function periodically (e.g., via cron job):

```sql
SELECT cleanup_orphaned_storage_files();
```

This removes files that:
- Are not referenced in the database
- Are older than 30 days

### Monitor Storage Usage

Check storage usage in Supabase Dashboard:
1. Go to Storage section
2. View bucket statistics
3. Monitor file counts and sizes

## Troubleshooting

### Upload Fails

**Issue**: "Upload failed: Bucket not found"
- **Solution**: Ensure migration has been applied: `create_storage_buckets.sql`

**Issue**: "Upload failed: File too large"
- **Solution**: Check file size limits for each bucket

**Issue**: "Upload failed: Invalid file type"
- **Solution**: Verify file MIME type is in the allowed list

### Cannot Access Files

**Issue**: "403 Forbidden" when accessing file
- **Solution**: Check RLS policies and user authentication

**Issue**: File URL returns 404
- **Solution**: Verify the file path is correct and file exists

### Performance Issues

**Issue**: Images loading slowly
- **Solution**: Use image transformations to serve optimized sizes

**Issue**: Storage space running out
- **Solution**: Run cleanup function and review file retention policies

## Migration from Static Files

If migrating from static files in `/public/assets/images/`:

1. **Upload existing files to appropriate buckets**
   ```typescript
   // Example migration script
   const files = await fs.readdir('public/assets/images/procedures');
   for (const file of files) {
     await storageService.uploadProcedureImage(file, 'lasik');
   }
   ```

2. **Update database references**
   ```sql
   UPDATE articles
   SET featured_image = replace(
     featured_image,
     '/assets/images/',
     'https://[supabase-url]/storage/v1/object/public/media/'
   );
   ```

3. **Remove static files**
   - Keep files for backup
   - Remove from repository after confirming migration

## Support

For issues or questions about storage buckets:
1. Check Supabase Storage documentation
2. Review RLS policies in database
3. Check browser console for detailed error messages
4. Contact system administrator
