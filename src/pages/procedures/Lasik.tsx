import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Shield, Eye, Users, ArrowRight, Check, Star, Play } from 'lucide-react';

const Lasik = () => {
  const { t } = useTranslation('procedures');

  const benefits = [
    {
      icon: <Eye className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'lasik.benefits.items.clarity.title',
      descKey: 'lasik.benefits.items.clarity.description'
    },
    {
      icon: <Clock className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'lasik.benefits.items.quick.title',
      descKey: 'lasik.benefits.items.quick.description'
    },
    {
      icon: <Shield className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'lasik.benefits.items.safety.title',
      descKey: 'lasik.benefits.items.safety.description'
    },
    {
      icon: <Users className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'lasik.benefits.items.satisfaction.title',
      descKey: 'lasik.benefits.items.satisfaction.description'
    },
    {
      icon: <Star className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'lasik.benefits.items.lasting.title',
      descKey: 'lasik.benefits.items.lasting.description'
    },
    {
      icon: <ArrowRight className="h-8 w-8 chopard-text-accent" />,
      titleKey: 'lasik.benefits.items.lifestyle.title',
      descKey: 'lasik.benefits.items.lifestyle.description'
    }
  ];

  const processSteps = [
    {
      step: '1',
      titleKey: 'lasik.process.steps.examination.title',
      descKey: 'lasik.process.steps.examination.description',
      image: '/assets/images/procedures/lasik/process/step-01-examination.png'
    },
    {
      step: '2',
      titleKey: 'lasik.process.steps.flap.title',
      descKey: 'lasik.process.steps.flap.description',
      image: '/assets/images/procedures/lasik/process/step-02-flap-creation.png'
    },
    {
      step: '3',
      titleKey: 'lasik.process.steps.correction.title',
      descKey: 'lasik.process.steps.correction.description',
      image: '/assets/images/procedures/lasik/process/step-03-laser-reshaping.png'
    },
    {
      step: '4',
      titleKey: 'lasik.process.steps.recovery.title',
      descKey: 'lasik.process.steps.recovery.description',
      image: '/assets/images/procedures/lasik/process/step-04-recovery.png'
    }
  ];

  const testimonials = [
    {
      name: 'Jennifer L.',
      age: '32, Teacher',
      before: '20/400',
      after: '20/15',
      text: 'I went from barely seeing the board to having better than perfect vision! Dr. Flowers made the entire process comfortable and stress-free.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    },
    {
      name: 'Robert K.',
      age: '45, Pilot',
      before: '20/200',
      after: '20/20',
      text: 'My career required perfect vision. Dr. Flowers delivered exactly that with his revolutionary technique. I\'m back in the cockpit!',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
    },
    {
      name: 'Maria S.',
      age: '28, Athlete',
      before: '20/300',
      after: '20/15',
      text: 'Swimming competitively with contacts was impossible. Now I have perfect vision and the freedom to pursue my passion.',
      image: 'https://images.pexels.com/photos/1462636/pexels-photo-1462636.jpeg'
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
                {t('lasik.hero.title')}
              </h1>
              <p className="text-xl chopard-text-secondary mb-6 leading-relaxed font-light">
                {t('lasik.hero.subtitle')}
              </p>
              <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border mb-8">
                <Star className="h-5 w-5 mr-3 chopard-text-accent" />
                {t('lasik.hero.badge')}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
                >
                  {t('lasik.cta.schedule')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/procedures"
                  className="inline-flex items-center border border-gray-900 chopard-text-primary px-8 py-3 rounded-lg font-light hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  {t('comparison.cta')}
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Clock className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('lasik.hero.stats.procedureTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.procedureTime')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Eye className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('lasik.hero.stats.recoveryTime')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.recoveryTime')}</p>
                </div>
                <div className="text-center p-4 chopard-card rounded-lg">
                  <Shield className="h-6 w-6 chopard-text-accent mx-auto mb-2" />
                  <p className="text-2xl font-serif chopard-text-primary">{t('lasik.hero.stats.successRate')}</p>
                  <p className="text-sm chopard-text-secondary font-light">{t('comparison.features.successRate')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-96 lg:h-[500px]"
                  src="https://www.youtube.com/embed/a7q_r-y5x-k?end=133"
                  title="LASIK Surgery Procedure"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is LASIK */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                {t('lasik.technology.title')}
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 font-light">
                {t('lasik.technology.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">{t('lasik.technology.features.bladeFree.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('lasik.technology.features.bladeFree.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">{t('lasik.technology.features.wavefront.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('lasik.technology.features.wavefront.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 chopard-text-accent mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-light chopard-text-primary">{t('lasik.technology.features.recovery.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('lasik.technology.features.recovery.description')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/assets/images/procedures/lasik/advanced-technology-overview.png"
                alt="Comprehensive eye examination diagnostic report showing day and night vision measurements for LASIK candidacy assessment"
                className="rounded-2xl shadow-xl w-full h-auto object-contain bg-gray-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('lasik.benefits.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('lasik.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-serif chopard-text-primary mb-3">{t(benefit.titleKey)}</h3>
                <p className="chopard-text-secondary font-light">{t(benefit.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Procedure */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('lasik.process.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('lasik.process.subtitle')}
            </p>
          </div>

          <div className="space-y-12">
            {processSteps.map((step, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 chopard-gradient text-white rounded-full flex items-center justify-center text-xl font-serif mr-4">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-serif chopard-text-primary">{t(step.titleKey)}</h3>
                  </div>
                  <p className="text-lg chopard-text-secondary font-light">{t(step.descKey)}</p>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <img
                    src={step.image}
                    alt={`LASIK Step ${step.step}: ${t(step.titleKey)}`}
                    className="rounded-xl shadow-lg w-full h-64 object-contain bg-gray-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Candidacy Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('lasik.candidacy.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('lasik.candidacy.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-accent mb-6">{t('lasik.candidacy.ideal.title')}</h3>
              <ul className="space-y-4">
                {(t('lasik.candidacy.ideal.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 chopard-text-accent mr-3 mt-0.5" />
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chopard-card p-8 rounded-xl">
              <h3 className="text-2xl font-serif chopard-text-secondary mb-6">{t('lasik.candidacy.notSuitable.title')}</h3>
              <ul className="space-y-4">
                {(t('lasik.candidacy.notSuitable.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-5 h-5 rounded-full border-2 chopard-border mr-3 mt-0.5 flex-shrink-0"></div>
                    <span className="chopard-text-secondary font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg chopard-text-secondary mb-6 font-light">
              {t('lasik.candidacy.evaluation')}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
            >
              {t('lasik.cta.schedule')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('lasik.testimonials.title')}
            </h2>
            <p className="text-xl chopard-text-secondary font-light">
              {t('lasik.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="chopard-card rounded-xl p-8">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-light chopard-text-primary">{testimonial.name}</h3>
                    <p className="text-sm chopard-text-secondary font-light">{testimonial.age}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4 p-3 chopard-glass rounded-lg border chopard-border">
                  <div className="text-center">
                    <p className="text-sm chopard-text-secondary font-light">Before</p>
                    <p className="text-lg font-serif text-red-600">{testimonial.before}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 chopard-text-accent" />
                  <div className="text-center">
                    <p className="text-sm chopard-text-secondary font-light">After</p>
                    <p className="text-lg font-serif chopard-text-accent">{testimonial.after}</p>
                  </div>
                </div>
                <p className="chopard-text-secondary italic font-light">"{testimonial.text}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
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
            {t('lasik.cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            {t('lasik.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              {t('lasik.cta.schedule')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/testimonials"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('lasik.cta.results')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lasik;
