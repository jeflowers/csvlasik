import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function usePublicTestimonials(params: any = {}) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPublicTestimonials(params);
        setTestimonials(data.testimonials || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [JSON.stringify(params)]);

  return { testimonials, loading, error, refetch: () => fetchTestimonials() };
}

export function usePublicArticles(params: any = {}) {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPublicArticles(params);
        setArticles(data.articles || []);
        setTotal(data.total || 0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles');
        setArticles([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [JSON.stringify(params)]);

  return { articles, total, loading, error };
}

export function usePublicStatistics() {
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPublicStatistics();

        const formattedStats: any = {};
        if (Array.isArray(data)) {
          data.forEach((stat: any) => {
            formattedStats[stat.name] = {
              value: stat.value,
              format: stat.value
            };
          });
        }
        setStatistics(formattedStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        setStatistics({});
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return { statistics, loading, error, refetch: () => fetchStatistics() };
}