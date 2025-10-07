import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../../services/api';
import { mockFetchResponses } from '../mocks/apiMock';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('successfully logs in with valid credentials', async () => {
      (fetch as any).mockResolvedValueOnce(mockFetchResponses.login.success);

      const result = await apiService.login('admin', 'admin123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        })
      );

      expect(result.token).toBe('mock-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('cms_token', 'mock-jwt-token');
    });

    it('throws error on invalid credentials', async () => {
      (fetch as any).mockResolvedValueOnce(mockFetchResponses.login.failure);

      await expect(apiService.login('admin', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('clears token on logout', () => {
      apiService.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('cms_token');
    });
  });

  describe('Public Endpoints', () => {
    it('fetches public testimonials', async () => {
      (fetch as any).mockResolvedValueOnce(mockFetchResponses.testimonials.success);

      const testimonials = await apiService.getPublicTestimonials();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/testimonials/public?',
        expect.any(Object)
      );
      expect(testimonials).toHaveLength(1);
    });

    it('fetches public articles', async () => {
      (fetch as any).mockResolvedValueOnce(mockFetchResponses.articles.success);

      const articles = await apiService.getPublicArticles();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/articles/public?',
        expect.any(Object)
      );
      expect(articles).toHaveLength(1);
    });

    it('handles API errors gracefully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      await expect(apiService.getPublicTestimonials()).rejects.toThrow('Server error');
    });
  });

  describe('Authenticated Endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('cms_token', 'mock-token');
    });

    it('includes authorization header for authenticated requests', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ testimonials: [], pagination: {} })
      });

      await apiService.getTestimonials();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });

  describe('File Upload', () => {
    it('uploads media files with proper form data', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ id: 1, filename: 'test.jpg' })
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);
      localStorage.setItem('cms_token', 'mock-token');

      const result = await apiService.uploadMedia(mockFile, { category: 'test' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/media/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );

      expect(result.filename).toBe('test.jpg');
    });
  });
});