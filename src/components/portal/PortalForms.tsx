import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Clipboard, CreditCard, Shield, CheckCircle2, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePatient } from '../../hooks/usePatient';
import { supabase } from '../../lib/supabase';
import type {
  PatientFormTab,
  PatientRegistrationData,
  MedicalHistoryData,
  InsuranceInfoData,
  ConsentFormData,
  VisionCorrectionData,
} from '../../types/PatientForms';
import {
  submitAllPatientForms,
  loadLatestSubmission,
  updateAllPatientForms,
  type ExistingSubmission,
} from '../../services/patientFormsService';
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

const PortalForms: React.FC = () => {
  const { t } = useTranslation('patientForms');
  const { user } = usePatient();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = searchParams.get('edit') === 'true';

  const initialStep = parseInt(searchParams.get('step') || '0', 10);
  const [activeStep, setActiveStep] = useState(
    Number.isFinite(initialStep) && initialStep >= 0 && initialStep < 4 ? initialStep : 0
  );
  const [loading, setLoading] = useState(true);
  const [existingIds, setExistingIds] = useState<Pick<ExistingSubmission, 'registrationId' | 'medicalHistoryId' | 'insuranceId' | 'consentId'> | null>(null);
  const [status, setStatus] = useState<CompletionStatus>({
    registration: false,
    medicalHistory: false,
    insuranceInfo: false,
    consent: false,
  });

  const [registration, setRegistration] = useState<PatientRegistrationData>({ ...initialRegistration });
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData>({ ...initialMedicalHistory });
  const [insurance, setInsurance] = useState<InsuranceInfoData>({ ...initialInsurance });
  const [consent, setConsent] = useState<ConsentFormData>({ ...initialConsent });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!user) return;

    async function initialize() {
      setLoading(true);

      if (isEditMode) {
        const { data, error } = await loadLatestSubmission();
        if (data) {
          setRegistration(data.registration);
          setMedicalHistory(data.medicalHistory);
          setInsurance(data.insurance);
          setConsent({ ...data.consent, signatureDate: '', patientSignature: '' });
          setExistingIds({
            registrationId: data.registrationId,
            medicalHistoryId: data.medicalHistoryId,
            insuranceId: data.insuranceId,
            consentId: data.consentId,
          });
          setStatus({ registration: true, medicalHistory: true, insuranceInfo: true, consent: true });
        } else if (error) {
          navigate('/portal/forms', { replace: true });
        }
      } else {
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

      setLoading(false);
    }

    initialize();
  }, [user, isEditMode]);

  const goNext = () => {
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
      const formPayload = { registration, medicalHistory, insurance, consent };

      const result = isEditMode && existingIds
        ? await updateAllPatientForms(existingIds, formPayload)
        : await submitAllPatientForms(formPayload);

      if (result.success) {
        setSubmitSuccess(true);
        setStatus({
          registration: true,
          medicalHistory: true,
          insuranceInfo: true,
          consent: true,
        });
      } else {
        setSubmitError(result.error || t('error.generic'));
      }
    } catch {
      setSubmitError(t('error.network'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCompleted = !isEditMode && status.registration && status.medicalHistory && status.insuranceInfo && status.consent;
  const statusKeys: PatientFormTab[] = ['registration', 'medicalHistory', 'insuranceInfo', 'consent'];

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
            submitLabel={isEditMode ? 'Update All Forms' : undefined}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-sm">{isEditMode ? 'Loading your forms...' : 'Checking status...'}</span>
        </div>
      </div>
    );
  }

  if (allCompleted || submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mx-auto mb-6">
            <Check className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-3">
            {submitSuccess && isEditMode
              ? 'Forms Updated Successfully'
              : t('success.allForms', { defaultValue: 'Forms Submitted Successfully' })}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {submitSuccess && isEditMode
              ? 'Your patient forms have been updated. Our team will review the changes.'
              : t('success.allFormsDescription', { defaultValue: 'Thank you for completing your patient forms. Our team will review your information and contact you shortly.' })}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/portal/submissions')}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Submissions
            </button>
            <button
              onClick={() => navigate('/portal')}
              className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-gray-900">
          {isEditMode ? 'Update Patient Forms' : 'Patient Forms'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode
            ? 'Review and update your previously submitted information. You must re-sign the consent form to save changes.'
            : 'Complete all four forms before your appointment. Your information is encrypted and HIPAA-compliant.'}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = index === activeStep;
            const isCompleted = status[statusKeys[index]];
            const isPast = index < activeStep;
            const canClick = isEditMode && index !== activeStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled={!canClick}
                    onClick={() => {
                      if (canClick) {
                        setActiveStep(index);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                      ${canClick ? 'cursor-pointer hover:scale-110' : !isEditMode ? 'cursor-default' : ''}
                      ${isCurrent
                        ? 'border-teal-600 bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                        : isCompleted
                          ? 'border-teal-600 bg-teal-50 text-teal-600'
                          : isPast
                            ? 'border-gray-300 bg-gray-50 text-gray-500'
                            : 'border-gray-200 bg-white text-gray-400'
                      }
                    `}
                    aria-label={`${canClick ? 'Go to ' : ''}${step.label}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    {isCompleted && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-teal-600 bg-white rounded-full" />
                    )}
                  </button>
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
                        style={{
                          width: index < activeStep || status[statusKeys[index]] ? '100%' : '0%',
                        }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

        <div className="p-6 sm:p-8">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default PortalForms;
