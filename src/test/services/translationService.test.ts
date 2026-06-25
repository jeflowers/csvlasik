import { describe, it, expect, vi, beforeEach } from 'vitest';
import translationService from '../../services/translationService';

global.fetch = vi.fn();

describe('Translation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Service Status', () => {
    it('reports correct service availability', () => {
      const status = translationService.getServiceStatus();

      expect(status).toHaveProperty('deepl');
      expect(status).toHaveProperty('google');
      expect(status.deepl).toHaveProperty('enabled');
      expect(status.google).toHaveProperty('enabled');
      expect(status.deepl).toHaveProperty('supportedLanguages');
      expect(status.google).toHaveProperty('supportedLanguages');
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
    });

    it('returns original text when target is English', async () => {
      const result = await translationService.translate('Hello', 'en', 'es');
      expect(result).toBe('Hello');
    });

    it('returns original text when no services available', async () => {
      const result = await translationService.translate('Hello', 'es', 'en');
      expect(result).toBe('Hello');
    });

    it('handles API failures gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await translationService.translate('Hello', 'es', 'en');
      expect(result).toBe('Hello');
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
        service: 'deepl' as const
      };

      expect(translationService.isCacheValid(expired)).toBe(false);
    });

    it('accepts fresh cache entries', () => {
      const fresh = {
        translation: 'Test',
        timestamp: Date.now() - (1 * 60 * 60 * 1000),
        service: 'deepl' as const
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
});
