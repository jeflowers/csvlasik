import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X, User } from 'lucide-react';
import Logo from './Logo';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isActivePath = (path: string) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/procedures', label: 'Procedures' },
    { to: '/about', label: 'Dr. Flowers' },
    { to: '/journal', label: 'Journal' },
    { to: '/financing', label: 'Financing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex-shrink-0">
            <Logo mode="dark" height={36} tagline={false} />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm font-light tracking-wide whitespace-nowrap transition-colors duration-200"
                style={{
                  color: isActive(to) || isActivePath(to) ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+18449548686"
              className="flex items-center gap-1.5 text-sm font-light whitespace-nowrap transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>(844) 954-8686</span>
            </a>
            <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <LanguageSelector variant="transparent" />
            <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <Link
              to="/portal"
              className="flex items-center gap-1.5 text-sm font-light whitespace-nowrap transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Portal</span>
            </Link>
            <Link
              to="/portal"
              className="px-5 py-2 text-xs font-medium tracking-widest whitespace-nowrap transition-colors duration-200 ml-2"
              style={{ backgroundColor: '#D4AF37', color: '#1A1A1A' }}
            >
              BOOK CONSULT
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2"
            style={{ color: 'rgba(255,255,255,0.9)' }}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden pb-8 pt-4 border-t border-white/10">
            <div className="flex flex-col gap-5">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-white/80 hover:text-white font-light text-sm tracking-wide transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                <Link
                  to="/portal"
                  className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-light"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Patient Portal</span>
                </Link>
                <a
                  href="tel:+18449548686"
                  className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>(844) 954-8686</span>
                </a>
                <div className="pt-2">
                  <LanguageSelector variant="transparent" />
                </div>
                <Link
                  to="/portal"
                  className="inline-block bg-bullion text-onyx px-6 py-3 text-xs font-medium tracking-widest text-center hover:bg-champagne transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  BOOK CONSULT
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
