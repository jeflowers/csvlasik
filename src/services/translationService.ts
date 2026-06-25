interface CacheEntry {
  translation: string;
  timestamp: number;
  service: 'deepl' | 'google';
}

interface TranslationCache {
  [key: string]: CacheEntry;
}

interface ServiceConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
}

// DeepL language code mapping
const DEEPL_LANG_MAP: Record<string, string> = {
  'ja': 'JA',
  'es-MX': 'ES',
  'pt-BR': 'PT-BR',
  'ko': 'KO',
  'zh': 'ZH-HANS',
  'ar': 'AR',
  'he': 'HE'
};

// Google Translate language code mapping
const GOOGLE_LANG_MAP: Record<string, string> = {
  'ja': 'ja',
  'es-MX': 'es',
  'pt-BR': 'pt',
  'ko': 'ko',
  'vi': 'vi',
  'zh': 'zh-CN',
  'ar': 'ar',
  'hy': 'hy',
  'he': 'iw',
  'tl': 'tl'
};

// Medical terms that should never be translated
const PROTECTED_TERMS = [
  'LASIK', 'PRK', 'ICL', 'FDA', 'Dr. Charles Flowers',
  'Atelier', 'Visian ICL', 'Femtosecond', 'Excimer',
  'Keratomileusis', 'Keratectomy', 'Topography', 'Wavefront',
  'Aberrometry'
];

const CACHE_KEY = 'atelier_translation_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

class TranslationService {
  private cache: TranslationCache = {};
  private deepl: ServiceConfig;
  private google: ServiceConfig;

  constructor() {
    this.deepl = {
      enabled: false,
      apiKey: '',
      baseUrl: import.meta.env.VITE_DEEPL_API_URL || 'https://api-free.deepl.com/v2'
    };

    this.google = {
      enabled: false,
      apiKey: '',
      baseUrl: 'https://translation.googleapis.com/language/translate/v2'
    };

    this.initializeServices();
    this.loadCache();
  }

  private initializeServices() {
    const deeplKey = import.meta.env.VITE_DEEPL_API_KEY;
    const googleKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

    if (deeplKey && deeplKey !== 'your-deepl-api-key-here') {
      this.deepl.enabled = true;
      this.deepl.apiKey = deeplKey;
    }

    if (googleKey && googleKey !== 'your-google-translate-api-key-here') {
      this.google.enabled = true;
      this.google.apiKey = googleKey;
    }
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
      // localStorage full or unavailable - silently continue
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

  private protectTerms(translated: string): string {
    let result = translated;
    for (const term of PROTECTED_TERMS) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      result = result.replace(regex, term);
    }
    return result;
  }

  isDeeplSupported(lang: string): boolean {
    return lang in DEEPL_LANG_MAP;
  }

  isGoogleSupported(lang: string): boolean {
    return lang in GOOGLE_LANG_MAP;
  }

  private async callDeepL(text: string, targetLang: string, sourceLang: string): Promise<string> {
    const deeplTarget = DEEPL_LANG_MAP[targetLang];
    if (!deeplTarget) throw new Error(`DeepL: unsupported language ${targetLang}`);

    const response = await fetch(`${this.deepl.baseUrl}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.deepl.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        source_lang: sourceLang.toUpperCase(),
        target_lang: deeplTarget,
        preserve_formatting: '1'
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`DeepL ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  }

  private async callGoogle(text: string, targetLang: string, sourceLang: string): Promise<string> {
    const googleTarget = GOOGLE_LANG_MAP[targetLang];
    if (!googleTarget) throw new Error(`Google: unsupported language ${targetLang}`);

    const response = await fetch(`${this.google.baseUrl}?key=${this.google.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: googleTarget,
        format: 'text'
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Google Translate ${response.status}: ${body}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }

  /**
   * Translate text using the service chain: DeepL -> Google -> original text.
   * Static JSON files (loaded by i18next) are checked BEFORE this service is called.
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
    const { preferredService = 'auto', useCache = true } = options;

    if (targetLang === sourceLang || targetLang === 'en') return text;

    // Check cache
    if (useCache) {
      const cacheKey = this.makeCacheKey(text, targetLang, sourceLang);
      const cached = this.cache[cacheKey];
      if (cached && this.isCacheValid(cached)) {
        return cached.translation;
      }
    }

    // Determine service order based on language support
    const tryDeepL = this.deepl.enabled && this.isDeeplSupported(targetLang);
    const tryGoogle = this.google.enabled && this.isGoogleSupported(targetLang);

    let services: Array<'deepl' | 'google'> = [];

    if (preferredService === 'deepl') {
      if (tryDeepL) services.push('deepl');
      if (tryGoogle) services.push('google');
    } else if (preferredService === 'google') {
      if (tryGoogle) services.push('google');
      if (tryDeepL) services.push('deepl');
    } else {
      // Auto: DeepL first (higher quality), Google as fallback
      if (tryDeepL) services.push('deepl');
      if (tryGoogle) services.push('google');
    }

    if (services.length === 0) {
      return text; // No services available, return original
    }

    for (const service of services) {
      try {
        let translation: string;
        if (service === 'deepl') {
          translation = await this.callDeepL(text, targetLang, sourceLang);
        } else {
          translation = await this.callGoogle(text, targetLang, sourceLang);
        }

        translation = this.protectTerms(translation);

        // Cache the result
        if (useCache) {
          const cacheKey = this.makeCacheKey(text, targetLang, sourceLang);
          this.cache[cacheKey] = { translation, timestamp: Date.now(), service };
          this.saveCache();
        }

        return translation;
      } catch (error) {
        console.warn(`Translation via ${service} failed for "${text.slice(0, 40)}..." to ${targetLang}:`, error);
        // Continue to next service
      }
    }

    // All services failed - return original text
    return text;
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
            namespace: items[i].namespace
          });
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 100));
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
        enabled: this.deepl.enabled,
        supportedLanguages: Object.keys(DEEPL_LANG_MAP),
        name: 'DeepL'
      },
      google: {
        enabled: this.google.enabled,
        supportedLanguages: Object.keys(GOOGLE_LANG_MAP),
        name: 'Google Translate'
      },
      cache: {
        entries: Object.keys(this.cache).length,
        lastCleared: localStorage.getItem('translation_cache_cleared') || 'Never'
      }
    };
  }

  clearCache() {
    this.cache = {};
    localStorage.removeItem(CACHE_KEY);
    localStorage.setItem('translation_cache_cleared', new Date().toISOString());
  }

  isAvailable(): boolean {
    return this.deepl.enabled || this.google.enabled;
  }
}

export const translationService = new TranslationService();
export default translationService;
