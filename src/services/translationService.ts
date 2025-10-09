interface TranslationConfig {
  service: 'deepl' | 'google' | 'local';
  apiKey?: string;
  baseUrl?: string;
  supportedLanguages: string[];
}

interface TranslationCache {
  [key: string]: {
    translation: string;
    timestamp: number;
    service: string;
  };
}

class TranslationService {
  private cache: TranslationCache = {};
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  
  private services = {
    deepl: {
      enabled: false,
      apiKey: '',
      baseUrl: 'https://api-free.deepl.com/v2',
      supportedLanguages: ['ja', 'es-MX', 'pt-BR', 'ko', 'zh', 'ar', 'he']
    },
    google: {
      enabled: false,
      apiKey: '',
      baseUrl: 'https://translation.googleapis.com/language/translate/v2',
      supportedLanguages: ['ja', 'es-MX', 'pt-BR', 'tl', 'ko', 'vi', 'zh', 'ar', 'hy', 'he']
    }
  };

  // Medical terms that should never be translated
  private protectedTerms = [
    'LASIK', 'PRK', 'ICL', 'SMILE', 'FDA', 'Dr. Charles Flowers',
    'ClearSight', 'Visian ICL', 'Femtosecond', 'Excimer',
    'Keratomileusis', 'Keratectomy', 'Topography', 'Wavefront'
  ];

  constructor() {
    this.initializeServices();
    this.loadCacheFromStorage();
  }

  private initializeServices() {
    // Check for environment variables (client-side)
    const deeplKey = import.meta.env.VITE_DEEPL_API_KEY;
    const googleKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

    if (deeplKey) {
      this.services.deepl.enabled = true;
      this.services.deepl.apiKey = deeplKey;
    }

    if (googleKey) {
      this.services.google.enabled = true;
      this.services.google.apiKey = googleKey;
    }

    console.log('Translation services initialized:', {
      deepl: this.services.deepl.enabled,
      google: this.services.google.enabled
    });
  }

  private loadCacheFromStorage() {
    try {
      const cached = localStorage.getItem('translation_cache');
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load translation cache:', error);
    }
  }

