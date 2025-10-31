# Storage Buckets - Code Examples

## Table of Contents
1. [Basic Uploads](#basic-uploads)
2. [Component Examples](#component-examples)
3. [Advanced Usage](#advanced-usage)
4. [Error Handling](#error-handling)
5. [Database Integration](#database-integration)

## Basic Uploads

### Upload a Media File

```typescript
import { storageService } from '@/services/storageService';

// Simple upload
async function uploadImage(file: File) {
  const result = await storageService.uploadMediaFile(file, 'articles');

  console.log('Public URL:', result.publicUrl);
  console.log('Storage Path:', result.path);
  console.log('Full Path:', result.fullPath);
}
```

### Upload with Validation

```typescript
async function uploadWithValidation(file: File) {
  // Validate before uploading
  const validation = storageService.validateImageFile(file);

  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  try {
    const result = await storageService.uploadMediaFile(file, 'blog');
    return result.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### Upload Multiple Files

```typescript
async function uploadMultipleImages(files: File[]) {
  const results = await storageService.uploadMultipleFiles(
    files,
    'media',
    'articles'
  );

  results.forEach((result, index) => {
    console.log(`File ${index + 1}: ${result.publicUrl}`);
  });

  return results;
}
```

## Component Examples

### React Component with Upload

```typescript
import React, { useState } from 'react';
import { storageService } from '@/services/storageService';

export const ImageUploader: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = storageService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await storageService.uploadMediaFile(file, 'general');
      setImageUrl(result.publicUrl);
      alert('Upload successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full"
      />

      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Uploaded" className="max-w-md" />
          <p className="text-sm text-gray-600 mt-2">{imageUrl}</p>
        </div>
      )}
    </div>
  );
};
```

### Drag and Drop Upload

```typescript
import React, { useCallback, useState } from 'react';
import { storageService } from '@/services/storageService';

export const DragDropUploader: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file =>
      file.type.startsWith('image/')
    );

    try {
      const results = await storageService.uploadMultipleFiles(
        imageFiles,
        'media',
        'general'
      );

      setFiles(prev => [...prev, ...results.map(r => r.publicUrl)]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed p-8 rounded-lg ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <p>Drag and drop images here</p>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {files.map((url, i) => (
            <img key={i} src={url} alt={`Upload ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Testimonial Upload Form

```typescript
import React, { useState } from 'react';
import { storageService } from '@/services/storageService';
import { apiService } from '@/services/api';

interface TestimonialFormData {
  name: string;
  content: string;
  rating: number;
  image_url?: string;
  video_url?: string;
}

export const TestimonialForm: React.FC = () => {
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: '',
    content: '',
    rating: 5,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await storageService.uploadTestimonialImage(file);
      setFormData(prev => ({ ...prev, image_url: result.publicUrl }));
    } catch (error) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await storageService.uploadTestimonialVideo(file);
      setFormData(prev => ({ ...prev, video_url: result.publicUrl }));
    } catch (error) {
      alert('Video upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiService.createTestimonial(formData);
      alert('Testimonial created successfully!');
      // Reset form
    } catch (error) {
      alert('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            name: e.target.value
          }))}
          required
        />
      </div>

      <div>
        <label>Testimonial</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            content: e.target.value
          }))}
          required
        />
      </div>

      <div>
        <label>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {formData.image_url && (
          <img
            src={formData.image_url}
            alt="Preview"
            className="mt-2 w-32 h-32 object-cover"
          />
        )}
      </div>

      <div>
        <label>Upload Video (Optional)</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          disabled={uploading}
        />
        {formData.video_url && (
          <video
            src={formData.video_url}
            controls
            className="mt-2 w-full max-w-md"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? 'Saving...' : 'Submit Testimonial'}
      </button>
    </form>
  );
};
```

## Advanced Usage

### Image with Transformations

```typescript
// Component that displays optimized images
export const OptimizedImage: React.FC<{
  bucket: 'media' | 'testimonials';
  path: string;
  alt: string;
  width?: number;
  height?: number;
}> = ({ bucket, path, alt, width = 800, height }) => {
  const url = storageService.getTransformedImageUrl(
    bucket,
    path,
    {
      width,
      height,
      quality: 80,
      format: 'webp'
    }
  );

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      width={width}
      height={height}
    />
  );
};

// Usage
<OptimizedImage
  bucket="media"
  path="articles/my-article.jpg"
  alt="Article featured image"
  width={1200}
  height={630}
/>
```

### Progress Tracking

```typescript
import { supabase } from '@/lib/supabase';

