import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { createMissingKeyHandler } from './missingKeyHandler';

// Demographic groups for language organization
export const DEMOGRAPHIC_GROUPS = {
  SOUTHERN_CALIFORNIA: 'Southern California Communities',
  PACIFIC_ISLANDS: 'Pacific Islands Communities',
  ADDITIONAL: 'Additional Languages'
} as const;

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
    priority: 'source',
    demographic: null,
    order: 0
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
    fallback: 'en',
    demographic: DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA,
    order: 1
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    country: 'South Korea',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA,
    order: 2
  },
  zh: {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    country: 'China',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA,
    order: 3
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    country: 'Vietnam',
    rtl: false,
    services: { deepl: false, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA,
    order: 4
  },
  hy: {
    code: 'hy',
    name: 'Armenian',
    nativeName: 'Հայերեն',
    flag: '🇦🇲',
    country: 'Armenia',
    rtl: false,
    services: { deepl: false, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA,
    order: 5
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    flag: '🇵🇭',
    country: 'Philippines',
    rtl: false,
    services: { deepl: false, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.PACIFIC_ISLANDS,
    order: 6
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    country: 'Japan',
    rtl: false,
    services: { deepl: true, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.PACIFIC_ISLANDS,
    order: 7
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
    fallback: 'pt',
    demographic: DEMOGRAPHIC_GROUPS.ADDITIONAL,
    order: 8
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    rtl: true,
    services: { deepl: true, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.ADDITIONAL,
    order: 9
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    country: 'Israel',
    rtl: true,
    services: { deepl: true, google: true },
    priority: 'standard',
    demographic: DEMOGRAPHIC_GROUPS.ADDITIONAL,
    order: 10
  }
};

// Medical terminology that should NOT be translated
export const MEDICAL_PROTECTED_TERMS = [
  'LASIK',
  'PRK',
  'ICL',
  'FDA',
  'Dr. Charles Flowers',
  'Atelier',
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
    resources: {
      en: {
        navigation: {
          procedures: 'Procedures',
          drFlowers: 'Dr. Flowers',
          journal: 'Journal',
          financing: 'Financing',
          contact: 'Contact',
          phone: '(844) 954-8686',
          patientPortal: 'Patient Portal',
          bookConsultation: 'Book Consultation',
          closeMenu: 'Close Menu',
          openMenu: 'Open Menu'
        }
      }
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'default'
      },
      crossDomain: false,
      withCredentials: false
    },
    partialBundledLanguages: true,
    load: 'currentOnly',
    supportedLngs: ['en', 'es-MX', 'ko', 'zh', 'vi', 'hy', 'tl', 'ja', 'pt-BR', 'ar', 'he'],
    fallbackLng: {
      'pt-BR': ['pt', 'en'],
      'es-MX': ['en'],
      'default': ['en']
    },
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
    missingKeyHandler: createMissingKeyHandler(i18n),
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added loaded',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i']
    },
    initImmediate: false,
    ns: ['navigation', 'common', 'medical', 'forms', 'patientForms', 'procedures', 'home', 'about', 'contact', 'financing', 'technology', 'testimonials', 'footer', 'privacy', 'terms', 'cookies', 'pacific', 'media'],
    defaultNS: 'navigation',
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

// Add error handling for translation loading (only in development)
if (import.meta.env.DEV) {
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

  i18n.on('missingKey', (lng, ns, key) => {
    if (lng === 'pt-BR') {
      console.warn(`pt-BR missing key: ${key} in namespace: ${ns}`);
    }
  });

  i18n.on('loaded', (loaded) => {
    console.log('i18n loaded resources:', Object.keys(loaded));
  });

  i18n.on('languageChanged', (lng) => {
    console.log('Language changed to:', lng);
  });
}

export default i18n;