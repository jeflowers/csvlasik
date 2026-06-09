import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Menu, X, Globe, ChevronDown } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const { t, i18n } = useTranslation(['navigation', 'common', 'footer']);
  const isActive = (path: string) => location.pathname === path;
  const isActivePath = (path: string) => location.pathname.startsWith(path);

  const isRTL = i18n.dir() === 'rtl';

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/assets/images/atelier_nobg copy.png"
              alt={`${t('company.name', { ns: 'footer' })} - ${t('company.tagline', { ns: 'footer' })}`}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center ${isRTL ? 'space-x-reverse' : ''}`}>
            {/* Nav Links */}
            <div className={`flex items-center space-x-8 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Link
                to="/about"
                className={`text-white/90 hover:text-white transition-colors duration-200 text-sm font-light tracking-wide ${
                  isActive('/about') ? 'text-white border-b border-white/60 pb-0.5' : ''
                }`}
              >
                {t('thePractice', { defaultValue: 'The Practice' })}
              </Link>

              <Link
                to="/procedures"
                className={`text-white/90 hover:text-white transition-colors duration-200 text-sm font-light tracking-wide ${
                  isActivePath('/procedures') ? 'text-white border-b border-white/60 pb-0.5' : ''
                }`}
              >
                {t('procedures')}
              </Link>

              <Link
                to="/pacific-story"
                className={`text-white/90 hover:text-white transition-colors duration-200 text-sm font-light tracking-wide ${
                  isActive('/pacific-story') ? 'text-white border-b border-white/60 pb-0.5' : ''
                }`}
              >
                {t('drFlowers', { defaultValue: 'Dr. Flowers' })}
              </Link>

              <Link
                to="/blog"
                className={`text-white/90 hover:text-white transition-colors duration-200 text-sm font-light tracking-wide ${
                  isActive('/blog') ? 'text-white border-b border-white/60 pb-0.5' : ''
                }`}
              >
                {t('journal', { defaultValue: 'Journal' })}
              </Link>

              <Link
                to="/financing"
                className={`text-white/90 hover:text-white transition-colors duration-200 text-sm font-light tracking-wide ${
                  isActive('/financing') ? 'text-white border-b border-white/60 pb-0.5' : ''
                }`}
              >
                {t('financing')}
              </Link>

              <Link
                to="/contact"
                className={`text-white/90 hover:text-white transition-colors duration-200 text-sm font-light tracking-wide ${
                  isActive('/contact') ? 'text-white border-b border-white/60 pb-0.5' : ''
                }`}
              >
                {t('contact')}
              </Link>
            </div>

            {/* Right side: Phone + Language + CTA */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse mr-8' : 'ml-8'} space-x-5`}>
              <a
                href="tel:+18449548686"
                className={`flex items-center text-white/80 hover:text-white transition-colors duration-200 text-sm font-light ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                <span dir="ltr">{t('phone', { defaultValue: '(844) 954-8686' })}</span>
              </a>

              <LanguageSelector variant="transparent" />

              <Link
                to="/portal"
                className="border border-white/60 text-white px-5 py-2 rounded-full text-sm font-light hover:bg-white/10 transition-all duration-200 tracking-wide"
              >
                {t('book', { defaultValue: 'BOOK' })}
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white/90 hover:text-white"
            aria-label={isMenuOpen ? t('closeMenu', { ns: 'navigation' }) : t('menu', { ns: 'navigation' })}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-white/20 bg-black/40 backdrop-blur-md rounded-b-lg px-4">
            <div className={`flex flex-col space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <Link
                to="/about"
                className="text-white/90 hover:text-white font-light transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('thePractice', { defaultValue: 'The Practice' })}
              </Link>
              <Link
                to="/procedures"
                className="text-white/90 hover:text-white font-light transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('procedures')}
              </Link>
              <Link
                to="/pacific-story"
                className="text-white/90 hover:text-white font-light transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('drFlowers', { defaultValue: 'Dr. Flowers' })}
              </Link>
              <Link
                to="/blog"
                className="text-white/90 hover:text-white font-light transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('journal', { defaultValue: 'Journal' })}
              </Link>
              <Link
                to="/financing"
                className="text-white/90 hover:text-white font-light transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('financing')}
              </Link>
              <Link
                to="/contact"
                className="text-white/90 hover:text-white font-light transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('contact')}
              </Link>

              <div className="pt-4 border-t border-white/20">
                <a
                  href="tel:+18449548686"
                  className={`flex items-center text-white/80 hover:text-white mb-4 transition-colors duration-200 ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Phone className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span dir="ltr">{t('phone', { defaultValue: '(844) 954-8686' })}</span>
                </a>
                <div className="mb-4">
                  <LanguageSelector variant="transparent" />
                </div>
                <Link
                  to="/portal"
                  className="inline-block border border-white/60 text-white px-6 py-2.5 rounded-full text-sm font-light hover:bg-white/10 transition-all duration-200 tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('book', { defaultValue: 'BOOK' })}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
