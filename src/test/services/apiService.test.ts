import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../../services/api';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      admin: {
        createUser: vi.fn(),
        updateUserById: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
      })),
    },
  },
}));

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const mockSession = { access_token: 'test-token' };
      const mockUser = { id: '1', email: 'test@example.com', role: 'admin' };

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: { id: '1' }, session: mockSession },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
      } as any);

      const result = await apiService.login('test@example.com', 'password');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle login errors', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      } as any);

      await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow();
    });

    it('should logout successfully', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await expect(apiService.logout()).resolves.not.toThrow();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Articles', () => {
    it('should fetch articles', async () => {
      const mockArticles = [
        { id: 1, title: 'Test Article', content: 'Test content' },
      ];

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockArticles,
          error: null,
          count: 1,
        }),
      } as any);

      const result = await apiService.getArticles({ limit: 10 });

      expect(result.articles).toEqual(mockArticles);
      expect(result.total).toBe(1);
    });

    it('should create article', async () => {
      const newArticle = {
        title: 'New Article',
        content: 'New content',
        status: 'draft',
      };

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, ...newArticle },
          error: null,
        }),
      } as any);

      const result = await apiService.createArticle(newArticle);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(newArticle.title);
    });

    it('should update article', async () => {
      const updates = { title: 'Updated Title' };

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, ...updates },
          error: null,
        }),
      } as any);

      const result = await apiService.updateArticle(1, updates);

      expect(result.title).toBe(updates.title);
    });

    it('should delete article', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await apiService.deleteArticle(1);

      expect(result).toEqual({ success: true });
    });
  });

  describe('Testimonials', () => {
    it('should fetch testimonials', async () => {
      const mockTestimonials = [
        { id: 1, name: 'John Doe', content: 'Great service!', approved: true },
      ];

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockTestimonials,
          error: null,
          count: 1,
        }),
      } as any);

      const result = await apiService.getTestimonials({ limit: 10 });

      expect(result.testimonials).toEqual(mockTestimonials);
    });

    it('should create testimonial', async () => {
      const newTestimonial = {
        name: 'Jane Doe',
        content: 'Excellent experience!',
        approved: false,
      };

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, ...newTestimonial },
          error: null,
        }),
      } as any);

      const result = await apiService.createTestimonial(newTestimonial);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(newTestimonial.name);
    });

    it('should update testimonial', async () => {
      const updates = { approved: true };

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, ...updates },
          error: null,
        }),
      } as any);

      const result = await apiService.updateTestimonial(1, updates);

      expect(result.approved).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should fetch public statistics', async () => {
      const mockStats = [
        { name: 'patients_served', value: '10000' },
      ];

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockStats,
          error: null,
        }),
      } as any);

      const result = await apiService.getPublicStatistics();

      expect(result).toEqual(mockStats);
    });

    it('should update statistic', async () => {
      const updates = { value: '15000' };

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { name: 'patients_served', ...updates },
          error: null,
        }),
      } as any);

      const result = await apiService.updateStatistic('patients_served', updates);

      expect(result.value).toBe(updates.value);
    });
  });

  describe('Media', () => {
    it('should fetch media files', async () => {
      const mockMedia = [
        { id: 1, filename: 'test.jpg', filepath: '/media/test.jpg' },
      ];

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockMedia,
          error: null,
          count: 1,
        }),
      } as any);

      const result = await apiService.getMedia({ limit: 10 });

      expect(result.media).toEqual(mockMedia);
      expect(result.total).toBe(1);
    });

    it('should handle media upload', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test/test.jpg' },
          error: null,
        }),
      } as any);

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: { id: '1' } } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1, filename: 'test.jpg' },
          error: null,
        }),
      } as any);

      const result = await apiService.uploadMedia(mockFile, {});

      expect(result).toHaveProperty('id');
      expect(result.filename).toBe('test.jpg');
    });
  });

  describe('Dashboard', () => {
    it('should fetch dashboard overview', async () => {
      const { supabase } = await import('../../lib/supabase');

      const mockCount = { count: 10, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockCount),
      } as any);

      const result = await apiService.getDashboardOverview();

      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('testimonials');
      expect(result).toHaveProperty('media');
    });

    it('should fetch dashboard stats', async () => {
      const { supabase } = await import('../../lib/supabase');

      const mockArticles = [{ status: 'published' }, { status: 'draft' }];
      const mockTestimonials = [{ approved: true }, { approved: false }];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'articles') {
          return {
            select: vi.fn().mockResolvedValue({
              data: mockArticles,
              error: null,
            }),
          } as any;
        }
        if (table === 'testimonials') {
          return {
            select: vi.fn().mockResolvedValue({
              data: mockTestimonials,
              error: null,
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as any;
      });

      const result = await apiService.getDashboardStats();

      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('testimonials');
      expect(result.articles.total).toBe(2);
      expect(result.testimonials.approved).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw error on failed API call', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      } as any);

      await expect(apiService.getPublicStatistics()).rejects.toThrow('Database error');
    });
  });
});
