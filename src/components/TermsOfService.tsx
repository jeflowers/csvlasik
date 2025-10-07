import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Shield, Eye, Scale, Mail, Phone } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation(['terms', 'common']);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Scale className="h-12 w-12 text-teal-600 mx-auto mb-4" />
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
            <FileText className="h-6 w-6 mr-2 text-teal-600" />
            {t('sections.acceptance.title')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('sections.acceptance.description')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="h-6 w-6 mr-2 text-teal-600" />
            {t('sections.services.title')}
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>{t('sections.services.medicalNotice.title')}:</strong> {t('sections.services.medicalNotice.description')}
            </p>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('sections.services.vision.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.services.vision.items.lasik')}</li>
            <li>{t('sections.services.vision.items.prk')}</li>
            <li>{t('sections.services.vision.items.icl')}</li>
            <li>{t('sections.services.vision.items.consultations')}</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{t('sections.services.website.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.services.website.items.information')}</li>
            <li>{t('sections.services.website.items.scheduling')}</li>
            <li>{t('sections.services.website.items.resources')}</li>
            <li>{t('sections.services.website.items.communication')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-teal-600" />
            {t('sections.responsibilities.title')}
          </h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('sections.responsibilities.user.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.responsibilities.user.items.accurate')}</li>
            <li>{t('sections.responsibilities.user.items.lawful')}</li>
            <li>{t('sections.responsibilities.user.items.confidential')}</li>
            <li>{t('sections.responsibilities.user.items.instructions')}</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{t('sections.responsibilities.medical.title')}</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>{t('sections.responsibilities.medical.items.consultation')}</li>
            <li>{t('sections.responsibilities.medical.items.disclosure')}</li>
            <li>{t('sections.responsibilities.medical.items.followup')}</li>
            <li>{t('sections.responsibilities.medical.items.emergency')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('sections.limitations.title')}</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>{t('sections.limitations.disclaimer.title')}:</strong> {t('sections.limitations.disclaimer.description')}
            </p>
          </div>
          <p className="text-gray-700 mb-4">
            {t('sections.limitations.description')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('sections.contact.title')}</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('sections.contact.legal.title')}</h3>
            <div className="space-y-2">
              <p className="text-gray-700">{t('sections.contact.legal.organization')}</p>
              <p className="text-gray-700">{t('sections.contact.legal.address1')}</p>
              <p className="text-gray-700">{t('sections.contact.legal.address2')}</p>
              <div className="flex items-center mt-3">
                <Mail className="h-4 w-4 text-teal-600 mr-2" />
                <a href="mailto:legal@clearsightlasik.com" className="text-teal-600 hover:text-teal-700">
                  legal@clearsightlasik.com
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

export default TermsOfService;