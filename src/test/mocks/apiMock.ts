import { vi } from 'vitest';

export const mockFetchResponses = {
  login: {
    success: {
      ok: true,
      json: async () => ({
        token: 'mock-jwt-token',
        user: { id: 1, username: 'admin', email: 'admin@test.com' }
      })
    },
    failure: {
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' })
    }
  },
  articles: {
    list: {
      ok: true,
      json: async () => ({
        articles: [
          { id: 1, title: 'Test Article', content: 'Test content', status: 'published' }
        ],
        total: 1
      })
    }
  },
  testimonials: {
    list: {
      ok: true,
      json: async () => ({
        testimonials: [
          { id: 1, name: 'John Doe', content: 'Great service!', approved: true }
        ],
        total: 1
      })
    }
  }
};

export const mockApiService = {
  login: vi.fn().mockResolvedValue({
    token: 'mock-jwt-token',
    user: { id: 1, username: 'admin', email: 'admin@test.com' }
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  getArticles: vi.fn().mockResolvedValue({
    articles: [],
    total: 0
  }),
  createArticle: vi.fn().mockResolvedValue({
    id: 1,
    title: 'New Article',
    content: 'Content',
    status: 'draft'
  }),
  updateArticle: vi.fn().mockResolvedValue({
    id: 1,
    title: 'Updated Article',
    content: 'Content',
    status: 'published'
  }),
  deleteArticle: vi.fn().mockResolvedValue({ success: true }),
  getTestimonials: vi.fn().mockResolvedValue({
    testimonials: [],
    total: 0
  }),
  createTestimonial: vi.fn().mockResolvedValue({
    id: 1,
    name: 'Test User',
    content: 'Test testimonial',
    approved: false
  }),
  updateTestimonial: vi.fn().mockResolvedValue({
    id: 1,
    name: 'Test User',
    content: 'Test testimonial',
    approved: true
  }),
  deleteTestimonial: vi.fn().mockResolvedValue({ success: true }),
  getPublicStatistics: vi.fn().mockResolvedValue([
    { name: 'patients_served', value: '10000' }
  ]),
  updateStatistic: vi.fn().mockResolvedValue({
    name: 'patients_served',
    value: '15000'
  }),
  getMedia: vi.fn().mockResolvedValue({
    media: [],
    total: 0
  }),
  uploadMedia: vi.fn().mockResolvedValue({
    id: 1,
    filename: 'test.jpg',
    filepath: '/media/test.jpg'
  }),
  deleteMedia: vi.fn().mockResolvedValue({ success: true }),
  getDashboardOverview: vi.fn().mockResolvedValue({
    articles: { count: 0 },
    testimonials: { count: 0 },
    media: { count: 0 }
  }),
  getDashboardStats: vi.fn().mockResolvedValue({
    articles: { total: 0, published: 0, draft: 0 },
    testimonials: { total: 0, approved: 0, pending: 0 },
    recentActivity: []
  })
};
