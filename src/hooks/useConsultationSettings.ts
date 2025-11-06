import { useState, useEffect } from 'react';
import type { ConsultationSettings } from '../types/Consultation';
import { consultationService } from '../services/consultation/consultationService';

export function useConsultationSettings() {
  const [settings, setSettings] = useState<ConsultationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await consultationService.getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<ConsultationSettings>) => {
    try {
      const updated = await consultationService.updateSettings(updates);
      setSettings(updated);
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update settings');
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    reload: loadSettings,
  };
}
