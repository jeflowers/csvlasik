import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// Supported languages with their configurations
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    country: 'United States',
    rtl: false,
    deeplSupported: true,
    priority: 'source'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    country: 'Japan',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'standard'
  },
  'es-MX': {
    code: 'es-MX',
    name: 'Spanish (Latin America)',
    nativeName: 'Español (Latinoamérica)',
    flag: '🇲🇽',
    country: 'Latin America',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'high',
    fallback: 'es'
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    country: 'Brazil',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'high',
    fallback: 'pt'
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    flag: '🇵🇭',
    country: 'Philippines',
    rtl: false,
    services: { deepl: false, google: true },
    priority: 'standard'
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    country: 'South Korea',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'standard'
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    country: 'Vietnam',
    rtl: false,
    services: { deepl: false, google: true },
    priority: 'standard'
  },
  zh: {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    country: 'China',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'standard'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    rtl: true,
    services: { deepl: true, google: true },
    priority: 'standard'
  },
  hy: {
    code: 'hy',
    name: 'Armenian',
    nativeName: 'Հայերեն',
    flag: '🇦🇲',
    country: 'Armenia',
    rtl: false,
    services: { deepl: false, google: true },
    priority: 'standard'
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    country: 'Israel',
    rtl: true,
    services: { deepl: true, google: true },
    priority: 'standard'
  }
};

// Medical terminology that should NOT be translated
export const MEDICAL_PROTECTED_TERMS = [
  'LASIK',
  'PRK',
  'ICL',
  'FDA',
  'Dr. Charles Flowers',
  'ClearSight',
  'Visian ICL',
  'Femtosecond',
  'Excimer',
  'Keratomileusis',
  'Keratectomy',
  'Topography',
  'Wavefront',
  'Aberrometry'
];

// Add direction detection function
const getLanguageDirection = (lng: string): 'ltr' | 'rtl' => {
  const language = SUPPORTED_LANGUAGES[lng as keyof typeof SUPPORTED_LANGUAGES];
  return language?.rtl ? 'rtl' : 'ltr';
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'default'
      }
    },
    fallbackLng: {
      'pt-BR': ['pt', 'en'],
      'es-MX': ['en'],
      'default': ['en']
    },
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i']
    },
    ns: ['navigation', 'common', 'medical', 'forms', 'procedures', 'home', 'about', 'contact', 'financing', 'technology', 'testimonials', 'footer', 'privacy', 'terms', 'cookies', 'pacific', 'media'],
    defaultNS: 'navigation',
    load: 'all',
    cleanCode: true,
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
      cookieMinutes: 10080, // 7 days
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng) => {
        // Handle Brazilian Portuguese detection
        if (lng === 'pt' || lng.startsWith('pt-')) {
          return 'pt-BR';
        }
        // Handle Mexican Spanish detection
        if (lng.includes('mx') || lng.includes('MX')) {
          return 'es-MX';
        }
        return lng;
      }
    }
  });

// Add direction function to i18n instance
i18n.dir = (lng?: string) => {
  return getLanguageDirection(lng || i18n.language);
};

// Add error handling for translation loading
i18n.on('failedLoading', (lng, ns, msg) => {
  console.warn(`Failed to load translation: ${lng}/${ns}`, msg);
  
  // Try to reload with fallback
  if (lng === 'pt-BR' && ns === 'navigation') {
    console.log('Attempting to reload pt-BR navigation translations...');
    setTimeout(() => {
      i18n.reloadResources('pt-BR', 'navigation');
    }, 1000);
  }
});

i18n.on('missingKey', (lng, ns, key, fallbackValue) => {
  console.warn(`Missing translation key: ${lng}/${ns}/${key}`);
  
  // Log specific issues with pt-BR
  if (lng === 'pt-BR') {
    console.error(`pt-BR missing key: ${key} in namespace: ${ns}`);
  }
});

// Add loaded event for debugging
i18n.on('loaded', (loaded) => {
  console.log('i18n loaded resources:', loaded);
});

// Add language changed event
i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  console.log('Available resources for', lng, ':', i18n.getResourceBundle(lng, 'navigation'));
});

export default i18n;