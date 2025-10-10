import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
//import { Eye, Star, ArrowRight, Users, Calendar, Award, MapPin, Phone } from 'lucide-react';
import {
  Eye,
  Star,
  ArrowRight,
  Users,
  Calendar,
  Award,
  MapPin,
  Phone,
  Check,
  ChevronRight,
  Clock,
  Shield,
  Heart,
} from 'lucide-react';

const Home = () => {
  const { t } = useTranslation(['home', 'common']);
  const [procedureCount, setProcedureCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Array of hero images with actual filenames
  const heroImages = [
    {
      src: '/assets/images/eyes/eric-ward-ES60LMf18KU-unsplash.jpg',
      alt: 'Advanced vision technology',
    },
    {
      src: '/assets/images/eyes/lana-graves-h0ZHYdy1qTI-unsplash.jpg',
      alt: 'Crystal clear vision results',
    },
    {
      src: '/assets/images/eyes/luca-iaconelli-GmoHIZ61eMo-unsplash.jpg',
      alt: 'Precision eye care',
    },
    {
      src: '/assets/images/eyes/polina-kuzovkova-6VXBBFt_k9Q-unsplash.jpg',
      alt: 'Revolutionary vision correction',
    },
    {
      src: '/assets/images/eyes/simone-stallo-xpZ5AVjw67U-unsplash.jpg',
      alt: 'Advanced eye care technology',
    },
  ];

  useEffect(() => {
    const targetCount = 30000;
    const duration = 2000;
    const increment = targetCount / (duration / 16);

    const timer = setInterval(() => {
      setProcedureCount((prev) => {
        const next = prev + increment;
        if (next >= targetCount) {
          clearInterval(timer);
          return targetCount;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, []);

  // Add image carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative chopard-hero py-24 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-serif chopard-text-primary leading-tight">
                  {t('hero.title')}
                  <br />
                  <span className="chopard-text-accent">
                    {t('hero.titleAccent')}
                  </span>
                </h1>

                <p className="text-xl chopard-text-secondary leading-relaxed font-light">
                  {t('hero.subtitle')}
                </p>

                <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border">
                  <Award className="h-5 w-5 mr-3 chopard-text-accent" />
                  {t('hero.badge')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 mt-10">
                <Link
                  to="/contact"
                  className="inline-flex items-center chopard-button px-10 py-4 rounded-lg transition-all duration-300"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  {t('hero.cta.schedule')}
                </Link>
                <a
                  href="tel:+18442115462"
                  className="inline-flex items-center border border-gray-900 chopard-text-primary px-10 py-4 rounded-lg font-light hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  <span className="inline-flex items-center" dir="ltr">
                    <Phone className="mr-3 h-5 w-5" />
                    <span className="font-light">{t('hero.cta.phone')}</span>
                  </span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-lg overflow-hidden chopard-shadow">
                <img
                  src={heroImages[currentImageIndex].src}
                  alt={heroImages[currentImageIndex].alt}
                  className="w-full h-96 lg:h-[500px] object-cover transition-opacity duration-500"
                  style={{ opacity: isImageLoading ? 0 : 1 }}
                  onLoad={() => setIsImageLoading(false)}
                  onLoadStart={() => setIsImageLoading(true)}
                />
                {/* Carousel indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 chopard-text-accent" />,
                number: `${Math.floor(procedureCount).toLocaleString()}+`, // Shows "30,000+"
                label: t('stats.livesTransformed.label'),
                description: t('stats.livesTransformed.description'),
              },
              {
                icon: <MapPin className="h-8 w-8 chopard-text-accent" />,
                number: '12',
                label: t('stats.pacificIslands.label'),
                description: t('stats.pacificIslands.description'),
              },
              {
                icon: <Award className="h-8 w-8 chopard-text-accent" />,
                number: '98%',
                label: t('stats.successRate.label'),
                description: t('stats.successRate.description'),
              },
              {
                icon: <Star className="h-8 w-8 chopard-text-accent" />,
                number: '15+',
                label: t('stats.yearsExperience.label'),
                description: t('stats.yearsExperience.description'),
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center chopard-card p-8 rounded-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-6">{stat.icon}</div>
                <div className="text-3xl font-serif chopard-text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-light chopard-text-primary mb-2">
                  {stat.label}
                </div>
                <p className="chopard-text-secondary text-sm">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 chopard-gradient text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-serif mb-8">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-12 font-light leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white text-gray-900 px-10 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              <Calendar className="mr-3 h-5 w-5" />
              {t('cta.schedule')}
            </Link>
            <Link
              to="/pacific-story"
              className="inline-flex items-center border border-white text-white px-10 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('cta.pacificStory')}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
