import { useState, useEffect } from 'react';
import type {
  ConsultationRequestWithUser,
  ConsultationFilters,
} from '../types/Consultation';
import { consultationService } from '../services/consultation/consultationService';

export function useAppointmentRequests(initialFilters: ConsultationFilters = {}) {
  const [requests, setRequests] = useState<ConsultationRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ConsultationFilters>(initialFilters);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRequests();

    const subscription = consultationService.subscribeToRequests((payload) => {
      if (payload.new) {
        setRequests((prev) => {
          const exists = prev.find((r) => r.id === payload.new.id);
          if (exists) {
            return prev.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r));
          }
          return [payload.new as ConsultationRequestWithUser, ...prev];
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await consultationService.getRequests(filters, 20, 0);
      setRequests(data);
      setHasMore(data.length === 20);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load requests'));
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      const data = await consultationService.getRequests(filters, 20, requests.length);
      if (data.length < 20) {
        setHasMore(false);
      }
      setRequests((prev) => [...prev, ...data]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more requests'));
    }
  };

  const assignRequest = async (requestId: string, userId: string) => {
    await consultationService.assignRequest(requestId, userId);
    await loadRequests();
  };

  const markAsScheduled = async (
    requestId: string,
    via: 'built-in' | 'ringcentral',
    eventId?: string
  ) => {
    await consultationService.markAsScheduled(requestId, via, eventId);
    await loadRequests();
  };

  const markAsClosed = async (requestId: string) => {
    await consultationService.markAsClosed(requestId);
    await loadRequests();
  };

  return {
    requests,
    loading,
    error,
    filters,
    setFilters,
    hasMore,
    loadMore,
    reload: loadRequests,
    assignRequest,
    markAsScheduled,
    markAsClosed,
  };
}
