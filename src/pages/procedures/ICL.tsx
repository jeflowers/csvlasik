import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, Clock, Eye, Shield, ArrowRight, Check, Star, RotateCcw } from 'lucide-react';

const ICL = () => {
  const { t } = useTranslation('procedures');

  const advantages = [
    {
      icon: <RotateCcw className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'icl.advantages.items.reversible.title',
      descKey: 'icl.advantages.items.reversible.description'
    },
    {
      icon: <Eye className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'icl.advantages.items.quality.title',
      descKey: 'icl.advantages.items.quality.description'
    },
    {
      icon: <Shield className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'icl.advantages.items.protection.title',
      descKey: 'icl.advantages.items.protection.description'
    },
    {
      icon: <Layers className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'icl.advantages.items.preservation.title',
      descKey: 'icl.advantages.items.preservation.description'
    },
    {
      icon: <Clock className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'icl.advantages.items.recovery.title',
      descKey: 'icl.advantages.items.recovery.description'
    },
    {
      icon: <Star className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'icl.advantages.items.prescriptions.title',
      descKey: 'icl.advantages.items.prescriptions.description'
    }
  ];

  const processSteps = [
    {
      step: '1',
      titleKey: 'process.steps.consultation.title',
      descKey: 'process.steps.consultation.description',
      duration: '2-3 weeks before surgery',
      image: '/assets/images/team/drflowers/DrFlowers_eye_exam_01.png'
    },
    {
      step: '2',
      titleKey: 'process.steps.preparation.title',
      descKey: 'process.steps.preparation.description',
      duration: '1-2 weeks before surgery',
      image: '/assets/images/team/drflowers/DrFlowers_eye_surgery_01.png'
    },
    {
      step: '3',
      titleKey: 'process.steps.procedure.title',
      descKey: 'process.steps.procedure.description',
      duration: '15-20 minutes per eye',
      image: '/assets/images/team/drflowers/DrFlowers_eye_surgery_02.png'
    },
    {
      step: '4',
      titleKey: 'process.steps.recovery.title',
      descKey: 'process.steps.recovery.description',
      duration: 'Several follow-up visits',
      image: '/assets/images/team/drflowers/DrFlowers_after_surgery_recovery.png'
    }
  ];

  const candidateTypes = [
    {
      icon: <Eye className="h-12 w-12 chopard-text-accent" />,
      titleKey: 'icl.candidates.high.title',
      descKey: 'icl.candidates.high.description',
      benefitsKey: 'icl.candidates.high.benefits'
    },
    {
      icon: <Shield className="h-12 w-12 chopard-text-accent" />,
      titleKey: 'icl.candidates.thin.title',
      descKey: 'icl.candidates.thin.description',
      benefitsKey: 'icl.candidates.thin.benefits'
    },
    {
      icon: <Star className="h-12 w-12 chopard-text-accent" />,
      titleKey: 'icl.candidates.quality.title',
      descKey: 'icl.candidates.quality.description',
      benefitsKey: 'icl.candidates.quality.benefits'
    }
  ];

  const testimonials = [
    {
      name: 'Amanda Chen',
      role: 'Graphic Designer',
      before: '-15.00',
      after: '20/15',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      text: 'With -15.00 prescription, LASIK wasn\'t an option. ICL gave me perfect vision without changing my corneas. The night vision is incredible, and I love knowing it\'s reversible!'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Photographer',
      before: '-12.00',
      after: '20/20',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      text: 'As a photographer, vision quality is everything. ICL not only corrected my -12.00 prescription but gave me the sharpest vision I\'ve ever had. The UV protection is a bonus!'
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
                {t('icl.hero.title')}
              </h1>
              <p className="text-xl chopard-text-secondary mb-6 leading-relaxed font-light">
                {t('icl.hero.subtitle')}
              </p>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border mb-8">
                <Layers className="h-5 w-5 mr-3 chopard-text-accent" />
                {t('icl.hero.badge')}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
                >
                  {t('icl.cta.schedule')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/procedures"
                  className="inline-flex items-center border border-gray-900 chopard-text-primary px-8 py-3 rounded-lg font-light hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  {t('icl.cta.compare')}
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Clock className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('icl.hero.stats.procedureTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.procedureTime')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Eye className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('icl.hero.stats.recoveryTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.recoveryTime')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Shield className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('icl.hero.stats.successRate')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.successRate')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-96 lg:h-[500px]"
                  src="https://www.youtube.com/embed/A35Rxqk83VA"
                  title="EVO Visian ICL Procedure Animation"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is ICL */}
      <section className="py-16 bg-white">
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
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">{t('icl.technology.features.reversible.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('icl.technology.features.reversible.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">{t('icl.technology.features.noAlteration.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('icl.technology.features.noAlteration.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">{t('icl.technology.features.nightVision.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('icl.technology.features.nightVision.description')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/assets/images/misc/getty-images-9v-k2iQI4BI-unsplash.jpg"
                alt="Eye anatomy"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ICL Advantages */}
      <section className="py-16 chopard-hero">
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
            {advantages.map((advantage, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-4">{advantage.icon}</div>
                <h3 className="text-xl font-serif chopard-text-primary mb-3">{t(advantage.titleKey)}</h3>
                <p className="chopard-text-secondary font-light">{t(advantage.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The ICL Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('process.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('process.subtitle')}
            </p>
          </div>

          <div className="space-y-16">
            {processSteps.map((step, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 chopard-gradient text-white rounded-full flex items-center justify-center text-2xl font-serif mr-6">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif chopard-text-primary">{t(step.titleKey)}</h3>
                      <p className="chopard-text-accent font-light">{step.duration}</p>
                    </div>
                  </div>
                  <p className="text-lg chopard-text-secondary leading-relaxed font-light">{t(step.descKey)}</p>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <img
                    src={step.image}
                    alt={t(step.titleKey)}
                    className="rounded-xl shadow-lg w-full h-64 object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ICL vs Laser Comparison */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif mb-4">
              {t('icl.comparison.title')}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
              {t('icl.comparison.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <h3 className="text-2xl font-serif text-white mb-6">{t('icl.comparison.icl.title')}</h3>
              <ul className="space-y-4">
                {(t('icl.comparison.icl.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-white mr-3 mt-0.5" />
                    <span className="text-white/70 font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
              <h3 className="text-2xl font-serif text-white/70 mb-6">{t('icl.comparison.laser.title')}</h3>
              <ul className="space-y-4">
                {(t('icl.comparison.laser.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full border-2 border-white/40 mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="text-white/60 font-light">{item}</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {candidateTypes.map((candidate, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-6">{candidate.icon}</div>
                <h3 className="text-xl font-serif chopard-text-primary mb-4">{t(candidate.titleKey)}</h3>
                <p className="chopard-text-secondary mb-6 font-light">{t(candidate.descKey)}</p>
                <div className="space-y-2">
                  {(t(candidate.benefitsKey, { returnObjects: true }) as string[]).map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center justify-center">
                      <Check className="h-4 w-4 chopard-text-accent mr-2" />
                      <span className="text-sm chopard-text-secondary font-light">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 chopard-glass p-8 rounded-xl border chopard-border">
            <h3 className="text-2xl font-serif chopard-text-primary mb-4 text-center">{t('icl.candidates.requirements.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-light chopard-text-primary mb-3">{t('icl.candidates.requirements.qualifying.title')}</h4>
                <ul className="space-y-2">
                  {(t('icl.candidates.requirements.qualifying.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 chopard-text-accent mr-2 mt-0.5" />
                      <span className="text-sm chopard-text-secondary font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-light chopard-text-primary mb-3">{t('icl.candidates.requirements.disqualifying.title')}</h4>
                <ul className="space-y-2">
                  {(t('icl.candidates.requirements.disqualifying.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-4 h-4 rounded-full border-2 chopard-border mr-2 mt-0.5 flex-shrink-0"></div>
                      <span className="text-sm chopard-text-secondary font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Success Stories */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              ICL Success Stories
            </h2>
            <p className="text-xl chopard-text-secondary font-light">
              Real patients experiencing life-changing results with ICL technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-light chopard-text-primary">{testimonial.name}</h3>
                    <p className="text-sm chopard-text-secondary font-light">{testimonial.role}</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="chopard-text-secondary italic mb-4 font-light">
                  "{testimonial.text}"
                </blockquote>
                <div className="chopard-glass p-4 rounded-lg border chopard-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm chopard-text-secondary font-light">Before</p>
                      <p className="text-lg font-serif text-red-600">{testimonial.before}</p>
                    </div>
                    <div>
                      <p className="text-sm chopard-text-secondary font-light">After</p>
                      <p className="text-lg font-serif chopard-text-accent">{testimonial.after}</p>
                    </div>
                  </div>
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
