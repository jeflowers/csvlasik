import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Clock, Eye, Shield, ArrowRight, Check, Star, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import YouTubeEmbed from '../../components/YouTubeEmbed';

const ICL = () => {
  const { t } = useTranslation('procedures');

  const advantageKeys = ['reversible', 'quality', 'protection', 'preservation', 'recovery', 'prescriptions'];
  const candidateTypes = [
    { key: 'high', icon: Eye },
    { key: 'thin', icon: Shield },
    { key: 'quality', icon: Star }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-sm font-light chopard-text-accent border chopard-border mb-6">
                <Layers className="h-4 w-4 mr-3 chopard-text-accent" />
                {t('icl.hero.badge')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                {t('icl.hero.title')}
              </h1>
              <p className="text-xl chopard-text-secondary mb-8 leading-relaxed font-light">
                {t('icl.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
                >
                  {t('common:cta.scheduleConsultation', 'Schedule Free Consultation')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/procedures"
                  className="inline-flex items-center border border-gray-900 chopard-text-primary px-8 py-3 rounded-lg font-light hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  {t('comparison.cta', 'Compare Procedures')}
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Clock className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('icl.hero.stats.procedureTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.procedureTime', 'Procedure Time')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Eye className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('icl.hero.stats.recoveryTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.recoveryTime', 'Recovery Time')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Shield className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('icl.hero.stats.successRate')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.successRate', 'Success Rate')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/assets/images/procedures/lasik/arteum-ro-7H41oiADqqg-unsplash.jpg"
                alt="ICL procedure"
                className="rounded-2xl shadow-2xl w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('common:video.watchProcedure', 'Watch the ICL Procedure')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('common:video.description', 'See how ICL implantable lenses provide exceptional vision correction')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <YouTubeEmbed
              videoId="A35Rxqk83VA"
              title="ICL Eye Surgery Procedure"
              start={4}
              className="w-full h-96 lg:h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* What is ICL */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                {t('icl.technology.title')}
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light">
                {t('icl.technology.description')}
              </p>
              <div className="space-y-4">
                {['reversible', 'noAlteration', 'nightVision'].map((key) => (
                  <div key={key} className="flex items-start">
                    <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-light chopard-text-primary">{t(`icl.technology.features.${key}.title`)}</h3>
                      <p className="chopard-text-secondary font-light">{t(`icl.technology.features.${key}.description`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="/assets/images/misc/jsb-co-VFkksKfrsvM-unsplash.jpg"
                alt="ICL implantable lens"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Unique Advantages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('icl.advantages.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('icl.advantages.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantageKeys.map((key, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl">
                <div className="mb-4">
                  {key === 'reversible' && <RotateCcw className="h-8 w-8 chopard-text-accent" />}
                  {key === 'quality' && <Star className="h-8 w-8 chopard-text-accent" />}
                  {key === 'protection' && <Shield className="h-8 w-8 chopard-text-accent" />}
                  {key === 'preservation' && <Eye className="h-8 w-8 chopard-text-accent" />}
                  {key === 'recovery' && <Clock className="h-8 w-8 chopard-text-accent" />}
                  {key === 'prescriptions' && <Layers className="h-8 w-8 chopard-text-accent" />}
                </div>
                <h3 className="text-xl font-serif chopard-text-primary mb-3">{t(`icl.advantages.items.${key}.title`)}</h3>
                <p className="chopard-text-secondary font-light">{t(`icl.advantages.items.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ICL vs Laser Comparison */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('icl.comparison.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('icl.comparison.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">{t('icl.comparison.icl.title')}</h3>
              <ul className="space-y-4">
                {t('icl.comparison.icl.items', { returnObjects: true }).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 chopard-text-accent mr-3 mt-0.5" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-secondary mb-6">{t('icl.comparison.laser.title')}</h3>
              <ul className="space-y-4">
                {t('icl.comparison.laser.items', { returnObjects: true }).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full chopard-glass border-2 chopard-border mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal Candidates */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('icl.candidates.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('icl.candidates.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {candidateTypes.map(({ key, icon: Icon }, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-6"><Icon className="h-12 w-12 chopard-text-accent mx-auto" /></div>
                <h3 className="text-xl font-serif chopard-text-primary mb-4">{t(`icl.candidates.${key}.title`)}</h3>
                <p className="chopard-text-secondary mb-6 font-light">{t(`icl.candidates.${key}.description`)}</p>
                <div className="space-y-2">
                  {t(`icl.candidates.${key}.benefits`, { returnObjects: true }).map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center justify-center">
                      <Check className="h-4 w-4 chopard-text-accent mr-2" />
                      <span className="text-sm chopard-text-secondary font-light">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Requirements Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">{t('icl.candidates.requirements.qualifying.title')}</h3>
              <ul className="space-y-3">
                {t('icl.candidates.requirements.qualifying.items', { returnObjects: true }).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 chopard-text-accent mr-3 mt-0.5" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-secondary mb-6">{t('icl.candidates.requirements.disqualifying.title')}</h3>
              <ul className="space-y-3">
                {t('icl.candidates.requirements.disqualifying.items', { returnObjects: true }).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full border-2 chopard-border mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            {t('icl.cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            {t('icl.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              {t('icl.cta.schedule')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/procedures"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('icl.cta.compare')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ICL;
