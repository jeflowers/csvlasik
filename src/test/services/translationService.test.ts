import { describe, it, expect, vi, beforeEach } from 'vitest';
import translationService from '../../services/translationService';

// Mock fetch
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
    });
  });

  describe('Translation', () => {
    it('returns original text for same language', async () => {
      const result = await translationService.translate('Hello', 'en', 'en');
      expect(result).toBe('Hello');
    });

    it('uses cache when available', async () => {
      // Mock cached translation
      const cacheKey = 'en-es-' + translationService.hashString('Hello');
      localStorage.setItem('translation_cache', JSON.stringify({
        [cacheKey]: {
          translation: 'Hola',
          timestamp: Date.now(),
          service: 'deepl'
        }
      }));

      const result = await translationService.translate('Hello', 'es', 'en');
      
      expect(result).toBe('Hola');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('protects medical terms during translation', async () => {
      // Mock successful translation
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          translations: [{ text: 'El Dr. Flowers realiza cirugía láser' }]
        })
      });

      const result = await translationService.translate(
        'Dr. Flowers performs LASIK surgery',
        'es',
        'en'
      );

      // Medical terms should be preserved
      expect(result).toContain('Dr. Flowers');
      expect(result).toContain('LASIK');
    });

    it('handles API failures gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await translationService.translate('Hello', 'es', 'en');
      
      // Should fallback to original text
      expect(result).toBe('Hello');
    });

    it('falls back between services', async () => {
      // Mock DeepL failure
      (fetch as any)
        .mockRejectedValueOnce(new Error('DeepL API error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              translations: [{ translatedText: 'Hola' }]
            }
          })
        });

      const result = await translationService.translate('Hello', 'es', 'en', {
        preferredService: 'deepl'
      });

      expect(result).toBe('Hola');
      expect(fetch).toHaveBeenCalledTimes(2); // DeepL failed, Google succeeded
    });
  });

  describe('Batch Translation', () => {
    it('translates multiple items', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          translations: [{ text: 'Hola' }]
        })
      });

      const items = [
        { text: 'Hello', key: 'greeting' },
        { text: 'Goodbye', key: 'farewell' }
      ];

      const results = await translationService.batchTranslate(items, ['es']);

      expect(results).toHaveProperty('es');
      expect(results.es).toHaveProperty('0');
      expect(results.es).toHaveProperty('1');
    });
  });

  describe('Cache Management', () => {
    it('clears cache correctly', () => {
      // Set some cache data
      localStorage.setItem('translation_cache', JSON.stringify({ test: 'data' }));
      
      translationService.clearCache();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('translation_cache');
    });

    it('validates cache expiry', () => {
      const expiredCache = {
        'test-key': {
          translation: 'Test',
          timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
          service: 'deepl'
        }
      };
      
      localStorage.setItem('translation_cache', JSON.stringify(expiredCache));
      
      // Should not use expired cache
      expect(translationService.isCacheValid(expiredCache['test-key'])).toBe(false);
    });
  });
});