import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePublicTestimonials, usePublicArticles, usePublicStatistics } from '../../hooks/useApi';
import { mockApiService } from '../mocks/apiMock';

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: mockApiService
}));

describe('useApi Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePublicTestimonials', () => {
    it('fetches testimonials on mount', async () => {
      const { result } = renderHook(() => usePublicTestimonials());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.testimonials).toHaveLength(2);
      expect(result.current.error).toBeNull();
      expect(mockApiService.getPublicTestimonials).toHaveBeenCalledWith({});
    });

    it('handles API errors', async () => {
      mockApiService.getPublicTestimonials.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => usePublicTestimonials());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.testimonials).toEqual([]);
    });

    it('refetches data when params change', async () => {
      const { result, rerender } = renderHook(
        ({ params }) => usePublicTestimonials(params),
        { initialProps: { params: { procedure: 'LASIK' } } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiService.getPublicTestimonials).toHaveBeenCalledWith({ procedure: 'LASIK' });

      // Change params
      rerender({ params: { procedure: 'PRK' } });

      await waitFor(() => {
        expect(mockApiService.getPublicTestimonials).toHaveBeenCalledWith({ procedure: 'PRK' });
      });
    });
  });

  describe('usePublicArticles', () => {
    it('fetches articles successfully', async () => {
      const { result } = renderHook(() => usePublicArticles());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.articles).toHaveLength(2);
      expect(mockApiService.getPublicArticles).toHaveBeenCalled();
    });
  });

  describe('usePublicStatistics', () => {
    it('fetches statistics successfully', async () => {
      const { result } = renderHook(() => usePublicStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.statistics).toHaveProperty('total_procedures');
      expect(result.current.statistics).toHaveProperty('success_rate');
      expect(mockApiService.getPublicStatistics).toHaveBeenCalled();
    });
  });
});