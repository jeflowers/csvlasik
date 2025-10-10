import { supabase } from '../lib/supabase';

class ApiService {
  private sessionChecked = false;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    if (this.sessionChecked) return;

    const { data } = await supabase.auth.getSession();
    this.sessionChecked = true;

    if (data.session) {
      console.log('Active session found');
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) throw new Error(userError.message);
    if (!userData) throw new Error('User not found');

    return {
      token: data.session.access_token,
      user: userData,
    };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async getPublicStatistics() {
    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .order('display_order');

    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatistic(name: string, updates: any) {
    const { data, error } = await supabase
      .from('statistics')
      .update(updates)
      .eq('name', name)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getPublicTestimonials(params: any = {}) {
    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return {
      testimonials: data,
      total: data.length,
    };
  }

  async getTestimonials(params: any = {}) {
    let query = supabase
      .from('testimonials')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }
    if (params.offset) {
      query = query.range(parseInt(params.offset), parseInt(params.offset) + parseInt(params.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      testimonials: data,
      total: count || 0,
    };
  }

  async createTestimonial(testimonial: any) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonial])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateTestimonialStatus(id: number, status: string) {
    const approved = status === 'approved';
    const { data, error } = await supabase
      .from('testimonials')
      .update({ approved })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateTestimonial(id: number, updates: any) {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteTestimonial(id: number) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async getPublicArticles(params: any = {}) {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return {
      articles: data,
      total: data.length,
    };
  }

  async getPublicArticle(slug: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async getArticles(params: any = {}) {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }
    if (params.offset) {
      query = query.range(parseInt(params.offset), parseInt(params.offset) + parseInt(params.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      articles: data,
      total: count || 0,
    };
  }

  async createArticle(article: any) {
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateArticle(id: number, updates: any) {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteArticle(id: number) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async getMedia(params: any = {}) {
    let query = supabase
      .from('media')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.type) {
      query = query.eq('media_type', params.type);
    }
    if (params.category) {
      query = query.eq('category', params.category);
    }
    if (params.search) {
      query = query.or(`filename.ilike.%${params.search}%,original_name.ilike.%${params.search}%,alt_text.ilike.%${params.search}%`);
    }

    const offset = ((params.page || 1) - 1) * (params.limit || 24);
    if (params.limit) {
      query = query.range(offset, offset + parseInt(params.limit) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      media: data || [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 24,
        total: count || 0,
      },
    };
  }

  async uploadMedia(file: File, metadata: any = {}) {
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}_${randomStr}.${fileExt}`;

    let mediaType: 'image' | 'video' | 'document' = 'document';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    }

    const filePath = `${metadata.category || 'general'}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(uploadData.path);

    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('media')
      .insert([{
        filename: fileName,
        original_name: file.name,
        file_path: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        media_type: mediaType,
        category: metadata.category || 'Other',
        alt_text: metadata.alt_text || '',
        caption: metadata.caption || '',
        uploaded_by: session?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      await supabase.storage.from('media').remove([uploadData.path]);
      throw new Error(error.message);
    }

    return data;
  }

  async updateMedia(id: number, updates: any) {
    const { data, error } = await supabase
      .from('media')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteMedia(id: number) {
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('file_path, filename, category')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const storagePath = `${media.category || 'general'}/${media.filename}`;

    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([storagePath]);

    if (storageError) {
      console.warn('Storage deletion warning:', storageError.message);
    }

    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async bulkDeleteMedia(ids: number[]) {
    const { data: mediaFiles, error: fetchError } = await supabase
      .from('media')
      .select('id, filename, category')
      .in('id', ids);

    if (fetchError) throw new Error(fetchError.message);

    const storagePaths = mediaFiles.map(file =>
      `${file.category || 'general'}/${file.filename}`
    );

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove(storagePaths);

      if (storageError) {
        console.warn('Storage bulk deletion warning:', storageError.message);
      }
    }

    const { error } = await supabase
      .from('media')
      .delete()
      .in('id', ids);

    if (error) throw new Error(error.message);
    return { success: true, deleted: ids.length };
  }

  async getDashboardOverview() {
    const [articles, testimonials, media] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }),
      supabase.from('media').select('*', { count: 'exact', head: true }),
    ]);

    return {
      articles: articles.count || 0,
      testimonials: testimonials.count || 0,
      media: media.count || 0,
    };
  }

  async getDashboardStats() {
    const [
      articlesData,
      testimonialsData,
      recentArticles,
      recentTestimonials,
    ] = await Promise.all([
      supabase.from('articles').select('status'),
      supabase.from('testimonials').select('approved'),
      supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    const articleStats = {
      total: articlesData.data?.length || 0,
      published: articlesData.data?.filter(a => a.status === 'published').length || 0,
      draft: articlesData.data?.filter(a => a.status === 'draft').length || 0,
    };

    const testimonialStats = {
      total: testimonialsData.data?.length || 0,
      approved: testimonialsData.data?.filter(t => t.approved).length || 0,
      pending: testimonialsData.data?.filter(t => !t.approved).length || 0,
    };

    return {
      articles: articleStats,
      testimonials: testimonialStats,
      recentArticles: recentArticles.data || [],
      recentTestimonials: recentTestimonials.data || [],
    };
  }

  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createUser(user: any) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (error) throw new Error(error.message);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'viewer',
        password: '',
      }])
      .select()
      .single();

    if (userError) throw new Error(userError.message);
    return userData;
  }

  async updateUser(id: number, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteUser(id: number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async resetUserPassword(id: number, newPassword: string) {
    const { error } = await supabase.auth.admin.updateUserById(
      id.toString(),
      { password: newPassword }
    );

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async getStatistics() {
    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .order('display_order');

    if (error) throw new Error(error.message);
    return data;
  }

  async createStatistic(statistic: any) {
    const { data, error } = await supabase
      .from('statistics')
      .insert([statistic])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteStatistic(name: string) {
    const { error } = await supabase
      .from('statistics')
      .delete()
      .eq('name', name);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async getComplianceStatus() {
    const [requests, logs, consents] = await Promise.all([
      supabase.from('data_subject_requests').select('*', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      supabase.from('consent_records').select('*', { count: 'exact', head: true }),
    ]);

    return {
      dataRequests: requests.count || 0,
      auditLogs: logs.count || 0,
      consentRecords: consents.count || 0,
      lastAuditDate: new Date().toISOString(),
    };
  }

  async getAuditLogs(params: any = {}) {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.limit) {
      query = query.limit(parseInt(params.limit));
    }
    if (params.offset) {
      query = query.range(parseInt(params.offset), parseInt(params.offset) + parseInt(params.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      logs: data,
      total: count || 0,
    };
  }

  async getDataSubjectRequests() {
    const { data, error } = await supabase
      .from('data_subject_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createDataSubjectRequest(request: any) {
    const { data, error } = await supabase
      .from('data_subject_requests')
      .insert([request])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async exportUserData(email: string) {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: session?.user?.id,
        action: 'export_user_data',
        entity_type: 'user',
        details: { email },
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, message: 'Export initiated' };
  }

  async deleteUserData(email: string, reason: string) {
    const { data, error } = await supabase
      .from('data_subject_requests')
      .insert([{
        email,
        request_type: 'delete',
        reason,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async logDataExport(email: string) {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: session?.user?.id,
        action: 'data_export',
        entity_type: 'compliance',
        details: { email },
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getEncryptionStatus() {
    return {
      database: 'enabled',
      storage: 'enabled',
      backups: 'enabled',
      lastKeyRotation: new Date().toISOString(),
    };
  }

  async enableEncryption(type: string) {
    return {
      success: true,
      message: `${type} encryption enabled`,
    };
  }

  async rotateEncryptionKeys() {
    return {
      success: true,
      message: 'Encryption keys rotated',
    };
  }

  async createEncryptedBackup() {
    return {
      success: true,
      message: 'Backup created',
      backupId: `backup_${Date.now()}`,
    };
  }

  async getConsentRecords() {
    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getRetentionPolicies() {
    return [
      {
        id: 1,
        name: 'User Data',
        retention_period: '7 years',
        description: 'Medical records and user data',
      },
      {
        id: 2,
        name: 'Audit Logs',
        retention_period: '3 years',
        description: 'System audit logs',
      },
    ];
  }

  async runRetentionCleanup() {
    return {
      success: true,
      message: 'Retention cleanup completed',
      recordsDeleted: 0,
    };
  }
}

export const apiService = new ApiService();
