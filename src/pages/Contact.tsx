import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Calendar, ArrowRight, CheckCircle, User, MessageSquare } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';

const Contact = () => {
  const { t } = useTranslation(['contact', 'forms', 'common']);

  const scrollToMap = () => {
    const mapSection = document.getElementById('office-map');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    procedure: '',
    message: '',
    preferredContact: 'phone'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You would typically send this data to your backend
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
              {t('hero.title')} <span className="chopard-text-accent">{t('hero.titleAccent')}</span>
            </h1>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed font-light">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                to="/portal"
                className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300"
              >
                <Calendar className="mr-2 h-5 w-5" />
                {t('common:scheduleConsultation')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="tel:+18442115462"
                className="inline-flex items-center border border-gray-900 chopard-text-primary px-8 py-3 rounded-lg font-light hover:bg-gray-900 hover:text-white transition-all duration-300"
              >
                <Phone className="mr-2 h-5 w-5" />
                {t('common:callNow')}
              </a>
            </div>
            <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border">
              <Calendar className="h-5 w-5 mr-3 chopard-text-accent" />
              {t('hero.badge')}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="chopard-card p-8 rounded-2xl">
              <h2 className="text-2xl font-serif chopard-text-primary mb-6">{t('form.title')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-light chopard-text-primary mb-2">
                      {t('firstName', { ns: 'forms' })} *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border chopard-border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent font-light"
                      placeholder={t('placeholders.firstName', { ns: 'forms' })}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-light chopard-text-primary mb-2">
                      {t('lastName', { ns: 'forms' })} *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border chopard-border rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent font-light"
                      placeholder={t('placeholders.lastName', { ns: 'forms' })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email', { ns: 'forms' })} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={t('placeholders.email', { ns: 'forms' })}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone', { ns: 'forms' })} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={t('placeholders.phone', { ns: 'forms' })}
                  />
                </div>

                <div>
                  <label htmlFor="procedure" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('procedure', { ns: 'forms' })}
                  </label>
                  <select
                    id="procedure"
                    name="procedure"
                    value={formData.procedure}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">{t('form.selectProcedure')}</option>
                    <option value="lasik">{t('options.procedures.lasik', { ns: 'forms' })}</option>
                    <option value="prk">{t('options.procedures.prk', { ns: 'forms' })}</option>
                    <option value="icl">{t('options.procedures.icl', { ns: 'forms' })}</option>
                    <option value="consultation">{t('options.procedures.consultation', { ns: 'forms' })}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('preferredContact', { ns: 'forms' })}
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      {t('options.contactMethods.phone', { ns: 'forms' })}
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      {t('options.contactMethods.email', { ns: 'forms' })}
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('comments', { ns: 'forms' })}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={t('placeholders.comments', { ns: 'forms' })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full chopard-button px-8 py-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  {t('buttons.submit', { ns: 'forms' })}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>

                <p className="text-sm chopard-text-secondary text-center font-light">
                  {t('privacy.notice', { ns: 'forms' })}
                </p>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif chopard-text-primary mb-6">{t('info.title')}</h2>
                <p className="text-lg chopard-text-secondary mb-8 font-light">
                  {t('info.subtitle')}
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <button
                  onClick={scrollToMap}
                  className="flex items-start hover:opacity-80 transition-opacity duration-300 group cursor-pointer text-left w-full"
                >
                  <MapPin className="h-6 w-6 chopard-text-accent mr-4 mt-1 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h3 className="font-light chopard-text-primary mb-1 group-hover:chopard-text-accent transition-colors duration-300">{t('office.name')}</h3>
                    <p className="chopard-text-secondary font-light group-hover:chopard-text-accent transition-colors duration-300">
                      {t('office.address')}
                    </p>
                  </div>
                </button>

                <div className="flex items-start">
                  <Phone className="h-6 w-6 chopard-text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-light chopard-text-primary mb-1">{t('phone.title')}</h3>
                    <a href="tel:+18442115462" className="chopard-text-accent hover:chopard-text-primary font-light">
                      <span className="font-light" dir="ltr">
                        {t('phone.number')}
                      </span>
                    </a>
                    <p className="chopard-text-secondary text-sm font-light">{t('phone.note')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 chopard-text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-light chopard-text-primary mb-1">{t('email.title')}</h3>
                    <a href="mailto:info@atelierlasik.com" className="chopard-text-accent hover:chopard-text-primary font-light">
                      {t('email.address')}
                    </a>
                    <p className="chopard-text-secondary text-sm font-light">{t('email.note')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-6 w-6 chopard-text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-light chopard-text-primary mb-1">{t('hours.title')}</h3>
                    <div className="chopard-text-secondary space-y-1 font-light">
                      <p>{t('hours.weekdays')}</p>
                      <p>{t('hours.saturday')}</p>
                      <p>{t('hours.sunday')}</p>
                      <p className="text-sm chopard-text-accent mt-2">{t('hours.emergency')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="chopard-glass p-6 rounded-xl border chopard-border">
                <h3 className="font-light chopard-text-primary mb-4">{t('quickActions.title')}</h3>
                <div className="space-y-3">
                  <a
                    href="tel:+18442115462"
                    className="flex items-center chopard-text-accent hover:chopard-text-primary font-light"
                  >
                    <Phone className="h-5 w-5 mr-3" />
                    <span dir="ltr">{t('quickActions.callNow')}</span>
                  </a>
                  <Link
                    to="/procedures"
                    className="flex items-center chopard-text-accent hover:chopard-text-primary font-light"
                  >
                    <User className="h-5 w-5 mr-3" />
                    {t('quickActions.learnProcedures')}
                  </Link>
                  <Link
                    to="/financing"
                    className="flex items-center chopard-text-accent hover:chopard-text-primary font-light"
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    {t('quickActions.financing')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="office-map" className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('map.title', 'Visit Our Office')}
            </h2>
            <p className="text-lg chopard-text-secondary max-w-2xl mx-auto font-light">
              {t('map.subtitle', 'Find us in Lakewood, California')}
            </p>
          </div>

          <div className="chopard-card rounded-2xl overflow-hidden shadow-lg">
            <GoogleMap
              address="5750 Downey Ave, Suite 101, Lakewood, CA 90712"
              zoom={15}
              height="500px"
              title="Clearsight LASIK Lakewood Office Location"
              allowGeolocation={true}
            />

            <div className="bg-white p-6 border-t chopard-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-6 w-6 chopard-text-accent" />
                  <div>
                    <p className="font-light chopard-text-primary font-semibold">Lakewood Office</p>
                    <p className="text-sm chopard-text-secondary">5750 Downey Ave., Suite 101, Lakewood, CA 90712</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=5750+Downey+Ave+suite+101,+Lakewood,+CA+90712"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chopard-button px-6 py-3 rounded-lg text-sm font-light transition-all duration-300"
                  >
                    Get Directions
                  </a>
                  <a
                    href="https://www.google.com/maps/place/5750+Downey+Ave+suite+101,+Lakewood,+CA+90712"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border chopard-border chopard-text-accent px-6 py-3 rounded-lg text-sm font-light hover:bg-gray-50 transition-all duration-300"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('consultation.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('consultation.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: t('consultation.steps.exam.title'),
                description: t('consultation.steps.exam.description'),
                duration: t('consultation.steps.exam.duration'),
                icon: <User className="h-8 w-8 chopard-text-accent" />
              },
              {
                step: '2',
                title: t('consultation.steps.personal.title'),
                description: t('consultation.steps.personal.description'),
                duration: t('consultation.steps.personal.duration'),
                icon: <MessageSquare className="h-8 w-8 chopard-text-accent" />
              },
              {
                step: '3',
                title: t('consultation.steps.plan.title'),
                description: t('consultation.steps.plan.description'),
                duration: t('consultation.steps.plan.duration'),
                icon: <CheckCircle className="h-8 w-8 chopard-text-accent" />
              }
            ].map((step, index) => (
              <div key={index} className="chopard-card p-8 rounded-xl text-center">
                <div className="w-16 h-16 chopard-glass rounded-full flex items-center justify-center mx-auto mb-6 border chopard-border">
                  <span className="text-2xl font-serif chopard-text-accent">{step.step}</span>
                </div>
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-serif chopard-text-primary mb-3">{step.title}</h3>
                <p className="chopard-text-secondary mb-4 font-light">{step.description}</p>
                <div className="chopard-glass px-3 py-1 rounded-full inline-block border chopard-border">
                  <span className="text-sm font-light chopard-text-accent">{step.duration}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="chopard-card p-8 rounded-xl max-w-2xl mx-auto">
              <h3 className="text-xl font-serif chopard-text-primary mb-4">{t('consultation.bring.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 chopard-text-accent mr-2" />
                    <span className="chopard-text-secondary font-light">{t('consultation.bring.glasses')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 chopard-text-accent mr-2" />
                    <span className="chopard-text-secondary font-light">{t('consultation.bring.insurance')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 chopard-text-accent mr-2" />
                    <span className="chopard-text-secondary font-light">{t('consultation.bring.medications')}</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 chopard-text-accent mr-2" />
                    <span className="chopard-text-secondary font-light">{t('consultation.bring.id')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 chopard-text-accent mr-2" />
                    <span className="chopard-text-secondary font-light">{t('consultation.bring.questions')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 chopard-text-accent mr-2" />
                    <span className="chopard-text-secondary font-light">{t('consultation.bring.driver')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            {t('emergency.title')}
          </h2>
          <p className="text-lg text-red-700 mb-6">
            {t('emergency.description')}
          </p>
          <a
            href="tel:+18442115462"
            className="inline-flex items-center bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <Phone className="mr-2 h-5 w-5" />
            <span dir="ltr">{t('emergency.phone')}</span>
          </a>
          <p className="text-sm text-red-600 mt-4">
            {t('emergency.note')}
          </p>
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
            <a
              href="tel:+18442115462"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              <Phone className="mr-2 h-5 w-5" />
              <span dir="ltr">{t('cta.call')}</span>
            </a>
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

export default Contact;