import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Clipboard, CreditCard, Shield, Check } from 'lucide-react';
import type {
  PatientFormTab,
  PatientRegistrationData,
  MedicalHistoryData,
  InsuranceInfoData,
  ConsentFormData,
  VisionCorrectionData,
} from '../../types/PatientForms';
import { submitAllPatientForms } from '../../services/patientFormsService';
import PatientRegistrationForm from './PatientRegistrationForm';
import MedicalHistoryForm from './MedicalHistoryForm';
import InsuranceInfoForm from './InsuranceInfoForm';
import ConsentForm from './ConsentForm';

const STEPS: { id: PatientFormTab; icon: React.ElementType; label: string }[] = [
  { id: 'registration', icon: FileText, label: 'Registration' },
  { id: 'medicalHistory', icon: Clipboard, label: 'Medical History' },
  { id: 'insuranceInfo', icon: CreditCard, label: 'Insurance' },
  { id: 'consent', icon: Shield, label: 'Consent' },
];

const initialVisionCorrection: VisionCorrectionData = {
  glasses: false,
  contacts: false,
  contactType: '',
  toricDetails: '',
};

const initialRegistration: PatientRegistrationData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phoneNumber: '',
  emailAddress: '',
  streetAddress: '',
  city: '',
  state: '',
  zip: '',
  reasonForVisit: '',
};

const initialMedicalHistory: MedicalHistoryData = {
  visionCorrection: { ...initialVisionCorrection },
  lastEyeExamDate: '',
  lastEyeExamDoctor: '',
  lastEyeExamClinic: '',
  lastEyeExamMayVerify: false,
  prescriptionAge: '',
  prescriptionChangedPastYear: '',
  currentSymptoms: [],
  eyeInjuries: '',
  eyeInjuriesDetails: '',
  eyeSurgeryHistory: '',
  eyeSurgeryDetails: '',
  medicalConditions: [],
  medicalConditionsOther: '',
  currentMedications: '',
  hasAllergies: '',
  allergiesDetails: '',
  familyHistoryConditions: [],
};

const initialInsurance: InsuranceInfoData = {
  hasHsaFsa: '',
  hsaFsaProvider: '',
  accountHolderName: '',
  estimatedBalance: '',
  interestedInPaymentPlan: '',
  additionalNotes: '',
};

const initialConsent: ConsentFormData = {
  hipaaPrivacyAcknowledgment: false,
  consentToTreatment: false,
  patientSignature: '',
  signatureDate: '',
};

const PatientForms: React.FC = () => {
  const { t } = useTranslation('patientForms');
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false]);

  const [registration, setRegistration] = useState<PatientRegistrationData>({ ...initialRegistration });
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData>({ ...initialMedicalHistory });
  const [insurance, setInsurance] = useState<InsuranceInfoData>({ ...initialInsurance });
  const [consent, setConsent] = useState<ConsentFormData>({ ...initialConsent });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const goNext = () => {
    setCompleted((prev) => {
      const next = [...prev];
      next[activeStep] = true;
      return next;
    });
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await submitAllPatientForms({
        registration,
        medicalHistory,
        insurance,
        consent,
      });

      if (result.success) {
        setSubmitSuccess(true);
        setCompleted([true, true, true, true]);
      } else {
        setSubmitError(result.error || t('error.generic'));
      }
    } catch {
      setSubmitError(t('error.network'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    const currentTab = STEPS[activeStep].id;
    switch (currentTab) {
      case 'registration':
        return (
          <PatientRegistrationForm
            data={registration}
            onChange={setRegistration}
            onNext={goNext}
          />
        );
      case 'medicalHistory':
        return (
          <MedicalHistoryForm
            data={medicalHistory}
            onChange={setMedicalHistory}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        );
      case 'insuranceInfo':
        return (
          <InsuranceInfoForm
            data={insurance}
            onChange={setInsurance}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        );
      case 'consent':
        return (
          <ConsentForm
            data={consent}
            onChange={setConsent}
            onPrevious={goPrevious}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = index === activeStep;
            const isCompleted = completed[index];
            const isPast = index < activeStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                      ${isCurrent
                        ? 'border-teal-600 bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                        : isCompleted
                          ? 'border-teal-600 bg-teal-50 text-teal-600'
                          : isPast
                            ? 'border-gray-300 bg-gray-50 text-gray-500'
                            : 'border-gray-200 bg-white text-gray-400'
                      }
                    `}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium text-center hidden sm:block ${
                      isCurrent ? 'text-teal-700' : isCompleted ? 'text-teal-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-4 mb-6 sm:mb-4">
                    <div className="h-0.5 rounded-full bg-gray-200 relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-teal-600 rounded-full transition-all duration-500"
                        style={{ width: index < activeStep ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {submitSuccess ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mx-auto mb-6">
            <Check className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-3">
            {t('success.allForms', { defaultValue: 'Forms Submitted Successfully' })}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {t('success.allFormsDescription', { defaultValue: 'Thank you for completing your patient forms. Our team will review your information and contact you shortly.' })}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold">
                {activeStep + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{STEPS[activeStep].label}</p>
                <p className="text-xs text-gray-500">Step {activeStep + 1} of {STEPS.length}</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            {renderForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForms;
