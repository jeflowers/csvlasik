import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);

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

  const computePosition = useCallback(() => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelWidth = 280;
    let left = rect.right - panelWidth;
    if (left < 8) left = 8;
    if (isRTL) left = rect.left;
    return { top: rect.bottom + 8, left };
  }, [isRTL]);

  const openPanel = useCallback(() => {
    const pos = computePosition();
    if (pos) {
      setPanelPos(pos);
      setIsOpen(true);
    }
  }, [computePosition]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setPanelPos(null);
  }, []);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }, [isOpen, openPanel, closePanel]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is inside panel bounding box (covers scrollbar clicks)
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          return;
        }
      }
      if (
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        closePanel();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };

    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside the panel itself
      if (panelRef.current && panelRef.current.contains(e.target as Node)) {
        return;
      }
      closePanel();
    };

    const handleResize = () => {
      const pos = computePosition();
      if (pos) setPanelPos(pos);
    };

    // Delay attaching outside-click to avoid closing on the same click that opened
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, computePosition, closePanel]);

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

      closePanel();

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
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
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

      {isOpen && panelPos && createPortal(
        <div
          ref={panelRef}
          data-app="language-selector"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="min-w-[280px] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto animate-in fade-in duration-150"
          style={{
            position: 'fixed',
            top: panelPos.top,
            left: panelPos.left,
            zIndex: 2147483646,
          }}
          role="menu"
        >
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
                  i18n.language === language.code ? 'bg-cream text-gray-900' : 'text-gray-700'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
                role="menuitem"
              >
                <div className={`flex items-center flex-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-2xl flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>{language.flag}</span>
                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="text-sm font-medium truncate">{language.nativeName}</div>
                    <div className="text-xs text-gray-500 truncate">{language.name} &bull; {language.country}</div>
                  </div>
                </div>
                {i18n.language === language.code && (
                  <Check className={`h-4 w-4 text-bullion flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`} />
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
                        i18n.language === language.code ? 'bg-cream text-gray-900' : 'text-gray-700'
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                      role="menuitem"
                    >
                      <div className={`flex items-center flex-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-2xl flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>{language.flag}</span>
                        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="text-sm font-medium truncate">{language.nativeName}</div>
                          <div className="text-xs text-gray-500 truncate">{language.name} &bull; {language.country}</div>
                        </div>
                      </div>
                      {i18n.language === language.code && (
                        <Check className={`h-4 w-4 text-bullion flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      )}
                    </button>
                  ))}
                </div>
              )
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <p className={`text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('translationNote', { ns: 'navigation' })}
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default LanguageSelector;
