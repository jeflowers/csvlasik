import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Stethoscope, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { MedicalHistoryData, VisionCorrectionData } from '../../types/PatientForms';
import { submitMedicalHistory } from '../../services/patientFormsService';

const SYMPTOMS = [
  'pressure_pain', 'sandy_sensation', 'throbbing', 'eyelid_crusting',
  'excessive_tearing', 'redness', 'floaters', 'mucous_discharge',
  'light_sensitivity', 'flashing_lights', 'itchiness', 'halos',
  'double_vision', 'loss_of_vision', 'blurry_vision', 'dryness',
  'burning_sensation', 'keratoconus',
] as const;

const MEDICAL_CONDITIONS = [
  'diabetes', 'heart_disease', 'hypertension', 'high_cholesterol',
  'stroke', 'arthritis', 'lupus', 'thyroid_disease', 'anemia',
  'kidney_disease', 'tuberculosis', 'cancer', 'asthma',
] as const;

const FAMILY_CONDITIONS = [
  'glaucoma', 'cataracts', 'macular_degeneration', 'retinal_detachment',
  'blindness', 'diabetes', 'hypertension', 'heart_disease', 'cancer',
] as const;

const CONTACT_TYPES = ['soft', 'hard', 'extended_wear', 'toric'] as const;

const initialVisionCorrection: VisionCorrectionData = {
  glasses: false,
  contacts: false,
  contactType: '',
  toricDetails: '',
};

const initialFormData: MedicalHistoryData = {
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

interface CheckboxGroupProps {
  items: readonly string[];
  selected: string[];
  onChange: (items: string[]) => void;
  t: (key: string) => string;
  translationPrefix: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ items, selected, onChange, t, translationPrefix }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
    {items.map((item) => (
      <label key={item} className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={selected.includes(item)}
          onChange={(e) => {
            onChange(
              e.target.checked
                ? [...selected, item]
                : selected.filter((s) => s !== item)
            );
          }}
          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 transition-colors"
        />
        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
          {t(`${translationPrefix}.${item}`)}
        </span>
      </label>
    ))}
  </div>
);

interface RadioGroupProps {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ name, value, options, onChange }) => (
  <div className="flex flex-wrap gap-4">
    {options.map((opt) => (
      <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
        />
        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
          {opt.label}
        </span>
      </label>
    ))}
  </div>
);

