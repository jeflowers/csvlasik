import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Phone, Menu, X, ChevronDown, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import TikTokIcon from './icons/TikTokIcon';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProceduresOpen, setIsProceduresOpen] = useState(false);
  const [isTestimonialsOpen, setIsTestimonialsOpen] = useState(false);
  const location = useLocation();

  const { t, i18n } = useTranslation(['navigation', 'common']);
  const isActive = (path: string) => location.pathname === path;
  const isActivePath = (path: string) => location.pathname.startsWith(path);

  // Get current language info for RTL support and debugging
  const isRTL = i18n.dir() === 'rtl';
  const currentLang = i18n.language;
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, dropdownType: 'procedures' | 'testimonials') => {
    if (e.key === 'Escape') {
      if (dropdownType === 'procedures') {
        setIsProceduresOpen(false);
      } else {
        setIsTestimonialsOpen(false);
      }
      // Return focus to the toggle button
      (e.target as HTMLElement).focus();
    }
  };

  // Handle outside clicks
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown="procedures"]')) {
        setIsProceduresOpen(false);
      }
      if (!target.closest('[data-dropdown="testimonials"]')) {
        setIsTestimonialsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/98 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
      {/* Top Bar */}
      <div className="chopard-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Social Media Icons */}
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label={t('socialMedia.instagram', { defaultValue: 'Instagram' })}
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label={t('socialMedia.facebook', { defaultValue: 'Facebook' })}
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label={t('socialMedia.youtube', { defaultValue: 'YouTube' })}
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label={t('socialMedia.twitter', { defaultValue: 'X (Twitter)' })}
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-all duration-300"
                aria-label={t('socialMedia.tiktok', { defaultValue: 'TikTok' })}
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>

            {/* Contact Info */}
            <div className={`flex items-center space-x-6 text-sm font-medium ${isRTL ? 'space-x-reverse' : ''}`}>
              <Link to="/contact" className="flex items-center hover:text-gray-200 transition-colors">
                <Mail className={`h-4 w-4 text-white ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{t('contactUs')}</span>
              </Link>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center py-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <Link to="/" className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="relative">
              <div className="chopard-gradient p-3 rounded-lg shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="text-2xl font-serif chopard-text-primary leading-tight">{t('brandName', { ns: 'common' })}</h1>
              <p className="text-xs chopard-text-secondary font-light tracking-widest uppercase">{t('tagline', { ns: 'common' })}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center space-x-8 ${isRTL ? 'space-x-reverse ml-16' : 'ml-16'}`}>
            <Link
              to="/"
              className={`chopard-text-secondary hover:chopard-text-primary transition-all duration-300 font-light text-sm tracking-wide ${
                isActive('/') ? 'chopard-text-primary border-b border-gray-900 pb-1' : ''
              }`}
            >
              {t('home')}
            </Link>
            
            {/* Procedures Split-Link Dropdown */}
            <div className="relative" data-dropdown="procedures">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Link
                  to="/procedures"
                  className={`chopard-text-secondary hover:chopard-text-primary transition-all duration-300 font-light text-sm tracking-wide ${
                    isActivePath('/procedures') ? 'chopard-text-primary border-b border-gray-900 pb-1' : ''
                  }`}
                >
                  {t('procedures')}
                </Link>
                <button
                  onClick={() => setIsProceduresOpen(!isProceduresOpen)}
                  onMouseEnter={() => setIsProceduresOpen(true)}
                  onKeyDown={(e) => handleKeyDown(e, 'procedures')}
                  className={`${isRTL ? 'mr-1' : 'ml-1'} p-1 chopard-text-secondary hover:chopard-text-primary transition-all duration-300`}
                  aria-haspopup="menu"
                  aria-expanded={isProceduresOpen}
                  aria-label="Open procedures submenu"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProceduresOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {isProceduresOpen && (
                <div
                  onMouseEnter={() => setIsProceduresOpen(true)}
                  onMouseLeave={() => setIsProceduresOpen(false)}
                  className={`absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 ${
                    isRTL ? 'right-0' : 'left-0'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                  role="menu"
                  aria-label="Procedures submenu"
                >
                  <Link 
                    to="/procedures/lasik" 
                    onClick={() => setIsProceduresOpen(false)}
                    className={`block px-4 py-3 chopard-text-secondary hover:bg-gray-50 hover:chopard-text-primary transition-all duration-200 font-light ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    role="menuitem"
                  >
                    {t('lasikSurgery')}
                  </Link>
                  <Link 
                    to="/procedures/prk" 
                    onClick={() => setIsProceduresOpen(false)}
                    className={`block px-4 py-3 chopard-text-secondary hover:bg-gray-50 hover:chopard-text-primary transition-all duration-200 font-light ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    role="menuitem"
                  >
                    {t('prkSurgery')}
                  </Link>
                  <Link 
                    to="/procedures/icl" 
                    onClick={() => setIsProceduresOpen(false)}
                    className={`block px-4 py-3 chopard-text-secondary hover:bg-gray-50 hover:chopard-text-primary transition-all duration-200 font-light ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    role="menuitem"
                  >
                    {t('icl')}
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`chopard-text-secondary hover:chopard-text-primary transition-all duration-300 font-light text-sm tracking-wide ${
                isActive('/about') ? 'chopard-text-primary border-b border-gray-900 pb-1' : ''
              }`}
            >
              {t('about')}
            </Link>

            {/* Testimonials Split-Link Dropdown */}
            <div className="relative" data-dropdown="testimonials">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Link
                  to="/testimonials"
                  className={`chopard-text-secondary hover:chopard-text-primary transition-all duration-300 font-light text-sm tracking-wide ${
                    isActive('/testimonials') ? 'chopard-text-primary border-b border-gray-900 pb-1' : ''
                  }`}
                >
                  {t('testimonials')}
                </Link>
                <button
                  onClick={() => setIsTestimonialsOpen(!isTestimonialsOpen)}
                  onMouseEnter={() => setIsTestimonialsOpen(true)}
                  onKeyDown={(e) => handleKeyDown(e, 'testimonials')}
                  className={`${isRTL ? 'mr-1' : 'ml-1'} p-1 chopard-text-secondary hover:chopard-text-primary transition-all duration-300`}
                  aria-haspopup="menu"
                  aria-expanded={isTestimonialsOpen}
                  aria-label="Open testimonials submenu"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isTestimonialsOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {isTestimonialsOpen && (
                <div
                  onMouseEnter={() => setIsTestimonialsOpen(true)}
                  onMouseLeave={() => setIsTestimonialsOpen(false)}
                  className={`absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 ${
                    isRTL ? 'right-0' : 'left-0'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                  role="menu"
                  aria-label="Testimonials submenu"
                >
                  <Link 
                    to="/testimonials?filter=featured" 
                    onClick={() => setIsTestimonialsOpen(false)}
                    className={`block px-4 py-3 chopard-text-secondary hover:bg-gray-50 hover:chopard-text-primary transition-all duration-200 font-light ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    role="menuitem"
                  >
                    {t('featuredStories')}
                  </Link>
                  <Link 
                    to="/testimonials?filter=procedure" 
                    onClick={() => setIsTestimonialsOpen(false)}
                    className={`block px-4 py-3 chopard-text-secondary hover:bg-gray-50 hover:chopard-text-primary transition-all duration-200 font-light ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    role="menuitem"
                  >
                    {t('byProcedure')}
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/blog"
              className={`chopard-text-secondary hover:chopard-text-primary transition-all duration-300 font-light text-sm tracking-wide ${
                isActive('/blog') ? 'chopard-text-primary border-b border-gray-900 pb-1' : ''
              }`}
            >
              {t('media')}
            </Link>
            <Link
              to="/financing"
              className={`chopard-text-secondary hover:chopard-text-primary transition-all duration-300 font-light text-sm tracking-wide ${
                isActive('/financing') ? 'chopard-text-primary border-b border-gray-900 pb-1' : ''
              }`}
            >
              {t('financing')}
            </Link>
            <Link
              to="/contact"
              className={`chopard-text-secondary hover:chopard-text-primary transition-all duration-300 font-light text-sm tracking-wide ${
                isActive('/contact') ? 'chopard-text-primary border-b border-gray-900 pb-1' : ''
              }`}
            >
              {t('contact')}
            </Link>
            <Link
              to="/book-consultation"
              className="chopard-button px-6 py-2.5 rounded-lg text-sm transition-all duration-300"
            >
              {t('bookConsultation', { defaultValue: 'Book Consultation' })}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md chopard-text-secondary hover:chopard-text-primary"
            aria-label={isMenuOpen ? t('closeMenu', { ns: 'navigation' }) : t('menu', { ns: 'navigation' })}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t chopard-border bg-white/95 backdrop-blur-sm">
            <div className={`flex flex-col space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <Link 
                to="/" 
                className="chopard-text-secondary hover:chopard-text-primary font-light transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link 
                to="/procedures" 
                className="chopard-text-secondary hover:chopard-text-primary font-light transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('procedures')}
              </Link>
              <Link 
                to="/about" 
                className="chopard-text-secondary hover:chopard-text-primary font-light transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('about')}
              </Link>
              <Link 
                to="/testimonials" 
                className="chopard-text-secondary hover:chopard-text-primary font-light transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('testimonials')}
              </Link>
              <Link 
                to="/blog" 
                className="chopard-text-secondary hover:chopard-text-primary font-light transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('blog')}
              </Link>
              <Link 
                to="/financing" 
                className="chopard-text-secondary hover:chopard-text-primary font-light transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('financing')}
              </Link>
              <Link 
                to="/contact" 
                className="chopard-text-secondary hover:chopard-text-primary font-light transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('contact')}
              </Link>
              <div className="pt-4 border-t chopard-border">
                <a 
                  href="tel:+18442115462" 
                  className={`flex items-center chopard-text-secondary mb-3 hover:chopard-text-primary transition-all duration-300 ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Phone className={`h-4 w-4 chopard-text-accent ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className={`font-semibold ${isRTL ? 'font-arabic' : ''}`} dir="ltr">
                    {t('phone', { defaultValue: '(844) 211-5462' })}
                  </span>
                </a>
                <div className="mt-4">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;