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
      <div className="hidden lg:block border-b border-white/[0.07]" style={{ backgroundColor: '#151311' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-end gap-6 h-[38px]">
            <a
              href="tel:+18449548686"
              className="flex items-center gap-2 text-[#A8A39A] hover:text-[#E2C88B] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#C8A15B]" strokeWidth={1.6} />
              <span className="text-[11.5px] tracking-[0.04em] font-light">{t('phone', '(844) 954-8686')}</span>
            </a>

            <span className="w-px h-3.5 bg-white/[0.13]" />

            <LanguageSelector variant="transparent" />

            <span className="w-px h-3.5 bg-white/[0.13]" />

            <Link
              to="/portal"
              className="flex items-center gap-[7px] text-[#A8A39A] hover:text-[#E2C88B] transition-colors"
            >
              <User className="w-[13px] h-[13px]" strokeWidth={1.4} />
              <span className="text-[11.5px] tracking-[0.08em] font-light">{t('patientPortal', 'Patient Portal')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="border-b border-[#C8A15B]/[0.22]" style={{ background: 'linear-gradient(180deg, #1b1712 0%, #121110 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-[76px]">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo mode="dark" height={34} />
            </Link>

            {/* Desktop nav + CTA */}
            <div className="hidden lg:flex items-center gap-10">
              <nav className="flex items-center gap-10">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`text-[14.5px] tracking-[0.03em] font-normal transition-colors duration-200 ${
                      isActive(to) || isActivePath(to)
                        ? 'text-white'
                        : 'text-[#DAD6CE] hover:text-[#E2C88B]'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <span className="w-px h-[26px] bg-white/[0.13]" />

              <Link
                to="/book-consultation"
                className="inline-flex items-center h-[42px] px-6 border border-[#C8A15B] text-[#E2C88B] text-xs font-semibold tracking-[0.2em] rounded-[3px] hover:bg-[#C8A15B] hover:text-[#16130D] transition-all duration-200"
              >
                {t('bookConsultation', { defaultValue: 'BOOK CONSULT' })}
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/90"
              aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden pb-8 pt-4 border-t border-white/10">
              <div className="flex flex-col gap-5">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`text-sm font-light tracking-wide transition-colors ${
                      isActive(to) || isActivePath(to)
                        ? 'text-white'
                        : 'text-white/80 hover:text-[#E2C88B]'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                  <Link
                    to="/portal"
                    className="flex items-center gap-2 text-white/70 hover:text-[#E2C88B] text-sm font-light transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{t('patientPortal')}</span>
                  </Link>
                  <a
                    href="tel:+18449548686"
                    className="flex items-center gap-2 text-white/60 hover:text-[#E2C88B] text-sm"
                  >
                    <Phone className="w-4 h-4 text-[#C8A15B]" />
                    <span>{t('phone')}</span>
                  </a>
                  <div className="pt-2">
                    <LanguageSelector variant="transparent" />
                  </div>
                  <Link
                    to="/book-consultation"
                    className="inline-flex items-center justify-center h-[44px] border border-[#C8A15B] text-[#E2C88B] text-xs font-semibold tracking-[0.2em] rounded-[3px] hover:bg-[#C8A15B] hover:text-[#16130D] transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('bookConsultation', { defaultValue: 'BOOK CONSULT' })}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
