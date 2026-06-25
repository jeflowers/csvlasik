import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, Shield, Clock } from 'lucide-react';
import Logo from '../components/Logo';

const heroImages = [
  '/assets/images/eyes/lana-graves-h0ZHYdy1qTI-unsplash.jpg',
  '/assets/images/eyes/luca-iaconelli-GmoHIZ61eMo-unsplash.jpg',
  '/assets/images/eyes/polina-kuzovkova-6VXBBFt_k9Q-unsplash.jpg',
  '/assets/images/eyes/simone-stallo-xpZ5AVjw67U-unsplash.jpg',
];

const Home = () => {
  const { t } = useTranslation('home');
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div className="flex flex-col items-start">
              <div className="mb-10">
                <Logo variant="stacked" mode="dark" height={48} />
              </div>
              <h1 className="font-serif font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.1]" style={{ color: '#FFFFFF' }}>
                {t('hero.title')}<br />
                <span style={{ color: '#C9A96E' }}>{t('hero.titleAccent')}</span>
              </h1>
              <p className="mt-6 font-light text-lg max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('hero.subtitle')}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to="/portal"
                  className="px-8 py-4 text-xs font-medium tracking-widest transition-colors duration-200"
                  style={{ backgroundColor: '#D4AF37', color: '#1A1A1A' }}
                >
                  {t('hero.cta.schedule')}
                </Link>
                <Link
                  to="/procedures"
                  className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-light transition-colors group py-4"
                >
                  <span>{t('hero.cta.explore')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Image carousel */}
            <div className="relative">
              <div className="aspect-[4/3] relative overflow-hidden rounded-sm">
                {heroImages.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: index === currentImage ? 1 : 0 }}
                  />
                ))}
                <div className="absolute inset-0 ring-1 ring-white/10 rounded-sm pointer-events-none" />
              </div>
              {/* Carousel indicators */}
              <div className="mt-5 flex items-center gap-2 justify-center">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentImage
                        ? 'w-8 h-2 bg-bullion'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bullion/30 to-transparent" />
      </section>

      {/* Procedures */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36">
          <div className="text-center mb-20">
            <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
              {t('procedures.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx">
              {t('procedures.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-onyx/10">
            {[
              {
                title: t('procedures.lasik.title'),
                description: t('procedures.lasik.description'),
                detail: t('procedures.lasik.detail'),
                link: '/procedures/lasik',
              },
              {
                title: t('procedures.prk.title'),
                description: t('procedures.prk.description'),
                detail: t('procedures.prk.detail'),
                link: '/procedures/prk',
              },
              {
                title: t('procedures.icl.title'),
                description: t('procedures.icl.description'),
                detail: t('procedures.icl.detail'),
                link: '/procedures/icl',
              },
            ].map((proc) => (
              <Link
                key={proc.link}
                to={proc.link}
                className="bg-white p-10 lg:p-14 group hover:bg-cream/50 transition-colors duration-300"
              >
                <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-6">
                  {proc.detail}
                </span>
                <h3 className="font-serif font-semibold text-2xl lg:text-3xl text-onyx mb-4">
                  {proc.title}
                </h3>
                <p className="text-graphite/60 text-sm font-light leading-relaxed mb-8">
                  {proc.description}
                </p>
                <span className="flex items-center gap-2 text-sm text-onyx/70 group-hover:text-onyx font-light transition-colors">
                  {t('procedures.learnMore')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pioneer Story */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
                {t('pioneer.eyebrow')}
              </span>
              <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx leading-[1.15] mb-8">
                {t('pioneer.title')}
              </h2>
              <p className="text-graphite/60 font-light leading-relaxed mb-6">
                {t('pioneer.paragraph1')}
              </p>
              <p className="text-graphite/60 font-light leading-relaxed mb-10">
                {t('pioneer.paragraph2')}
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm text-onyx font-light border-b border-onyx/20 pb-1 hover:border-onyx transition-colors group"
              >
                {t('pioneer.readMore')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-onyx/5 overflow-hidden">
                <img
                  src="/assets/images/team/drflowers/dr-flowers-headshot.jpg"
                  alt="Dr. Charles Flowers, MD"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-chopard">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-semibold text-3xl text-onyx">{t('pioneer.stat')}</span>
                  <span className="text-xs text-champagne font-medium tracking-eyebrow uppercase">{t('pioneer.statLabel')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Atelier */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36">
          <div className="text-center mb-20">
            <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
              {t('whyAtelier.eyebrow')}
            </span>
            <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx">
              {t('whyAtelier.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                icon: Eye,
                title: t('whyAtelier.wavefront.title'),
                description: t('whyAtelier.wavefront.description'),
              },
              {
                icon: Shield,
                title: t('whyAtelier.expertise.title'),
                description: t('whyAtelier.expertise.description'),
              },
              {
                icon: Clock,
                title: t('whyAtelier.consultations.title'),
                description: t('whyAtelier.consultations.description'),
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 border border-champagne/30 mb-6">
                  <Icon className="w-5 h-5 text-champagne" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif font-semibold text-xl text-onyx mb-3">{title}</h3>
                <p className="text-graphite/60 text-sm font-light leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-28 lg:py-36 text-center relative">
          <span className="text-xs font-sans font-medium tracking-eyebrow uppercase block mb-12" style={{ color: '#C9A96E' }}>
            {t('testimonial.eyebrow')}
          </span>
          <blockquote className="font-serif font-semibold text-2xl sm:text-3xl lg:text-4xl leading-snug mb-8" style={{ color: '#FFFFFF' }}>
            &ldquo;{t('testimonial.quote')}&rdquo;
          </blockquote>
          <cite className="not-italic text-sm font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
            &mdash; {t('testimonial.author')}
          </cite>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)' }} />
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-28 lg:py-36 text-center">
          <span className="text-xs font-sans font-medium tracking-eyebrow text-champagne uppercase block mb-4">
            {t('cta.eyebrow')}
          </span>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl lg:text-5xl text-onyx mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-graphite/60 font-light leading-relaxed max-w-lg mx-auto mb-10">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/portal"
              className="bg-bullion text-onyx px-8 py-4 text-xs font-medium tracking-widest hover:bg-champagne transition-colors duration-200"
            >
              {t('cta.schedule')}
            </Link>
            <a
              href="tel:+18449548686"
              className="text-sm text-graphite/60 hover:text-onyx font-light transition-colors"
            >
              {t('cta.orCall')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