  private saveCacheToStorage() {
    try {
      localStorage.setItem('translation_cache', JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save translation cache:', error);
    }
  }

  private getCacheKey(text: string, targetLang: string, sourceLang: string = 'en'): string {
    return `${sourceLang}-${targetLang}-${this.hashString(text)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private isCacheValid(cacheEntry: any): boolean {
    return Date.now() - cacheEntry.timestamp < this.cacheExpiry;
  }

  private protectMedicalTerms(originalText: string, translatedText: string): string {
    let protectedText = translatedText;
    
    this.protectedTerms.forEach(term => {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      protectedText = protectedText.replace(regex, term);
    });
    
    return protectedText;
  }

  private async translateWithDeepL(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    if (!this.services.deepl.enabled) {
      throw new Error('DeepL service not configured');
    }

    const langMap: { [key: string]: string } = {
      'ja': 'JA',
      'es-MX': 'ES',
      'pt-BR': 'PT-BR',
      'ko': 'KO',
      'zh': 'ZH',
      'ar': 'AR',
      'he': 'HE'
    };

    const deeplLang = langMap[targetLang];
    if (!deeplLang) {
      throw new Error(`Language ${targetLang} not supported by DeepL`);
    }

    try {
      const response = await fetch(`${this.services.deepl.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.services.deepl.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          source_lang: sourceLang.toUpperCase(),
          target_lang: deeplLang,
          preserve_formatting: '1',
          formality: 'default'
        })
      });

      if (!response.ok) {
        throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.translations[0].text;
    } catch (error) {
      console.error('DeepL translation error:', error);
      throw error;
    }
  }

  private async translateWithGoogle(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    if (!this.services.google.enabled) {
      throw new Error('Google Translate service not configured');
    }

    const langMap: { [key: string]: string } = {
      'ja': 'ja',
      'es-MX': 'es',
      'pt-BR': 'pt',
      'pt': 'pt',
      'tl': 'tl',
      'ko': 'ko',
      'vi': 'vi',
      'zh': 'zh-cn',
      'ar': 'ar',
      'hy': 'hy',
      'he': 'he'
    };

    const googleLang = langMap[targetLang];
    if (!googleLang) {
      throw new Error(`Language ${targetLang} not supported by Google Translate`);
    }

    try {
      const response = await fetch(`${this.services.google.baseUrl}?key=${this.services.google.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: googleLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }

  private async loadLocalTranslation(key: string, targetLang: string, namespace: string = 'common'): Promise<string | null> {
    try {
      const response = await fetch(`/locales/${targetLang}/${namespace}.json`);
      if (!response.ok) return null;
      
      const translations = await response.json();
      return this.getNestedValue(translations, key) || null;
    } catch (error) {
      console.warn(`Failed to load local translation for ${targetLang}/${namespace}:`, error);
      return null;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  public async translate(
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
    const { preferredService = 'auto', useCache = true, namespace = 'common', key } = options;

    // Return original text if target language is source language
    if (targetLang === sourceLang) {
      return text;
    }

    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
      const cached = this.cache[cacheKey];
      
      if (cached && this.isCacheValid(cached)) {
        return cached.translation;
      }
    }

    // Try local translation first if key is provided
    if (key) {
      const localTranslation = await this.loadLocalTranslation(key, targetLang, namespace);
      if (localTranslation) {
        return localTranslation;
      }
    }

    // Determine best service
    let service = preferredService;
    if (service === 'auto') {
      if (this.services.deepl.enabled && this.services.deepl.supportedLanguages.includes(targetLang)) {
        service = 'deepl';
      } else if (this.services.google.enabled && this.services.google.supportedLanguages.includes(targetLang)) {
        service = 'google';
      } else {
        throw new Error(`No translation service available for language: ${targetLang}`);
      }
    }

    let translation: string;
    let usedService: string;

    try {
      if (service === 'deepl') {
        translation = await this.translateWithDeepL(text, targetLang, sourceLang);
        usedService = 'deepl';
      } else if (service === 'google') {
        translation = await this.translateWithGoogle(text, targetLang, sourceLang);
        usedService = 'google';
      } else {
        throw new Error(`Invalid service: ${service}`);
      }

      // Protect medical terms
      translation = this.protectMedicalTerms(text, translation);

      // Cache the result
      if (useCache) {
        const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
        this.cache[cacheKey] = {
          translation,
          timestamp: Date.now(),
          service: usedService
        };
        this.saveCacheToStorage();
      }

      return translation;

    } catch (error) {
      console.error(`Translation failed with ${service}:`, error);
      
      // Try fallback service
      const fallbackService = service === 'deepl' ? 'google' : 'deepl';
      if (this.services[fallbackService].enabled && 
          this.services[fallbackService].supportedLanguages.includes(targetLang)) {
        
        console.log(`Trying fallback service: ${fallbackService}`);
        try {
          if (fallbackService === 'deepl') {
            translation = await this.translateWithDeepL(text, targetLang, sourceLang);
          } else {
            translation = await this.translateWithGoogle(text, targetLang, sourceLang);
          }
          
          translation = this.protectMedicalTerms(text, translation);
          
          if (useCache) {
            const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
            this.cache[cacheKey] = {
              translation,
              timestamp: Date.now(),
              service: fallbackService
            };
            this.saveCacheToStorage();
          }
          
          return translation;
        } catch (fallbackError) {
          console.error(`Fallback translation also failed:`, fallbackError);
        }
      }
      
      // Final fallback to original text
      console.warn(`All translation services failed, returning original text`);
      return text;
    }
  }

  public getServiceStatus() {
    return {
      deepl: {
        enabled: this.services.deepl.enabled,
        supportedLanguages: this.services.deepl.supportedLanguages,
        name: 'DeepL'
      },
      google: {
        enabled: this.services.google.enabled,
        supportedLanguages: this.services.google.supportedLanguages,
        name: 'Google Translate'
      },
      cache: {
        entries: Object.keys(this.cache).length,
        lastCleared: localStorage.getItem('translation_cache_cleared') || 'Never'
      }
    };
  }

  public clearCache() {
    this.cache = {};
    localStorage.removeItem('translation_cache');
    localStorage.setItem('translation_cache_cleared', new Date().toISOString());
  }

  public async batchTranslate(
    items: Array<{ text: string; key?: string; namespace?: string }>,
    targetLanguages: string[],
    options: { preferredService?: 'deepl' | 'google' | 'auto' } = {}
  ): Promise<{ [lang: string]: { [index: number]: string } }> {
    const results: { [lang: string]: { [index: number]: string } } = {};
    
    for (const lang of targetLanguages) {
      results[lang] = {};
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          results[lang][i] = await this.translate(item.text, lang, 'en', {
            ...options,
            key: item.key,
            namespace: item.namespace
          });
          
          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to translate item ${i} to ${lang}:`, error);
          results[lang][i] = item.text; // Fallback to original
        }
      }
    }
    
    return results;
  }
}

export const translationService = new TranslationService();
export default translationService;