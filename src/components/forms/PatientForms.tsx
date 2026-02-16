/**
 * ClearSight LASIK - Patient Forms Container
 *
 * Main container component for the tabbed patient forms interface.
 * Manages tab navigation and renders the appropriate form component.
 *
 * @module components/forms/PatientForms
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clipboard, CreditCard, Shield } from 'lucide-react';
import type { PatientFormTab } from '../../types/PatientForms';
import PatientRegistrationForm from './PatientRegistrationForm';
import MedicalHistoryForm from './MedicalHistoryForm';
import InsuranceInfoForm from './InsuranceInfoForm';
import ConsentForm from './ConsentForm';

const PatientForms: React.FC = () => {
  const { t } = useTranslation('patientForms');
  const [activeTab, setActiveTab] = useState<PatientFormTab>('registration');

  const tabs = [
    { id: 'registration' as PatientFormTab, icon: FileText },
    { id: 'medicalHistory' as PatientFormTab, icon: Clipboard },
    { id: 'insuranceInfo' as PatientFormTab, icon: CreditCard },
    { id: 'consent' as PatientFormTab, icon: Shield },
  ];

  const renderForm = () => {
    switch (activeTab) {
      case 'registration':
        return <PatientRegistrationForm />;
      case 'medicalHistory':
        return <MedicalHistoryForm />;
      case 'insuranceInfo':
        return <InsuranceInfoForm />;
      case 'consent':
        return <ConsentForm />;
      default:
        return <PatientRegistrationForm />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <span className="text-sm font-semibold tracking-widest uppercase text-teal-600">
            {t('badge')}
          </span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        role="tablist"
        className="bg-white rounded-t-xl border-b border-gray-200 shadow-sm"
      >
        <div className="grid grid-cols-4 gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium
                  transition-all duration-200 border-b-2
                  ${
                    isActive
                      ? 'text-teal-600 border-teal-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{t(`tabs.${tab.id}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
        className="bg-white rounded-b-xl shadow-sm p-8"
      >
        {renderForm()}
      </div>
    </div>
  );
};

export default PatientForms;
