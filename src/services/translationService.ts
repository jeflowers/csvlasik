import { supabase } from '../lib/supabase';

interface CacheEntry {
  translation: string;
  timestamp: number;
  service: string;
}

interface TranslationCache {
  [key: string]: CacheEntry;
}

const DEEPL_LANGUAGES = ['ja', 'es-MX', 'pt-BR', 'ko', 'zh', 'ar', 'he'];
const GOOGLE_ONLY_LANGUAGES = ['tl', 'vi', 'hy'];
const ALL_SUPPORTED = [...DEEPL_LANGUAGES, ...GOOGLE_ONLY_LANGUAGES];

const CACHE_KEY = 'atelier_translation_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

class TranslationService {
  private cache: TranslationCache = {};

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch {
      this.cache = {};
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch {
      // localStorage full or unavailable
    }
  }

  private makeCacheKey(text: string, targetLang: string, sourceLang: string): string {
    let hash = 0;
    const str = `${sourceLang}:${targetLang}:${text}`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < CACHE_EXPIRY_MS;
  }

  hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString();
  }

  isDeeplSupported(lang: string): boolean {
    return DEEPL_LANGUAGES.includes(lang);
  }

  isGoogleSupported(lang: string): boolean {
    return ALL_SUPPORTED.includes(lang);
  }

  /**
   * Translate text via the Supabase Edge Function proxy.
   * The edge function holds API keys securely and routes:
   *   DeepL (ja, es-MX, pt-BR, ko, zh, ar, he) -> Google (tl, vi, hy) -> original text
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'en',
    options: {
      preferredService?: 'deepl' | 'google' | 'auto';
      useCache?: boolean;
      namespace?: string;
      key?: string;
    } = {}
  ): Promise<string> {
    const { useCache = true } = options;

    if (targetLang === sourceLang || targetLang === 'en') return text;
    if (!ALL_SUPPORTED.includes(targetLang)) return text;

    // Check cache first
    if (useCache) {
      const cacheKey = this.makeCacheKey(text, targetLang, sourceLang);
      const cached = this.cache[cacheKey];
      if (cached && this.isCacheValid(cached)) {
        return cached.translation;
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, targetLang, sourceLang },
      });

      if (error) throw error;

      const translation = data?.translation || text;

      // Cache the result
      if (useCache && translation !== text) {
        const cacheKey = this.makeCacheKey(text, targetLang, sourceLang);
        this.cache[cacheKey] = {
          translation,
          timestamp: Date.now(),
          service: data?.service || 'unknown',
        };
        this.saveCache();
      }

      return translation;
    } catch (error) {
      console.warn(`Translation failed for "${text.slice(0, 40)}..." to ${targetLang}:`, error);
      return text;
    }
  }

  async batchTranslate(
    items: Array<{ text: string; key?: string; namespace?: string }>,
    targetLanguages: string[],
    options: { preferredService?: 'deepl' | 'google' | 'auto' } = {}
  ): Promise<Record<string, Record<number, string>>> {
    const results: Record<string, Record<number, string>> = {};

    for (const lang of targetLanguages) {
      results[lang] = {};
      for (let i = 0; i < items.length; i++) {
        try {
          results[lang][i] = await this.translate(items[i].text, lang, 'en', {
            ...options,
            key: items[i].key,
            namespace: items[i].namespace,
          });
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch {
          results[lang][i] = items[i].text;
        }
      }
    }

    return results;
  }

  getServiceStatus() {
    return {
      deepl: {
        enabled: true,
        supportedLanguages: DEEPL_LANGUAGES,
        name: 'DeepL (via Edge Function)',
      },
      google: {
        enabled: true,
        supportedLanguages: ALL_SUPPORTED,
        name: 'Google Translate (via Edge Function)',
      },
      cache: {
        entries: Object.keys(this.cache).length,
        lastCleared: localStorage.getItem('translation_cache_cleared') || 'Never',
      },
    };
  }

  clearCache() {
    this.cache = {};
    localStorage.removeItem(CACHE_KEY);
    localStorage.setItem('translation_cache_cleared', new Date().toISOString());
  }

  isAvailable(): boolean {
    return true; // Always available since edge function handles availability
  }
}

export const translationService = new TranslationService();
export default translationService;