async function uploadWithProgress(
  file: File,
  onProgress: (progress: number) => void
) {
  const fileName = storageService.generateUniqueFileName(file.name);
  const path = `articles/${fileName}`;

  // Note: Supabase doesn't have built-in progress tracking
  // This is a workaround using file size
  const chunks = Math.ceil(file.size / (1024 * 1024)); // 1MB chunks

  try {
    const { data, error } = await supabase.storage
      .from('media')
      .upload(path, file);

    if (error) throw error;

    onProgress(100);
    return storageService.getPublicUrl('media', data.path);
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Usage in component
const [progress, setProgress] = useState(0);

const handleUpload = async (file: File) => {
  const url = await uploadWithProgress(file, setProgress);
  console.log('Uploaded:', url);
};
```

### Batch Processing

```typescript
async function batchUploadWithResults(files: File[]) {
  const results = {
    successful: [] as string[],
    failed: [] as { file: string; error: string }[]
  };

  for (const file of files) {
    try {
      const result = await storageService.uploadMediaFile(file, 'blog');
      results.successful.push(result.publicUrl);
    } catch (error) {
      results.failed.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

// Usage
const { successful, failed } = await batchUploadWithResults(selectedFiles);
console.log(`Uploaded ${successful.length}, Failed ${failed.length}`);
```

## Error Handling

### Comprehensive Error Handler

```typescript
import { storageService } from '@/services/storageService';

async function safeUpload(file: File, bucket: string, category: string) {
  try {
    // Validate file
    const validation = storageService.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File must be less than 10MB');
    }

    // Attempt upload
    const result = await storageService.uploadMediaFile(file, category);

    return { success: true, url: result.publicUrl };
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Storage not configured. Contact admin.'
        };
      }

      if (error.message.includes('Unauthorized')) {
        return {
          success: false,
          error: 'You do not have permission to upload files.'
        };
      }

      if (error.message.includes('Invalid file type')) {
        return {
          success: false,
          error: 'Only JPEG, PNG, and WebP images are allowed.'
        };
      }

      return { success: false, error: error.message };
    }

    return { success: false, error: 'Upload failed. Please try again.' };
  }
}
```

### Retry Logic

```typescript
async function uploadWithRetry(
  file: File,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await storageService.uploadMediaFile(file, 'general');
      return result.publicUrl;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Upload failed');
      console.warn(`Upload attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error('Upload failed after multiple attempts');
}
```

## Database Integration

### Complete Upload + Save Flow

```typescript
import { storageService } from '@/services/storageService';
import { supabase } from '@/lib/supabase';

async function uploadAndSaveArticle(
  articleData: {
    title: string;
    content: string;
    category: string;
  },
  featuredImage: File
) {
  try {
    // 1. Upload image to storage
    const imageResult = await storageService.uploadMediaFile(
      featuredImage,
      articleData.category.toLowerCase()
    );

    // 2. Save article to database with image URL
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: articleData.title,
        content: articleData.content,
        category: articleData.category,
        featured_image: imageResult.publicUrl,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Also save to media table for tracking
    await supabase
      .from('media')
      .insert({
        filename: featuredImage.name,
        filepath: imageResult.path,
        mimetype: featuredImage.type,
        size: featuredImage.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      });

    return data;
  } catch (error) {
    console.error('Failed to create article:', error);
    throw error;
  }
}
```

### Update with Image Replacement

```typescript
async function updateArticleImage(
  articleId: number,
  oldImagePath: string | null,
  newImage: File
) {
  try {
    // 1. Upload new image
    const result = await storageService.uploadMediaFile(newImage, 'articles');

    // 2. Update database
    const { error } = await supabase
      .from('articles')
      .update({ featured_image: result.publicUrl })
      .eq('id', articleId);

    if (error) throw error;

    // 3. Delete old image if it exists
    if (oldImagePath) {
      try {
        // Extract path from full URL
        const path = oldImagePath.split('/storage/v1/object/public/media/')[1];
        if (path) {
          await storageService.deleteFile('media', path);
        }
      } catch (deleteError) {
        console.warn('Failed to delete old image:', deleteError);
        // Don't throw - new image is already uploaded
      }
    }

    return result.publicUrl;
  } catch (error) {
    console.error('Failed to update image:', error);
    throw error;
  }
}
```

### Cleanup Orphaned Files

```typescript
async function cleanupUnusedImages() {
  // 1. Get all media files from storage
  const files = await storageService.listFiles('media', 'articles');

  // 2. Get all article image URLs from database
  const { data: articles } = await supabase
    .from('articles')
    .select('featured_image');

  const usedUrls = new Set(
    articles?.map(a => a.featured_image).filter(Boolean) || []
  );

  // 3. Find unused files
  const unusedFiles = files.filter(file => {
    const fullUrl = storageService.getPublicUrl('media', `articles/${file.name}`);
    return !usedUrls.has(fullUrl);
  });

  // 4. Delete unused files (be careful!)
  if (unusedFiles.length > 0) {
    console.log(`Found ${unusedFiles.length} unused files`);

    const paths = unusedFiles.map(f => `articles/${f.name}`);
    await storageService.deleteMultipleFiles('media', paths);

    console.log('Cleanup complete');
  }
}
```

## Testing Examples

### Unit Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { storageService } from '@/services/storageService';

describe('storageService', () => {
  it('validates image files correctly', () => {
    const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const validation = storageService.validateImageFile(validFile);
    expect(validation.valid).toBe(true);
  });

  it('rejects files that are too large', () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });
    const validation = storageService.validateImageFile(largeFile);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('10MB');
  });

  it('generates unique filenames', () => {
    const name1 = storageService.generateUniqueFileName('test.jpg');
    const name2 = storageService.generateUniqueFileName('test.jpg');
    expect(name1).not.toBe(name2);
  });
});
```

---

**Need more examples?** Check the component files or the main documentation guide.
