import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isActivePath = (path: string) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/procedures', label: 'The Procedure' },
    { to: '/about', label: 'Dr. Flowers' },
    { to: '/testimonials', label: 'Results' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-onyx">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex-shrink-0">
            <Logo mode="dark" height={36} tagline={false} />
          </Link>

          <nav className="hidden lg:flex items-center gap-12">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-light tracking-wide transition-colors duration-200 ${
                  isActive(to) || isActivePath(to)
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <a
              href="tel:+18449548686"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-light transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>(844) 954-8686</span>
            </a>
            <Link
              to="/portal"
              className="bg-bullion text-onyx px-6 py-2.5 text-xs font-medium tracking-widest hover:bg-champagne transition-colors duration-200"
            >
              BOOK CONSULT
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-white/90 hover:text-white"
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
                <a
                  href="tel:+18449548686"
                  className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>(844) 954-8686</span>
                </a>
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
