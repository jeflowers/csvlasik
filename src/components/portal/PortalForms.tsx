import React, { useState, useEffect } from 'react';
import { FileText, Clipboard, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import { supabase } from '../../lib/supabase';
import type { PatientFormTab } from '../../types/PatientForms';
import PatientRegistrationForm from '../forms/PatientRegistrationForm';
import MedicalHistoryForm from '../forms/MedicalHistoryForm';
import InsuranceInfoForm from '../forms/InsuranceInfoForm';
import ConsentForm from '../forms/ConsentForm';

interface CompletionStatus {
  registration: boolean;
  medicalHistory: boolean;
  insuranceInfo: boolean;
  consent: boolean;
}

const PortalForms: React.FC = () => {
  const { user } = usePatient();
  const [activeTab, setActiveTab] = useState<PatientFormTab>('registration');
  const [status, setStatus] = useState<CompletionStatus>({
    registration: false,
    medicalHistory: false,
    insuranceInfo: false,
    consent: false,
  });

  useEffect(() => {
    if (!user) return;

    async function checkStatus() {
      const [reg, med, ins, con] = await Promise.all([
        supabase.from('patient_registrations').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('patient_medical_histories').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('patient_insurance_info').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('patient_consent_forms').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);

      setStatus({
        registration: (reg.count || 0) > 0,
        medicalHistory: (med.count || 0) > 0,
        insuranceInfo: (ins.count || 0) > 0,
        consent: (con.count || 0) > 0,
      });
    }

    checkStatus();
  }, [user]);

  const tabs = [
    { id: 'registration' as PatientFormTab, icon: FileText, label: 'Registration', done: status.registration },
    { id: 'medicalHistory' as PatientFormTab, icon: Clipboard, label: 'Medical History', done: status.medicalHistory },
    { id: 'insuranceInfo' as PatientFormTab, icon: CreditCard, label: 'Insurance', done: status.insuranceInfo },
    { id: 'consent' as PatientFormTab, icon: Shield, label: 'Consent', done: status.consent },
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">Patient Forms</h1>
        <p className="text-gray-500 mt-1">
          Complete all four forms before your appointment. Your information is encrypted and HIPAA-compliant.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div role="tablist" className="border-b border-gray-200">
          <div className="grid grid-cols-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex flex-col items-center gap-1.5 px-3 py-4 text-xs font-medium
                    transition-all duration-200 border-b-2
                    ${isActive
                      ? 'text-teal-600 border-teal-600 bg-teal-50/50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {tab.done && (
                      <CheckCircle2 className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-teal-600 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default PortalForms;
