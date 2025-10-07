import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Clock, Shield, Star, ArrowRight, Check } from 'lucide-react';

const Procedures = () => {
  const { t } = useTranslation(['procedures', 'common']);

  const procedures = [
    {
      name: 'LASIK',
      tagline: t('procedures.lasik.tagline'),
      description: t('procedures.lasik.description'),
      image: '/assets/images/procedures/lasik/brands-people-sWQrD5s0fWc-unsplash.jpg',
      link: '/procedures/lasik',
      recoveryTime: t('procedures.lasik.recoveryTime'),
      successRate: t('procedures.lasik.successRate'),
      ideal: t('procedures.lasik.ideal'),
      features: [
        t('procedures.lasik.features.quick'),
        t('procedures.lasik.features.comfort'),
        t('procedures.lasik.features.recovery'),
        t('procedures.lasik.features.lasting')
      ],
      popular: true
    },
    {
      name: 'PRK',
      tagline: t('procedures.prk.tagline'),
      description: t('procedures.prk.description'),
      image: '/assets/images/procedures/lasik/jsb-co-G2sv2jjH3JU-unsplash.jpg',
      link: '/procedures/prk',
      recoveryTime: t('procedures.prk.recoveryTime'),
      successRate: t('procedures.prk.successRate'),
      ideal: t('procedures.prk.ideal'),
      features: [
        t('procedures.prk.features.noFlap'),
        t('procedures.prk.features.thinCorneas'),
        t('procedures.prk.features.stability'),
        t('procedures.prk.features.athletes')
      ]
    },
    {
      name: 'ICL',
      tagline: t('procedures.icl.tagline'),
      description: t('procedures.icl.description'),
      image: '/assets/images/procedures/lasik/arteum-ro-7H41oiADqqg-unsplash.jpg',
      link: '/procedures/icl',
      recoveryTime: t('procedures.icl.recoveryTime'),
      successRate: t('procedures.icl.successRate'),
      ideal: t('procedures.icl.ideal'),
      features: [
        t('procedures.icl.features.reversible'),
        t('procedures.icl.features.nightVision'),
        t('procedures.icl.features.uvProtection'),
        t('procedures.icl.features.maintenance')
      ]
    }
  ];

  const comparisonData = [
    { 
      feature: t('comparison.features.recoveryTime'), 
      lasik: t('comparison.values.lasik.recoveryTime'), 
      prk: t('comparison.values.prk.recoveryTime'), 
      icl: t('comparison.values.icl.recoveryTime') 
    },
    { 
      feature: t('comparison.features.procedureTime'), 
      lasik: t('comparison.values.lasik.procedureTime'), 
      prk: t('comparison.values.prk.procedureTime'), 
      icl: t('comparison.values.icl.procedureTime') 
    },
    { 
      feature: t('comparison.features.painLevel'), 
      lasik: t('comparison.values.lasik.painLevel'), 
      prk: t('comparison.values.prk.painLevel'), 
      icl: t('comparison.values.icl.painLevel') 
    },
    { 
      feature: t('comparison.features.highRx'), 
      lasik: t('comparison.values.lasik.highRx'), 
      prk: t('comparison.values.prk.highRx'), 
      icl: t('comparison.values.icl.highRx') 
    },
    { 
      feature: t('comparison.features.nightVision'), 
      lasik: t('comparison.values.lasik.nightVision'), 
      prk: t('comparison.values.prk.nightVision'), 
      icl: t('comparison.values.icl.nightVision') 
    },
    { 
      feature: t('comparison.features.reversibility'), 
      lasik: t('comparison.values.lasik.reversibility'), 
      prk: t('comparison.values.prk.reversibility'), 
      icl: t('comparison.values.icl.reversibility') 
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-sm font-light chopard-text-accent border chopard-border mb-6">
            <Eye className="h-4 w-4 mr-3 chopard-text-accent" />
            {t('hero.badge')}
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl chopard-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed font-light">
            {t('hero.subtitle')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
          >
            {t('scheduleConsultation', { ns: 'common' })}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Procedures Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {procedures.map((procedure, index) => (
              <div key={index} className="relative group">
                <div className="chopard-card rounded-xl overflow-hidden border chopard-border hover:chopard-shadow transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className="relative">
                    <img
                      src={procedure.image}
                      alt={procedure.name}
                      className="w-full h-64 object-cover"
                    />
                    {procedure.popular && (
                      <div className="absolute top-4 right-4 chopard-accent text-white px-3 py-2 rounded-full text-sm font-light">
                        {t('procedures.lasik.tagline')}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-light chopard-text-accent">
                      {procedure.tagline}
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-serif chopard-text-primary mb-2">{procedure.name}</h3>
                    <p className="chopard-text-secondary mb-6 font-light">{procedure.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 chopard-glass rounded-lg border chopard-border">
                        <Clock className="h-5 w-5 chopard-text-accent mx-auto mb-1" />
                        <p className="text-xs chopard-text-secondary font-light">{t('comparison.features.recoveryTime')}</p>
                        <p className="text-sm font-serif chopard-text-primary">{procedure.recoveryTime}</p>
                      </div>
                      <div className="text-center p-3 chopard-glass rounded-lg border chopard-border">
                        <Shield className="h-5 w-5 chopard-text-accent mx-auto mb-1" />
                        <p className="text-xs chopard-text-secondary font-light">{t('comparison.features.successRate')}</p>
                        <p className="text-sm font-serif chopard-text-primary">{procedure.successRate}</p>
                      </div>
                      <div className="text-center p-3 chopard-glass rounded-lg border chopard-border">
                        <Star className="h-5 w-5 chopard-text-accent mx-auto mb-1" />
                        <p className="text-xs chopard-text-secondary font-light">{t('comparison.features.idealFor')}</p>
                        <p className="text-xs font-serif chopard-text-primary">{procedure.ideal}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-light chopard-text-primary mb-3">{t('procedures.keyFeatures')}:</h4>
                      <ul className="space-y-2">
                        {procedure.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className="h-4 w-4 chopard-text-accent mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm chopard-text-secondary font-light">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link
                      to={procedure.link}
                      className="inline-flex items-center w-full justify-center chopard-button px-6 py-3 rounded-lg transition-all duration-300"
                    >
                      {t('learnMore', { ns: 'common' })} {procedure.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('comparison.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('comparison.subtitle')}
            </p>
          </div>

          <div className="chopard-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="chopard-gradient text-white">
                  <tr>
                    <th className="text-left py-4 px-6 font-light">{t('comparison.featureHeader')}</th>
                    <th className="text-center py-4 px-6 font-light">LASIK</th>
                    <th className="text-center py-4 px-6 font-light">PRK</th>
                    <th className="text-center py-4 px-6 font-light">ICL</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'chopard-hero' : 'bg-white'}>
                      <td className="py-4 px-6 font-light chopard-text-primary">{row.feature}</td>
                      <td className="py-4 px-6 text-center chopard-text-secondary font-light">{row.lasik}</td>
                      <td className="py-4 px-6 text-center chopard-text-secondary font-light">{row.prk}</td>
                      <td className="py-4 px-6 text-center chopard-text-secondary font-light">{row.icl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg chopard-text-secondary mb-6 font-light">
              {t('comparison.recommendation')}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
            >
              {t('comparison.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process Overview */}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: t('process.steps.consultation.title'),
                description: t('process.steps.consultation.description')
              },
              {
                step: '02',
                title: t('process.steps.preparation.title'),
                description: t('process.steps.preparation.description')
              },
              {
                step: '03',
                title: t('process.steps.procedure.title'),
                description: t('process.steps.procedure.description')
              },
              {
                step: '04',
                title: t('process.steps.recovery.title'),
                description: t('process.steps.recovery.description')
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 chopard-gradient text-white rounded-full flex items-center justify-center text-xl font-serif mx-auto">
                    {step.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300 -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-xl font-serif chopard-text-primary mb-2">{step.title}</h3>
                <p className="chopard-text-secondary font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              {t('cta.schedule')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/testimonials"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('cta.testimonials')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Procedures;