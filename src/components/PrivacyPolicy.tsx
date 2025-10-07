import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Lock, Globe, Mail, Phone } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation(['privacy', 'common']);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Shield className="h-12 w-12 text-teal-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-lg text-gray-600">
          {t('subtitle')}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {t('lastUpdated')}: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="h-6 w-6 mr-2 text-teal-600" />
            {t('sections.collection.title')}
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>{t('sections.collection.medicalNotice.title')}:</strong> {t('sections.collection.medicalNotice.description')}
            </p>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('sections.collection.personal.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.collection.personal.items.contact')}</li>
            <li>{t('sections.collection.personal.items.medical')}</li>
            <li>{t('sections.collection.personal.items.insurance')}</li>
            <li>{t('sections.collection.personal.items.appointments')}</li>
            <li>{t('sections.collection.personal.items.outcomes')}</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{t('sections.collection.technical.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.collection.technical.items.ip')}</li>
            <li>{t('sections.collection.technical.items.usage')}</li>
            <li>{t('sections.collection.technical.items.language')}</li>
            <li>{t('sections.collection.technical.items.device')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Lock className="h-6 w-6 mr-2 text-teal-600" />
            {t('sections.usage.title')}
          </h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('sections.usage.medical.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.usage.medical.items.consultations')}</li>
            <li>{t('sections.usage.medical.items.scheduling')}</li>
            <li>{t('sections.usage.medical.items.communication')}</li>
            <li>{t('sections.usage.medical.items.records')}</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{t('sections.usage.website.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.usage.website.items.personalization')}</li>
            <li>{t('sections.usage.website.items.language')}</li>
            <li>{t('sections.usage.website.items.improvement')}</li>
            <li>{t('sections.usage.website.items.inquiries')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Globe className="h-6 w-6 mr-2 text-teal-600" />
            {t('sections.gdpr.title')}
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">
              <strong>{t('sections.gdpr.euNotice.title')}:</strong> {t('sections.gdpr.euNotice.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('sections.gdpr.rights.title')}:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>{t('sections.gdpr.rights.access.title')}:</strong> {t('sections.gdpr.rights.access.description')}</li>
                <li><strong>{t('sections.gdpr.rights.rectification.title')}:</strong> {t('sections.gdpr.rights.rectification.description')}</li>
                <li><strong>{t('sections.gdpr.rights.erasure.title')}:</strong> {t('sections.gdpr.rights.erasure.description')}</li>
                <li><strong>{t('sections.gdpr.rights.portability.title')}:</strong> {t('sections.gdpr.rights.portability.description')}</li>
                <li><strong>{t('sections.gdpr.rights.object.title')}:</strong> {t('sections.gdpr.rights.object.description')}</li>
                <li><strong>{t('sections.gdpr.rights.restriction.title')}:</strong> {t('sections.gdpr.rights.restriction.description')}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('sections.gdpr.exercise.title')}:</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-teal-600 mr-2" />
                  <span className="text-sm">{t('sections.gdpr.exercise.email')}: privacy@clearsightlasik.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-teal-600 mr-2" />
                  <span className="text-sm">{t('sections.gdpr.exercise.phone')}: <span dir="ltr">(844) 211-5462</span></span>
                </div>
                <p className="text-sm text-gray-600">
                  {t('sections.gdpr.exercise.response')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('sections.security.title')}</h2>
          <p className="text-gray-700 mb-4">
            {t('sections.security.description')}:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.security.measures.encryption')}</li>
            <li>{t('sections.security.measures.assessments')}</li>
            <li>{t('sections.security.measures.access')}</li>
            <li>{t('sections.security.measures.training')}</li>
            <li>{t('sections.security.measures.incident')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">International Transfers</h2>
          <p className="text-gray-700 mb-4">
            Our translation services may process data outside your country of residence. We ensure appropriate safeguards:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Standard Contractual Clauses with service providers</li>
            <li>Adequacy decisions where applicable</li>
            <li>Medical terminology protection during translation</li>
            <li>Minimal data retention by translation services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('sections.contact.title')}</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('sections.contact.dpo.title')}</h3>
            <div className="space-y-2">
              <p className="text-gray-700">{t('sections.contact.dpo.organization')}</p>
              <p className="text-gray-700">{t('sections.contact.dpo.address1')}</p>
              <p className="text-gray-700">{t('sections.contact.dpo.address2')}</p>
              <div className="flex items-center mt-3">
                <Mail className="h-4 w-4 text-teal-600 mr-2" />
                <a href="mailto:privacy@clearsightlasik.com" className="text-teal-600 hover:text-teal-700">
                  privacy@clearsightlasik.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-teal-600 mr-2" />
                <a href="tel:+18442115462" className="text-teal-600 hover:text-teal-700" dir="ltr">
                  (844) 211-5462
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;