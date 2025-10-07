import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

interface RTLProviderProps {
  children: React.ReactNode;
}

const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLanguage = SUPPORTED_LANGUAGES[i18n.language as keyof typeof SUPPORTED_LANGUAGES];
    const isRTL = currentLanguage?.rtl || false;
    
    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Add RTL class to body for CSS targeting
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
    
    // Update meta tags for RTL languages
    let metaDir = document.querySelector('meta[name="direction"]');
    if (!metaDir) {
      metaDir = document.createElement('meta');
      metaDir.setAttribute('name', 'direction');
      document.head.appendChild(metaDir);
    }
    metaDir.setAttribute('content', isRTL ? 'rtl' : 'ltr');
    
    // Load RTL-specific fonts if needed
    if (isRTL && !document.getElementById('rtl-fonts')) {
      const link = document.createElement('link');
      link.id = 'rtl-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+Hebrew:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    } else if (!isRTL && document.getElementById('rtl-fonts')) {
      // Remove RTL fonts when switching to LTR language
      const rtlFonts = document.getElementById('rtl-fonts');
      if (rtlFonts) {
        rtlFonts.remove();
      }
    }
    
    // Announce language change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Language changed to ${currentLanguage?.nativeName || 'English'}`;
    document.body.appendChild(announcement);
    
    // Remove announcement after screen reader has time to read it
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, [i18n.language]);

  return <>{children}</>;
};

export default RTLProvider;