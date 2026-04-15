import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send } from 'lucide-react';
import type { ConsentFormData, ValidationErrors } from '../../types/PatientForms';
import {
  submitConsentForm,
  validateSignatureDate,
} from '../../services/patientFormsService';

interface Props {
  onPrevious?: () => void;
  onSubmitSuccess?: () => void;
}

const ConsentForm: React.FC<Props> = ({ onPrevious, onSubmitSuccess }) => {
  const { t } = useTranslation('patientForms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<ConsentFormData>({
    hipaaPrivacyAcknowledgment: false,
    consentToTreatment: false,
    patientSignature: '',
    signatureDate: '',
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.hipaaPrivacyAcknowledgment || !formData.consentToTreatment) {
      newErrors.consents = t('validation.consentRequired');
    }

    if (!formData.patientSignature.trim()) {
      newErrors.patientSignature = t('validation.required');
    } else if (formData.patientSignature.trim().length < 2) {
      newErrors.patientSignature = t('validation.signatureTooShort');
    }

    if (!formData.signatureDate) {
      newErrors.signatureDate = t('validation.required');
    } else if (!validateSignatureDate(formData.signatureDate)) {
      newErrors.signatureDate = t('validation.invalidSignatureDate');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    formData.hipaaPrivacyAcknowledgment &&
    formData.consentToTreatment &&
    formData.patientSignature.trim().length >= 2 &&
    formData.signatureDate !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await submitConsentForm(formData);

      if (result.success) {
        setSubmitSuccess(true);
        onSubmitSuccess?.();
        setFormData({
          hipaaPrivacyAcknowledgment: false,
          consentToTreatment: false,
          patientSignature: '',
          signatureDate: '',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg text-sm">
          {t('success.consent')}
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      {errors.consents && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {errors.consents}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          {t('consent.hipaaTitle')}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {t('consent.hipaaBody')}
        </p>
        <label className="flex items-start">
          <input
            type="checkbox"
            name="hipaaPrivacyAcknowledgment"
            checked={formData.hipaaPrivacyAcknowledgment}
            onChange={handleCheckboxChange}
            className="mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
            aria-required="true"
            aria-invalid={!!errors.consents}
          />
          <span className="ml-3 text-sm text-gray-700">
            {t('consent.hipaaCheckbox')}
          </span>
        </label>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          {t('consent.treatmentTitle')}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {t('consent.treatmentBody')}
        </p>
        <label className="flex items-start">
          <input
            type="checkbox"
            name="consentToTreatment"
            checked={formData.consentToTreatment}
            onChange={handleCheckboxChange}
            className="mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
            aria-required="true"
            aria-invalid={!!errors.consents}
          />
          <span className="ml-3 text-sm text-gray-700">
            {t('consent.treatmentCheckbox')}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div>
          <label
            htmlFor="patientSignature"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('consent.patientSignature.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="text"
            id="patientSignature"
            name="patientSignature"
            value={formData.patientSignature}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.patientSignature ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('consent.patientSignature.placeholder')}
            aria-required="true"
            aria-invalid={!!errors.patientSignature}
            aria-describedby={errors.patientSignature ? 'patientSignature-error' : undefined}
          />
          {errors.patientSignature && (
            <p id="patientSignature-error" className="mt-1 text-sm text-red-600">
              {errors.patientSignature}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signatureDate"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('consent.signatureDate.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="date"
            id="signatureDate"
            name="signatureDate"
            value={formData.signatureDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.signatureDate ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.signatureDate}
            aria-describedby={errors.signatureDate ? 'signatureDate-error' : undefined}
          />
          {errors.signatureDate && (
            <p id="signatureDate-error" className="mt-1 text-sm text-red-600">
              {errors.signatureDate}
            </p>
          )}
        </div>
      </div>

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
              <Send className="h-4 w-4" />
              {t('buttons.submitForm', { defaultValue: 'Submit All Forms' })}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ConsentForm;
