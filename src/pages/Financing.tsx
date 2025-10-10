import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Star, Calendar, ArrowRight, Check, Award, Crown, Gem } from 'lucide-react';

const Financing = () => {
  const { t } = useTranslation(['financing', 'common']);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
              <span className="chopard-text-accent">{t('hero.title')}</span>
              <br />
              <span className="text-3xl lg:text-4xl">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto mb-6 leading-relaxed font-light">
              {t('hero.description')}
            </p>
            <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border mb-8">
              <Crown className="h-5 w-5 mr-3 chopard-text-accent" />
              {t('hero.badge')}
            </div>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center chopard-button px-10 py-4 rounded-lg text-lg transition-all duration-300"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Philosophy */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
                {t('investment.title')}
              </h2>
              <p className="text-lg chopard-text-secondary mb-6 leading-relaxed font-light">
                {t('investment.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Gem className="h-6 w-6 chopard-text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-light chopard-text-primary text-lg">{t('investment.benefits.lifetime.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('investment.benefits.lifetime.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 chopard-text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-light chopard-text-primary text-lg">{t('investment.benefits.lifestyle.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('investment.benefits.lifestyle.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="h-6 w-6 chopard-text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-light chopard-text-primary text-lg">{t('investment.benefits.expertise.title')}</h3>
                    <p className="chopard-text-secondary font-light">{t('investment.benefits.expertise.description')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/images/finance/doctor_with_patients.png"
                alt="Investment in vision"
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Investment Solutions */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
              {t('solutions.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('solutions.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                title: t('solutions.immediate.title'),
                subtitle: t('solutions.immediate.subtitle'),
                description: t('solutions.immediate.description'),
                features: [
                  t('solutions.immediate.features.coverage'),
                  t('solutions.immediate.features.followup'),
                  t('solutions.immediate.features.guarantee'),
                  t('solutions.immediate.features.priority'),
                  t('solutions.immediate.features.concierge')
                ],
                highlight: t('solutions.immediate.highlight'),
                icon: <Crown className="h-8 w-8 chopard-text-accent" />
              },
              {
                title: t('solutions.structured.title'),
                subtitle: t('solutions.structured.subtitle'),
                description: t('solutions.structured.description'),
                features: [
                  t('solutions.structured.features.noInitial'),
                  t('solutions.structured.features.flexible'),
                  t('solutions.structured.features.competitive'),
                  t('solutions.structured.features.approval'),
                  t('solutions.structured.features.care')
                ],
                highlight: t('solutions.structured.highlight'),
                icon: <Calendar className="h-8 w-8 chopard-text-accent" />
              },
              {
                title: t('solutions.healthcare.title'),
                subtitle: t('solutions.healthcare.subtitle'),
                description: t('solutions.healthcare.description'),
                features: [
                  t('solutions.healthcare.features.eligible'),
                  t('solutions.healthcare.features.tax'),
                  t('solutions.healthcare.features.documentation'),
                  t('solutions.healthcare.features.optimization'),
                  t('solutions.healthcare.features.guidance')
                ],
                highlight: t('solutions.healthcare.highlight'),
                icon: <Shield className="h-8 w-8 chopard-text-accent" />
              }
            ].map((option, index) => (
              <div key={index} className="relative group">
                <div className="chopard-card rounded-2xl p-8 transform group-hover:-translate-y-3 transition-all duration-500 hover:chopard-shadow">
                  <div className="text-center mb-6">
                    <div className="mb-4">{option.icon}</div>
                    <div className="chopard-accent text-white px-4 py-2 rounded-full text-sm font-light mb-4 inline-block">
                      {option.highlight}
                    </div>
                    <h3 className="text-2xl font-serif chopard-text-primary mb-2">{option.title}</h3>
                    <p className="chopard-text-accent font-light">{option.subtitle}</p>
                  </div>
                  
                  <p className="chopard-text-secondary mb-6 text-center leading-relaxed font-light">{option.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 chopard-text-accent mr-3 mt-0.5 flex-shrink-0" />
                        <span className="chopard-text-secondary text-sm font-light">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to="/contact"
                    className="inline-flex items-center w-full justify-center chopard-button px-6 py-3 rounded-lg font-light transition-all duration-300"
                  >
                    {t('solutions.exploreOption')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 chopard-gradient text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif mb-6">
              {t('value.title')}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
              {t('value.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: t('value.benefits.freedom.title'),
                value: t('value.benefits.freedom.value'),
                description: t('value.benefits.freedom.description')
              },
              {
                title: t('value.benefits.convenience.title'),
                value: t('value.benefits.convenience.value'),
                description: t('value.benefits.convenience.description')
              },
              {
                title: t('value.benefits.confidence.title'),
                value: t('value.benefits.confidence.value'),
                description: t('value.benefits.confidence.description')
              },
              {
                title: t('value.benefits.experience.title'),
                value: t('value.benefits.experience.value'),
                description: t('value.benefits.experience.description')
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-serif text-white mb-2">{benefit.value}</div>
                <h3 className="text-xl font-light mb-3 text-white">{benefit.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed font-light">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
              {t('journey.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('journey.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: t('journey.steps.consultation.title'),
                description: t('journey.steps.consultation.description')
              },
              {
                step: '02',
                title: t('journey.steps.discussion.title'),
                description: t('journey.steps.discussion.description')
              },
              {
                step: '03',
                title: t('journey.steps.finalization.title'),
                description: t('journey.steps.finalization.description')
              },
              {
                step: '04',
                title: t('journey.steps.care.title'),
                description: t('journey.steps.care.description')
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
                <h3 className="text-xl font-serif chopard-text-primary mb-3">{step.title}</h3>
                <p className="chopard-text-secondary text-sm leading-relaxed font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Financial Services */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="chopard-card rounded-2xl p-12 text-center">
            <Crown className="h-16 w-16 chopard-text-accent mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-6">
              {t('concierge.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed font-light">
              {t('concierge.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <Shield className="h-8 w-8 chopard-text-accent mx-auto mb-3" />
                <h3 className="font-light chopard-text-primary mb-2">{t('concierge.services.confidential.title')}</h3>
                <p className="chopard-text-secondary text-sm font-light">{t('concierge.services.confidential.description')}</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 chopard-text-accent mx-auto mb-3" />
                <h3 className="font-light chopard-text-primary mb-2">{t('concierge.services.personalized.title')}</h3>
                <p className="chopard-text-secondary text-sm font-light">{t('concierge.services.personalized.description')}</p>
              </div>
              <div className="text-center">
                <Award className="h-8 w-8 chopard-text-accent mx-auto mb-3" />
                <h3 className="font-light chopard-text-primary mb-2">{t('concierge.services.whiteGlove.title')}</h3>
                <p className="chopard-text-secondary text-sm font-light">{t('concierge.services.whiteGlove.description')}</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center chopard-button px-10 py-4 rounded-lg text-lg transition-all duration-300"
            >
              {t('concierge.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-8">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-12 font-light leading-relaxed">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-10 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              <Calendar className="mr-3 h-5 w-5" />
              {t('cta.schedule')}
            </Link>
            <Link
              to="/procedures"
              className="inline-flex items-center border border-white text-white px-10 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('cta.explore')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Financing;