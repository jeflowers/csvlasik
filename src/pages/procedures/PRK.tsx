import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Eye, Users, ArrowRight, Check, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import YouTubeEmbed from '../../components/YouTubeEmbed';

const PRK = () => {
  const { t } = useTranslation('procedures');

  const recoveryPhases = [
    { key: 'initial', icon: Eye },
    { key: 'clearing', icon: Check },
    { key: 'stabilization', icon: Star }
  ];

  const candidateTypes = [
    { key: 'active', icon: Users },
    { key: 'thin', icon: Shield },
    { key: 'high', icon: Eye }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-sm font-light chopard-text-accent border chopard-border mb-6">
                <Shield className="h-4 w-4 mr-3 chopard-text-accent" />
                {t('prk.hero.badge')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                {t('prk.hero.title')}
              </h1>
              <p className="text-xl chopard-text-secondary mb-8 leading-relaxed font-light">
                {t('prk.hero.subtitle')}
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
                  <p className="text-2xl font-serif chopard-text-primary">{t('prk.hero.stats.procedureTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.procedureTime', 'Procedure Time')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Eye className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('prk.hero.stats.recoveryTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.recoveryTime', 'Recovery Time')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Shield className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('prk.hero.stats.successRate')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.successRate', 'Success Rate')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src="/assets/images/procedures/lasik/jsb-co-G2sv2jjH3JU-unsplash.jpg"
                  alt="PRK photorefractive keratectomy - Surface laser vision correction"
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">PRK Surface Treatment</p>
                  <p className="text-xs opacity-90">No corneal flap required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('common:video.watchProcedure', 'Watch the PRK Procedure')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('common:video.description', 'See how PRK surface treatment provides excellent vision correction')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <YouTubeEmbed
              videoId="1Pjh4ja1lH0"
              title="PRK Eye Surgery Procedure"
              start={5}
              className="w-full h-96 lg:h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* What is PRK */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                {t('prk.technology.title')}
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light">
                {t('prk.technology.description')}
              </p>
              <div className="space-y-4">
                {['noFlap', 'thinCorneas', 'stability'].map((key) => (
                  <div key={key} className="flex items-start">
                    <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-light chopard-text-primary">{t(`prk.technology.features.${key}.title`)}</h3>
                      <p className="chopard-text-secondary font-light">{t(`prk.technology.features.${key}.description`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="/assets/images/misc/jsb-co-VFkksKfrsvM-unsplash.jpg"
                alt="Eye examination"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRK vs LASIK */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('prk.advantages.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('prk.advantages.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">{t('prk.advantages.prk.title')}</h3>
              <ul className="space-y-4">
                {t('prk.advantages.prk.items', { returnObjects: true }).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 chopard-text-accent mr-3 mt-0.5" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-secondary mb-6">{t('prk.advantages.lasik.title')}</h3>
              <ul className="space-y-4">
                {t('prk.advantages.lasik.items', { returnObjects: true }).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full chopard-glass border-2 chopard-border mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg chopard-text-secondary mb-6 font-light">
              {t('common:recommendation', "Dr. Flowers will help determine which procedure is best for your unique situation.")}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
            >
              {t('comparison.cta', 'Get Personalized Recommendation')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recovery Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('prk.recovery.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('prk.recovery.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recoveryPhases.map(({ key, icon: Icon }, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl">
                <div className="text-center mb-6">
                  <div className="text-2xl font-serif chopard-text-accent mb-2">{t(`prk.recovery.phases.${key}.period`)}</div>
                  <h3 className="text-xl font-serif chopard-text-primary">{t(`prk.recovery.phases.${key}.title`)}</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-light chopard-text-primary mb-3">{t('common:whatToExpect', 'What to Expect:')}</h4>
                    <ul className="space-y-2">
                      {t(`prk.recovery.phases.${key}.symptoms`, { returnObjects: true }).map((symptom, symptomIndex) => (
                        <li key={symptomIndex} className="flex items-start">
                          <Eye className="h-4 w-4 chopard-text-accent mr-2 mt-0.5" />
                          <span className="text-sm chopard-text-secondary font-light">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-light chopard-text-primary mb-3">{t('common:careInstructions', 'Care Instructions:')}</h4>
                    <ul className="space-y-2">
                      {t(`prk.recovery.phases.${key}.care`, { returnObjects: true }).map((instruction, instructionIndex) => (
                        <li key={instructionIndex} className="flex items-start">
                          <Check className="h-4 w-4 chopard-text-accent mr-2 mt-0.5" />
                          <span className="text-sm chopard-text-secondary font-light">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Candidates */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('prk.candidates.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('prk.candidates.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {candidateTypes.map(({ key, icon: Icon }, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-6"><Icon className="h-12 w-12 chopard-text-accent mx-auto" /></div>
                <h3 className="text-xl font-serif chopard-text-primary mb-4">{t(`prk.candidates.${key}.title`)}</h3>
                <p className="chopard-text-secondary mb-6 font-light">{t(`prk.candidates.${key}.description`)}</p>
                <div className="space-y-2">
                  {t(`prk.candidates.${key}.benefits`, { returnObjects: true }).map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center justify-center">
                      <Check className="h-4 w-4 chopard-text-accent mr-2" />
                      <span className="text-sm chopard-text-secondary font-light">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            {t('prk.cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            {t('prk.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              {t('prk.cta.schedule')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/procedures"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('prk.cta.compare')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PRK;
