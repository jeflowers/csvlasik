import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Menu, X, User } from 'lucide-react';
import Logo from './Logo';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation('navigation');
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isActivePath = (path: string) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/procedures', label: t('procedures', 'Procedures') },
    { to: '/about', label: t('drFlowers', 'Dr. Flowers') },
    { to: '/journal', label: t('journal', 'Journal') },
    { to: '/stories', label: t('stories', 'Stories') },
    { to: '/financing', label: t('financing', 'Financing') },
    { to: '/contact', label: t('contact', 'Contact') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gold accent line at very top */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A15B]/40 to-transparent" />

      {/* Top utility strip */}
      <div className="hidden lg:block border-b border-white/[0.06]" style={{ backgroundColor: '#131110' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-end gap-6 h-[36px]">
            <a
              href="tel:+18449548686"
              className="flex items-center gap-2 text-[#9B9690] hover:text-[#E2C88B] transition-colors"
            >
              <Phone className="w-3 h-3" strokeWidth={1.5} />
              <span className="text-[11px] tracking-[0.04em] font-light">{t('phone', '(844) 954-8686')}</span>
            </a>

            <span className="w-px h-3 bg-white/[0.12]" />

            <LanguageSelector variant="transparent" />

            <span className="w-px h-3 bg-white/[0.12]" />

            <Link
              to="/portal"
              className="flex items-center gap-[6px] text-[#9B9690] hover:text-[#E2C88B] transition-colors"
            >
              <User className="w-[12px] h-[12px]" strokeWidth={1.4} />
              <span className="text-[11px] tracking-[0.06em] font-light">{t('patientPortal', 'Patient Portal')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <nav
        className="border-b border-[#C8A15B]/[0.15]"
        style={{ background: 'linear-gradient(180deg, #1a1613 0%, #13110f 100%)' }}
        aria-label={t('mainNavigation', 'Main Navigation')}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-[78px]">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0" aria-label="Atelier LASIK Home">
              <Logo mode="dark" height={34} tagline={true} />
            </Link>

            {/* Desktop nav + CTA */}
            <div className="hidden lg:flex items-center gap-10">
              <ul className="flex items-center gap-7 xl:gap-9 list-none m-0 p-0">
                {navLinks.map(({ to, label }) => {
                  const active = isActive(to) || isActivePath(to);
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        className={`relative text-[14px] tracking-[0.02em] font-normal transition-colors duration-200 pb-1 whitespace-nowrap ${
                          active
                            ? 'text-[#C9A96E]'
                            : 'text-[#E0DCD6] hover:text-[#C9A96E]'
                        }`}
                      >
                        {label}
                        {active && (
                          <span className="absolute inset-x-0 -bottom-[2px] h-[1.5px] bg-[#C9A96E]/80" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link
                to="/book-consultation"
                className="inline-flex items-center h-[42px] px-7 bg-[#C9A96E] text-[#13110f] text-[11px] font-semibold tracking-[0.18em] uppercase rounded-[3px] hover:bg-[#D4AF37] transition-colors duration-200 whitespace-nowrap flex-shrink-0"
              >
                {t('bookConsultation', { defaultValue: 'BOOK CONSULTATION' })}
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/90"
              aria-label={isMenuOpen ? t('closeMenu', 'Close Menu') : t('openMenu', 'Open Menu')}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden pb-8 pt-4 border-t border-white/[0.08]" role="menu">
              <ul className="flex flex-col gap-5 list-none m-0 p-0">
                {navLinks.map(({ to, label }) => (
                  <li key={to} role="none">
                    <Link
                      key={to}
                      to={to}
                      role="menuitem"
                      className={`block text-[15px] font-light tracking-wide transition-colors ${
                        isActive(to) || isActivePath(to)
                          ? 'text-[#C9A96E]'
                          : 'text-white/80 hover:text-[#C9A96E]'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="pt-5 mt-5 border-t border-white/[0.08] flex flex-col gap-4">
                <Link
                  to="/portal"
                  className="flex items-center gap-2 text-white/60 hover:text-[#C9A96E] text-sm font-light transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>{t('patientPortal', 'Patient Portal')}</span>
                </Link>
                <a
                  href="tel:+18449548686"
                  className="flex items-center gap-2 text-white/50 hover:text-[#C9A96E] text-sm font-light"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('phone', '(844) 954-8686')}</span>
                </a>
                <div className="pt-2">
                  <LanguageSelector variant="transparent" />
                </div>
                <Link
                  to="/book-consultation"
                  className="inline-flex items-center justify-center h-[44px] bg-[#C9A96E] text-[#13110f] text-[11px] font-semibold tracking-[0.18em] uppercase rounded-[3px] hover:bg-[#D4AF37] transition-colors duration-200 mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('bookConsultation', { defaultValue: 'BOOK CONSULTATION' })}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
