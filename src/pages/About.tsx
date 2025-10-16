import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, MapPin, Users, Calendar, ArrowRight, GraduationCap, Stethoscope, Globe, BookOpen, Star, Eye } from 'lucide-react';
import { TEAM_IMAGES } from '../utils/imageUtils';

const About = () => {
  const { t } = useTranslation(['about', 'common']);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                {t('hero.title')}<br />
                <span className="text-3xl chopard-text-accent">{t('hero.subtitle')}</span>
              </h1>
              <p className="text-xl chopard-text-secondary mb-6 leading-relaxed font-light">
                {t('hero.description')}
              </p>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border mb-8">
                <Award className="h-5 w-5 mr-3 chopard-text-accent" />
                {t('hero.badge')}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
                >
                  {t('hero.cta.schedule')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/pacific-story"
                  className="inline-flex items-center border chopard-border chopard-text-primary px-8 py-3 rounded-lg font-light hover:chopard-text-accent transition-all duration-300"
                >
                  {t('hero.cta.pacific')}
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-96 lg:h-[500px]"
                  src="https://www.youtube-nocookie.com/embed/m3Wh80B0ygk?start=8&end=98"
                  title="Dr. Charles W. Flowers Jr., M.D."
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
              {t('excellence.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="chopard-card p-8 rounded-xl text-center">
              <Stethoscope className="h-12 w-12 chopard-text-accent mx-auto mb-4" />
              <h3 className="text-xl font-serif chopard-text-primary mb-3">{t('excellence.clinical.title')}</h3>
              <p className="chopard-text-secondary font-light">{t('excellence.clinical.description')}</p>
            </div>
            <div className="chopard-card p-8 rounded-xl text-center">
              <GraduationCap className="h-12 w-12 chopard-text-accent mx-auto mb-4" />
              <h3 className="text-xl font-serif chopard-text-primary mb-3">{t('excellence.academic.title')}</h3>
              <p className="chopard-text-secondary font-light">{t('excellence.academic.description')}</p>
            </div>
            <div className="chopard-card p-8 rounded-xl text-center">
              <Globe className="h-12 w-12 chopard-text-accent mx-auto mb-4" />
              <h3 className="text-xl font-serif chopard-text-primary mb-3">{t('excellence.global.title')}</h3>
              <p className="chopard-text-secondary font-light">{t('excellence.global.description')}</p>
            </div>
          </div>

          <div className="chopard-card p-8 rounded-xl">
            <blockquote className="text-xl italic chopard-text-secondary text-center leading-relaxed font-light">
              "{t('excellence.quote')}"
            </blockquote>
            <p className="text-center chopard-text-accent font-light mt-4">{t('excellence.attribution')}</p>
          </div>
        </div>
      </section>

      {/* Educational Excellence */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('education.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('education.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {['stanford', 'cornell', 'drew', 'usc'].map((key) => (
              <div key={key} className="chopard-card p-8 rounded-xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div>
                    <h3 className="text-xl font-serif chopard-text-primary mb-2">{t(`education.institutions.${key}.name`)}</h3>
                    <p className="chopard-text-accent font-light">{t(`education.institutions.${key}.years`)}</p>
                  </div>
                  <div>
                    <p className="chopard-text-secondary font-light">{t(`education.institutions.${key}.degree`)}</p>
                  </div>
                  <div>
                    {t(`education.institutions.${key}.honors`, { returnObjects: true, defaultValue: [] }) &&
                     (t(`education.institutions.${key}.honors`, { returnObjects: true, defaultValue: [] }) as string[]).length > 0 && (
                      <div>
                        <h4 className="font-light chopard-text-primary mb-2">Honors & Awards:</h4>
                        <ul className="space-y-1">
                          {(t(`education.institutions.${key}.honors`, { returnObjects: true }) as string[]).map((honor, honorIndex) => (
                            <li key={honorIndex} className="text-sm chopard-text-secondary font-light flex items-start">
                              <Star className="h-3 w-3 chopard-text-accent mr-2 mt-1 flex-shrink-0" />
                              {honor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pacific Mission Impact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('mission.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('mission.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-serif chopard-text-primary mb-6">{t('mission.innovation.title')}</h3>
              <p className="text-lg chopard-text-secondary mb-6 font-light leading-relaxed">
                {t('mission.innovation.description1')}
              </p>
              <p className="text-lg chopard-text-secondary mb-6 font-light leading-relaxed">
                {t('mission.innovation.description2')}
              </p>
            </div>
            <div className="relative">
              <div className="rounded-2xl shadow-xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-96 lg:h-[500px]"
                  src="https://www.youtube-nocookie.com/embed/smzkYORJQQc"
                  title="Guam LASIK Treatment - Transforming Pacific Healthcare"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: t('mission.stats.procedures.number'),
                label: t('mission.stats.procedures.label'),
                description: t('mission.stats.procedures.description')
              },
              {
                number: t('mission.stats.residents.number'),
                label: t('mission.stats.residents.label'),
                description: t('mission.stats.residents.description')
              },
              {
                number: t('mission.stats.savings.number'),
                label: t('mission.stats.savings.label'),
                description: t('mission.stats.savings.description')
              },
              {
                number: t('mission.stats.time.number'),
                label: t('mission.stats.time.label'),
                description: t('mission.stats.time.description')
              }
            ].map((stat, index) => (
              <div key={index} className="text-center chopard-card p-6 rounded-xl">
                <div className="text-3xl font-serif chopard-text-accent mb-2">{stat.number}</div>
                <div className="text-lg font-light chopard-text-primary mb-2">{stat.label}</div>
                <p className="chopard-text-secondary text-sm font-light">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemedicine Innovation */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="/assets/images/team/drflowers/DrFlowers_eye_exam_01.png"
                alt="Revolutionary telemedicine technology connecting Pacific islands to advanced eye care"
                className="rounded-2xl shadow-xl w-full h-64 object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                {t('telemedicine.title')}
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light leading-relaxed">
                {t('telemedicine.description')}
              </p>
              <div className="space-y-4">
                {(t('telemedicine.features', { returnObjects: true }) as string[]).map((item, index) => (
                  <div key={index} className="flex items-start">
                    <Eye className="h-5 w-5 chopard-text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Expertise */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('expertise.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('expertise.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">{t('expertise.surgical.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(t('expertise.surgical.procedures', { returnObjects: true }) as string[]).map((procedure, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 chopard-accent rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span className="text-sm chopard-text-secondary font-light">{procedure}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">{t('expertise.research.title')}</h3>
              <div className="space-y-4">
                {(t('expertise.research.areas', { returnObjects: true }) as string[]).map((research, index) => (
                  <div key={index} className="flex items-start">
                    <BookOpen className="h-5 w-5 chopard-text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="chopard-text-secondary font-light">{research}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 chopard-glass rounded-lg border chopard-border">
                <p className="text-sm chopard-text-primary font-light">
                  <strong>Grant Funding:</strong> Over $1 million secured in research funding
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recognition & Awards */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('awards.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('awards.list', { returnObjects: true }) as string[]).map((award, index) => (
              <div key={index} className="chopard-card p-6 rounded-xl">
                <div className="flex items-start">
                  <Award className="h-5 w-5 chopard-text-accent mr-3 mt-1 flex-shrink-0" />
                  <span className="text-sm chopard-text-secondary font-light leading-relaxed">{award}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Dual Mission Model */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif mb-4">{t('dualMission.title')}</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
              {t('dualMission.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 mr-3" />
                <h3 className="text-2xl font-serif">{t('dualMission.la.title')}</h3>
              </div>
              <ul className="space-y-3 text-white/70 font-light">
                {(t('dualMission.la.features', { returnObjects: true }) as string[]).map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-3" />
                <h3 className="text-2xl font-serif">{t('dualMission.pacific.title')}</h3>
              </div>
              <ul className="space-y-3 text-white/70 font-light">
                {(t('dualMission.pacific.features', { returnObjects: true }) as string[]).map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/pacific-story"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-3 rounded-lg font-light hover:chopard-hero transition-all duration-300"
            >
              {t('dualMission.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Impact by Numbers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('impact.title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {(t('impact.stats', { returnObjects: true }) as Array<{number: string, label: string}>).map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-serif chopard-text-accent mb-2">{stat.number}</div>
                <p className="chopard-text-secondary font-light text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Care Philosophy */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-8">
              {t('philosophy.title')}
            </h2>
            <div className="chopard-card p-12 rounded-xl max-w-4xl mx-auto">
              <blockquote className="text-2xl italic chopard-text-secondary text-center leading-relaxed font-light mb-6">
                "{t('philosophy.quote')}"
              </blockquote>
              <p className="chopard-text-secondary font-light text-center leading-relaxed mt-6">
                {t('philosophy.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/80 mb-8 font-light">
            {t('cta.subtitle')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:chopard-hero transition-all duration-300"
          >
            <Calendar className="mr-2 h-5 w-5" />
            {t('cta.schedule')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;