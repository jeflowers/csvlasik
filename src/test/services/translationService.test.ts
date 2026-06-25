import { describe, it, expect, vi, beforeEach } from 'vitest';
import translationService from '../../services/translationService';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '../../lib/supabase';

describe('Translation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    translationService.clearCache();
  });

  describe('Service Status', () => {
    it('reports correct service availability', () => {
      const status = translationService.getServiceStatus();

      expect(status).toHaveProperty('deepl');
      expect(status).toHaveProperty('google');
      expect(status.deepl.enabled).toBe(true);
      expect(status.google.enabled).toBe(true);
    });

    it('reports DeepL supports expected languages', () => {
      const status = translationService.getServiceStatus();
      expect(status.deepl.supportedLanguages).toContain('ja');
      expect(status.deepl.supportedLanguages).toContain('ko');
      expect(status.deepl.supportedLanguages).toContain('zh');
      expect(status.deepl.supportedLanguages).not.toContain('tl');
      expect(status.deepl.supportedLanguages).not.toContain('vi');
      expect(status.deepl.supportedLanguages).not.toContain('hy');
    });

    it('reports Google supports languages DeepL does not', () => {
      const status = translationService.getServiceStatus();
      expect(status.google.supportedLanguages).toContain('tl');
      expect(status.google.supportedLanguages).toContain('vi');
      expect(status.google.supportedLanguages).toContain('hy');
    });
  });

  describe('Translation', () => {
    it('returns original text for same language', async () => {
      const result = await translationService.translate('Hello', 'en', 'en');
      expect(result).toBe('Hello');
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('returns original text when target is English', async () => {
      const result = await translationService.translate('Hello', 'en', 'es');
      expect(result).toBe('Hello');
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('returns original text for unsupported languages', async () => {
      const result = await translationService.translate('Hello', 'xx', 'en');
      expect(result).toBe('Hello');
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('calls edge function for supported languages', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { translation: 'Hola', service: 'deepl' },
        error: null,
      });

      const result = await translationService.translate('Hello', 'es-MX', 'en');
      expect(result).toBe('Hola');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('translate', {
        body: { text: 'Hello', targetLang: 'es-MX', sourceLang: 'en' },
      });
    });

    it('handles edge function errors gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: new Error('Function invocation failed'),
      });

      const result = await translationService.translate('Hello', 'es-MX', 'en');
      expect(result).toBe('Hello');
    });

    it('caches successful translations', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { translation: 'Hola', service: 'deepl' },
        error: null,
      });

      await translationService.translate('Hello', 'es-MX', 'en');
      const result = await translationService.translate('Hello', 'es-MX', 'en');

      expect(result).toBe('Hola');
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cache Management', () => {
    it('clears cache correctly', () => {
      localStorage.setItem('atelier_translation_cache', JSON.stringify({ test: 'data' }));

      translationService.clearCache();

      expect(localStorage.getItem('atelier_translation_cache')).toBeNull();
    });

    it('validates cache expiry', () => {
      const expired = {
        translation: 'Test',
        timestamp: Date.now() - (25 * 60 * 60 * 1000),
        service: 'deepl',
      };

      expect(translationService.isCacheValid(expired)).toBe(false);
    });

    it('accepts fresh cache entries', () => {
      const fresh = {
        translation: 'Test',
        timestamp: Date.now() - (1 * 60 * 60 * 1000),
        service: 'deepl',
      };

      expect(translationService.isCacheValid(fresh)).toBe(true);
    });
  });

  describe('Language support detection', () => {
    it('identifies DeepL-supported languages', () => {
      expect(translationService.isDeeplSupported('ja')).toBe(true);
      expect(translationService.isDeeplSupported('ko')).toBe(true);
      expect(translationService.isDeeplSupported('tl')).toBe(false);
      expect(translationService.isDeeplSupported('vi')).toBe(false);
    });

    it('identifies Google-supported languages', () => {
      expect(translationService.isGoogleSupported('tl')).toBe(true);
      expect(translationService.isGoogleSupported('vi')).toBe(true);
      expect(translationService.isGoogleSupported('hy')).toBe(true);
      expect(translationService.isGoogleSupported('ja')).toBe(true);
    });
  });

  describe('isAvailable', () => {
    it('is always available (edge function handles availability)', () => {
      expect(translationService.isAvailable()).toBe(true);
    });
  });
});
