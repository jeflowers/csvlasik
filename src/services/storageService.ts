import { supabase } from '../lib/supabase';

export type BucketName = 'media' | 'testimonials' | 'procedures' | 'team' | 'documents';

export interface UploadOptions {
  bucket: BucketName;
  path: string;
  file: File;
  cacheControl?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}

class StorageService {
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { bucket, path, file, cacheControl = '3600', upsert = false } = options;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl,
        upsert,
        contentType: file.type,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const publicUrl = this.getPublicUrl(bucket, data.path);

    return {
      path: data.path,
      fullPath: `${bucket}/${data.path}`,
      publicUrl,
    };
  }

  async uploadMultipleFiles(
    files: File[],
    bucket: BucketName,
    pathPrefix: string = ''
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => {
      const fileName = `${Date.now()}-${file.name}`;
      const path = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

      return this.uploadFile({
        bucket,
        path,
        file,
      });
    });

    return Promise.all(uploadPromises);
  }

  getPublicUrl(bucket: BucketName, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async downloadFile(bucket: BucketName, path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  async deleteFile(bucket: BucketName, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async deleteMultipleFiles(bucket: BucketName, paths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      throw new Error(`Bulk delete failed: ${error.message}`);
    }
  }

  async listFiles(bucket: BucketName, path: string = ''): Promise<any[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`List files failed: ${error.message}`);
    }

    return data || [];
  }

  async moveFile(
    bucket: BucketName,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      throw new Error(`Move failed: ${error.message}`);
    }
  }

  async copyFile(
    fromBucket: BucketName,
    fromPath: string,
    toBucket: BucketName,
    toPath: string
  ): Promise<void> {
    const { error } = await supabase.storage
      .from(fromBucket)
      .copy(fromPath, toPath);

    if (error) {
      throw new Error(`Copy failed: ${error.message}`);
    }
  }

  getTransformedImageUrl(
    bucket: BucketName,
    path: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    const { width, height, quality = 80, format = 'webp' } = options;

    let transformParams = `quality=${quality}/format=${format}`;

    if (width) {
      transformParams += `/width=${width}`;
    }

    if (height) {
      transformParams += `/height=${height}`;
    }

    const baseUrl = supabase.storage
      .from(bucket)
      .getPublicUrl(path).data.publicUrl;

    return baseUrl.replace('/object/public/', `/object/public/render/image/${transformParams}/`);
  }

  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${extension}`, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();

    return `${timestamp}-${randomStr}-${nameWithoutExt}.${extension}`;
  }

  validateFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, WebP, and GIF images are allowed',
      };
    }

    return this.validateFile(file, 10);
  }

  validateVideoFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/quicktime'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only MP4 and MOV videos are allowed',
      };
    }

    return this.validateFile(file, 100);
  }

  async uploadMediaFile(file: File, category: string = 'general'): Promise<UploadResult> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateUniqueFileName(file.name);
    const path = `${category}/${fileName}`;

    return this.uploadFile({
      bucket: 'media',
      path,
      file,
    });
  }

  async uploadTestimonialImage(file: File, testimonialId?: string): Promise<UploadResult> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateUniqueFileName(file.name);
    const path = testimonialId
      ? `images/${testimonialId}/${fileName}`
      : `images/${fileName}`;

    return this.uploadFile({
      bucket: 'testimonials',
      path,
      file,
    });
  }

  async uploadTestimonialVideo(file: File, testimonialId?: string): Promise<UploadResult> {
    const validation = this.validateVideoFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateUniqueFileName(file.name);
    const path = testimonialId
      ? `videos/${testimonialId}/${fileName}`
      : `videos/${fileName}`;

    return this.uploadFile({
      bucket: 'testimonials',
      path,
      file,
    });
  }

  async uploadProcedureImage(file: File, procedure: 'lasik' | 'prk' | 'icl'): Promise<UploadResult> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateUniqueFileName(file.name);
    const path = `${procedure}/${fileName}`;

    return this.uploadFile({
      bucket: 'procedures',
      path,
      file,
    });
  }

  async uploadTeamPhoto(file: File, category: 'doctors' | 'staff' = 'doctors'): Promise<UploadResult> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateUniqueFileName(file.name);
    const path = `${category}/${fileName}`;

    return this.uploadFile({
      bucket: 'team',
      path,
      file,
    });
  }

  async uploadDocument(file: File, userId: string, category: string = 'general'): Promise<UploadResult> {
    const validation = this.validateFile(file, 20);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateUniqueFileName(file.name);
    const path = `${userId}/${category}/${fileName}`;

    return this.uploadFile({
      bucket: 'documents',
      path,
      file,
    });
  }
}

export const storageService = new StorageService();
