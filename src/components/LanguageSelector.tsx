import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, DEMOGRAPHIC_GROUPS } from '../i18n';
import Cookies from 'js-cookie';

interface LanguageSelectorProps {
  variant?: 'transparent' | 'dark';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'dark' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = SUPPORTED_LANGUAGES[i18n.language as keyof typeof SUPPORTED_LANGUAGES] || SUPPORTED_LANGUAGES.en;
  const isRTL = i18n.dir() === 'rtl';

  const groupedLanguages = useMemo(() => {
    const sortedLanguages = Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.order - b.order);

    const groups: { [key: string]: typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES][] } = {
      default: [],
      [DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA]: [],
      [DEMOGRAPHIC_GROUPS.PACIFIC_ISLANDS]: [],
      [DEMOGRAPHIC_GROUPS.ADDITIONAL]: []
    };

    sortedLanguages.forEach(language => {
      if (language.demographic === null) {
        groups.default.push(language);
      } else {
        groups[language.demographic].push(language);
      }
    });

    return groups;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      Cookies.set('i18next', languageCode, { expires: 365 });

      const language = SUPPORTED_LANGUAGES[languageCode as keyof typeof SUPPORTED_LANGUAGES];
      document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;

      if (language?.rtl) {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }

      setIsOpen(false);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'language_change', {
          event_category: 'engagement',
          event_label: languageCode,
        });
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const buttonStyles = variant === 'transparent'
    ? 'text-white/80 hover:text-white'
    : 'text-gray-700 hover:text-gray-900';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 px-2 py-1.5 text-sm font-light transition-colors duration-200 ${buttonStyles} ${
          isRTL ? 'space-x-reverse' : ''
        }`}
        aria-label={t('selectLanguage', { ns: 'navigation' })}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 min-w-[280px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-y-auto ${
          isRTL ? 'left-0' : 'right-0'
        }`}>
          <div className="p-3 border-b border-gray-100">
            <h3 className={`text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('selectLanguage', { ns: 'navigation' })}
            </h3>
          </div>

          <div className="py-2">
            {groupedLanguages.default.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                  i18n.language === language.code ? 'bg-teal-50 text-teal-900' : 'text-gray-700'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
                role="menuitem"
              >
                <div className={`flex items-center flex-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-2xl flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>{language.flag}</span>
                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-sm font-medium truncate">{language.nativeName}</div>
                    <div className="text-xs text-gray-500 truncate">{language.name} • {language.country}</div>
                  </div>
                </div>
                {i18n.language === language.code && (
                  <Check className={`h-4 w-4 text-teal-600 flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                )}
              </button>
            ))}

            {[DEMOGRAPHIC_GROUPS.SOUTHERN_CALIFORNIA, DEMOGRAPHIC_GROUPS.PACIFIC_ISLANDS, DEMOGRAPHIC_GROUPS.ADDITIONAL].map((groupName) => (
              groupedLanguages[groupName] && groupedLanguages[groupName].length > 0 && (
                <div key={groupName}>
                  <div className="px-4 py-2 mt-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {groupName}
                    </div>
                  </div>
                  {groupedLanguages[groupName].map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                        i18n.language === language.code ? 'bg-teal-50 text-teal-900' : 'text-gray-700'
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                      role="menuitem"
                    >
                      <div className={`flex items-center flex-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-2xl flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>{language.flag}</span>
                        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="text-sm font-medium truncate">{language.nativeName}</div>
                          <div className="text-xs text-gray-500 truncate">{language.name} • {language.country}</div>
                        </div>
                      </div>
                      {i18n.language === language.code && (
                        <Check className={`h-4 w-4 text-teal-600 flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      )}
                    </button>
                  ))}
                </div>
              )
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <p className={`text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('translationNote', { ns: 'navigation' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
