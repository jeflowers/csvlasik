import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const { t } = useTranslation('footer');

  return (
    <footer className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-8">
              <Logo mode="light" height={40} />
            </Link>
            <p className="text-graphite/60 text-sm font-light leading-relaxed max-w-sm">
              {t('company.description')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase mb-6">
              {t('quickLinks.title')}
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/procedures" className="text-sm text-graphite/70 hover:text-onyx font-light transition-colors">
                {t('procedures.title')}
              </Link>
              <Link to="/about" className="text-sm text-graphite/70 hover:text-onyx font-light transition-colors">
                {t('quickLinks.about')}
              </Link>
              <Link to="/testimonials" className="text-sm text-graphite/70 hover:text-onyx font-light transition-colors">
                {t('quickLinks.testimonials')}
              </Link>
              <Link to="/financing" className="text-sm text-graphite/70 hover:text-onyx font-light transition-colors">
                {t('procedures.consultation', { defaultValue: 'Financing' })}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase mb-6">
              {t('contact.title')}
            </h4>
            <div className="flex flex-col gap-4">
              <a href="tel:+18449548686" className="flex items-start gap-3 text-sm text-graphite/70 hover:text-onyx font-light transition-colors">
                <Phone className="w-4 h-4 mt-0.5 text-champagne flex-shrink-0" />
                <span>{t('contact.phone')}</span>
              </a>
              <a href="mailto:info@atelierlasik.com" className="flex items-start gap-3 text-sm text-graphite/70 hover:text-onyx font-light transition-colors">
                <Mail className="w-4 h-4 mt-0.5 text-champagne flex-shrink-0" />
                <span>{t('contact.email')}</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-graphite/70 font-light">
                <MapPin className="w-4 h-4 mt-0.5 text-champagne flex-shrink-0" />
                <span>5750 Downey Ave., Suite 101<br />Lakewood, CA 90712</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-onyx/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-graphite/50 font-light">
            &copy; {new Date().getFullYear()} Atelier &mdash; Dr. Charles Flowers, MD. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-xs text-graphite/50 hover:text-onyx font-light transition-colors">
              {t('legal.privacy')}
            </Link>
            <Link to="/terms-of-service" className="text-xs text-graphite/50 hover:text-onyx font-light transition-colors">
              {t('legal.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
