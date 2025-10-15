import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Phone, Mail, MapPin, Facebook, Twitter, Instagram, BookText as TikTok, Youtube, BadgeHelp as Yelp } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation(['footer', 'common']);

  return (
    <footer className="chopard-gradient text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="chopard-gradient p-3 rounded-lg chopard-shadow">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-serif chopard-text-primary leading-tight text-white">{t('company.name')}</h3>
                <p className="text-xs chopard-text-secondary font-light tracking-widest uppercase text-white/70">{t('company.tagline')}</p>
              </div>
            </Link>
            <p className="text-white/70 text-sm mb-6 leading-relaxed font-light">
              {t('company.description')}
            </p>
            <div className="flex space-x-5">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-all duration-300"
                aria-label={t('social.facebook')}
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-all duration-300"
                aria-label={t('social.instagram')}
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-all duration-300"
                aria-label={t('social.youtube')}
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-all duration-300"
                aria-label={t('social.twitter')}
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-all duration-300"
                aria-label={t('social.tiktok')}
              >
                <TikTok className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-light mb-6 text-white tracking-wide">{t('quickLinks.title')}</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('quickLinks.about')}</Link></li>
              <li><Link to="/procedures" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('quickLinks.allProcedures')}</Link></li>
              <li><Link to="/pacific-story" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('quickLinks.pacificStory')}</Link></li>
              <li><Link to="/testimonials" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('quickLinks.testimonials')}</Link></li>
              <li><Link to="/technology" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('quickLinks.technology')}</Link></li>
            </ul>
          </div>

          {/* Procedures */}
          <div>
            <h3 className="text-lg font-serif font-light mb-6 text-white tracking-wide">{t('procedures.title')}</h3>
            <ul className="space-y-4">
              <li><Link to="/procedures/lasik" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('procedures.lasik')}</Link></li>
              <li><Link to="/procedures/prk" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('procedures.prk')}</Link></li>
              <li><Link to="/procedures/icl" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('procedures.icl')}</Link></li>
              <li><Link to="/blog" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('procedures.blog')}</Link></li>
              <li><Link to="/contact" className="text-white/70 hover:text-white transition-all duration-300 font-light">{t('procedures.consultation')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-light mb-6 text-white tracking-wide">{t('contact.title')}</h3>
            <div className="space-y-5">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Clearsight+LASIK+Guam,+230+Archbishop+Flores+Street,+Suite+201,+Hagåtña,+Guam+96910"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-4 hover:opacity-80 transition-opacity duration-300"
                aria-label="Get directions to our office"
              >
                <MapPin className="h-5 w-5 chopard-text-accent mt-1" />
                <div>
                  <p className="text-white font-light text-sm">{t('contact.office')}</p>
                  <p className="text-white/70 text-sm leading-relaxed font-light">{t('contact.address')}</p>
                </div>
              </a>
              <a href="tel:+18442115462" className="flex items-center space-x-4 text-white/70 hover:text-white transition-all duration-300 font-light">
                <span className="inline-flex items-center space-x-4" dir="ltr">
                  <Phone className="h-5 w-5 chopard-text-accent" />
                  <span className="font-light">
                    {t('contact.phone')}
                  </span>
                </span>
              </a>
              <div className="flex items-center space-x-4">
                <Mail className="h-5 w-5 chopard-text-accent" />
                <a href="mailto:info@clearsightlasik.com" className="text-white/70 hover:text-white transition-all duration-300 font-light">
                  {t('contact.email')}
                </a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <h4 className="text-sm font-light mb-3 chopard-text-accent">{t('newsletter.title')}</h4>
              <p className="text-xs text-white/70 mb-4 leading-relaxed font-light">{t('newsletter.description')}</p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder={t('newsletter.placeholder')}
                  className="w-full px-3 py-2 bg-white/20 text-white text-sm rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-white/50 backdrop-blur-sm font-light"
                />
                <button className="w-full chopard-accent text-white px-4 py-2 rounded-lg text-sm font-light hover:bg-opacity-90 transition-all duration-300">
                  {t('newsletter.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-white/60 font-light">
            <p>{t('legal.copyright')}</p>
            <span className="hidden md:inline">|</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">{t('legal.privacy')}</Link>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">{t('legal.terms')}</a>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs chopard-text-accent font-light border border-white/20">
              {t('badge.pacificMission')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;