interface QuestionCardProps {
  children: React.ReactNode;
  className?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 sm:p-6 hover:border-gray-300 transition-colors ${className}`}>
    {children}
  </div>
);

interface Props {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmitSuccess?: () => void;
}

const MedicalHistoryForm: React.FC<Props> = ({ onPrevious, onNext, onSubmitSuccess }) => {
  const { t } = useTranslation('patientForms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<MedicalHistoryData>({ ...initialFormData });

  const updateField = <K extends keyof MedicalHistoryData>(key: K, value: MedicalHistoryData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateVisionCorrection = <K extends keyof VisionCorrectionData>(key: K, value: VisionCorrectionData[K]) => {
    setFormData((prev) => ({
      ...prev,
      visionCorrection: { ...(prev.visionCorrection || initialVisionCorrection), [key]: value },
    }));
  };

  const isFormValid =
    (formData.prescriptionChangedPastYear || '') !== '' &&
    (formData.eyeInjuries || '') !== '' &&
    (formData.eyeSurgeryHistory || '') !== '' &&
    (formData.hasAllergies || '') !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await submitMedicalHistory(formData);
      if (result.success) {
        setSubmitSuccess(true);
        onSubmitSuccess?.();
        if (onNext) {
          setTimeout(() => onNext(), 400);
        }
      } else {
        setSubmitError(result.error || t('error.generic'));
      }
    } catch {
      setSubmitError(t('error.network'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const vc = formData.visionCorrection || initialVisionCorrection;

  const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all';
  const textareaClass = `${inputClass} resize-none`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-teal-50">
          <Eye className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('medicalHistory.sectionTitle')}</h2>
          <p className="text-xs text-gray-500">{t('medicalHistory.sectionSubtitle')}</p>
        </div>
      </div>

      {submitSuccess && (
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{t('success.medicalHistory')}</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{submitError}</span>
        </div>
      )}

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q1.label')}</p>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={vc.glasses}
                onChange={(e) => updateVisionCorrection('glasses', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">{t('medicalHistory.q1.glasses')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={vc.contacts}
                onChange={(e) => updateVisionCorrection('contacts', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">{t('medicalHistory.q1.contacts')}</span>
            </label>
          </div>

          {vc.contacts && (
            <div className="pl-6 border-l-2 border-teal-100 space-y-2">
              <p className="text-xs font-medium text-gray-600">{t('medicalHistory.q1.contactTypeLabel')}</p>
              <div className="flex flex-wrap gap-3">
                {CONTACT_TYPES.map((ct) => (
                  <label key={ct} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contactType"
                      value={ct}
                      checked={vc.contactType === ct}
                      onChange={() => updateVisionCorrection('contactType', ct)}
                      className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">{t(`medicalHistory.q1.${ct}`)}</span>
                  </label>
                ))}
              </div>
              {vc.contactType === 'toric' && (
                <input
                  type="text"
                  value={vc.toricDetails || ''}
                  onChange={(e) => updateVisionCorrection('toricDetails', e.target.value)}
                  className={inputClass}
                  placeholder={t('medicalHistory.q1.toricPlaceholder')}
                />
              )}
            </div>
          )}
        </div>
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q2.label')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('medicalHistory.q2.dateLabel')}</label>
            <input
              type="text"
              value={formData.lastEyeExamDate || ''}
              onChange={(e) => updateField('lastEyeExamDate', e.target.value)}
              className={inputClass}
              placeholder={t('medicalHistory.q2.datePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('medicalHistory.q2.doctorLabel')}</label>
            <input
              type="text"
              value={formData.lastEyeExamDoctor || ''}
              onChange={(e) => updateField('lastEyeExamDoctor', e.target.value)}
              className={inputClass}
              placeholder={t('medicalHistory.q2.doctorPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('medicalHistory.q2.clinicLabel')}</label>
            <input
              type="text"
              value={formData.lastEyeExamClinic || ''}
              onChange={(e) => updateField('lastEyeExamClinic', e.target.value)}
              className={inputClass}
              placeholder={t('medicalHistory.q2.clinicPlaceholder')}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lastEyeExamMayVerify || false}
                onChange={(e) => updateField('lastEyeExamMayVerify', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">{t('medicalHistory.q2.mayVerify')}</span>
            </label>
          </div>
        </div>
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q3.label')}</p>
        <input
          type="text"
          value={formData.prescriptionAge || ''}
          onChange={(e) => updateField('prescriptionAge', e.target.value)}
          className={`${inputClass} max-w-sm`}
          placeholder={t('medicalHistory.q3.placeholder')}
        />
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q4.label')}</p>
        <RadioGroup
          name="prescriptionChanged"
          value={formData.prescriptionChangedPastYear || ''}
          options={[
            { value: 'no', label: t('medicalHistory.q4.no') },
            { value: 'yes', label: t('medicalHistory.q4.yes') },
            { value: 'not_sure', label: t('medicalHistory.q4.notSure') },
          ]}
          onChange={(v) => updateField('prescriptionChangedPastYear', v as MedicalHistoryData['prescriptionChangedPastYear'])}
        />
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q5.label')}</p>
        <CheckboxGroup
          items={SYMPTOMS}
          selected={formData.currentSymptoms || []}
          onChange={(items) => updateField('currentSymptoms', items)}
          t={t}
          translationPrefix="medicalHistory.q5.symptoms"
        />
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q6.label')}</p>
        <RadioGroup
          name="eyeInjuries"
          value={formData.eyeInjuries || ''}
          options={[
            { value: 'no', label: t('medicalHistory.q6.no') },
            { value: 'yes', label: t('medicalHistory.q6.yes') },
          ]}
          onChange={(v) => updateField('eyeInjuries', v as MedicalHistoryData['eyeInjuries'])}
        />
        {formData.eyeInjuries === 'yes' && (
          <textarea
            value={formData.eyeInjuriesDetails || ''}
            onChange={(e) => updateField('eyeInjuriesDetails', e.target.value)}
            rows={2}
            className={`${textareaClass} mt-3`}
            placeholder={t('medicalHistory.q6.detailsPlaceholder')}
          />
        )}
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q7.label')}</p>
        <RadioGroup
          name="eyeSurgery"
          value={formData.eyeSurgeryHistory || ''}
          options={[
            { value: 'no', label: t('medicalHistory.q7.no') },
            { value: 'yes', label: t('medicalHistory.q7.yes') },
          ]}
          onChange={(v) => updateField('eyeSurgeryHistory', v as MedicalHistoryData['eyeSurgeryHistory'])}
        />
        {formData.eyeSurgeryHistory === 'yes' && (
          <textarea
            value={formData.eyeSurgeryDetails || ''}
            onChange={(e) => updateField('eyeSurgeryDetails', e.target.value)}
            rows={2}
            className={`${textareaClass} mt-3`}
            placeholder={t('medicalHistory.q7.detailsPlaceholder')}
          />
        )}
      </QuestionCard>

      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50">
          <Stethoscope className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('medicalHistory.generalHealthTitle')}</h2>
          <p className="text-xs text-gray-500">{t('medicalHistory.generalHealthSubtitle')}</p>
        </div>
      </div>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q8.label')}</p>
        <CheckboxGroup
          items={MEDICAL_CONDITIONS}
          selected={formData.medicalConditions || []}
          onChange={(items) => updateField('medicalConditions', items)}
          t={t}
          translationPrefix="medicalHistory.q8.conditions"
        />
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('medicalHistory.q8.otherLabel')}</label>
          <input
            type="text"
            value={formData.medicalConditionsOther || ''}
            onChange={(e) => updateField('medicalConditionsOther', e.target.value)}
            className={inputClass}
            placeholder={t('medicalHistory.q8.otherPlaceholder')}
          />
        </div>
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q9.label')}</p>
        <textarea
          value={formData.currentMedications || ''}
          onChange={(e) => updateField('currentMedications', e.target.value)}
          rows={3}
          className={textareaClass}
          placeholder={t('medicalHistory.q9.placeholder')}
        />
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q10.label')}</p>
        <RadioGroup
          name="hasAllergies"
          value={formData.hasAllergies || ''}
          options={[
            { value: 'yes', label: t('medicalHistory.q10.yes') },
            { value: 'no', label: t('medicalHistory.q10.no') },
          ]}
          onChange={(v) => updateField('hasAllergies', v as MedicalHistoryData['hasAllergies'])}
        />
        {formData.hasAllergies === 'yes' && (
          <textarea
            value={formData.allergiesDetails || ''}
            onChange={(e) => updateField('allergiesDetails', e.target.value)}
            rows={2}
            className={`${textareaClass} mt-3`}
            placeholder={t('medicalHistory.q10.detailsPlaceholder')}
          />
        )}
      </QuestionCard>

      <QuestionCard>
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('medicalHistory.q11.label')}</p>
        <CheckboxGroup
          items={FAMILY_CONDITIONS}
          selected={formData.familyHistoryConditions || []}
          onChange={(items) => updateField('familyHistoryConditions', items)}
          t={t}
          translationPrefix="medicalHistory.q11.conditions"
        />
      </QuestionCard>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {onPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('buttons.previous', { defaultValue: 'Previous' })}
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
        >
          {isSubmitting ? t('buttons.submitting') : (
            <>
              {t('buttons.next', { defaultValue: 'Save & Continue' })}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MedicalHistoryForm;
