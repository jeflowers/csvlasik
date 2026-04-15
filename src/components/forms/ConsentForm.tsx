/**
 * ClearSight LASIK - Consent Form
 *
 * Form for capturing HIPAA privacy acknowledgment and consent to treatment.
 * Tab 4 of the patient forms system.
 *
 * @module components/forms/ConsentForm
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ConsentFormData, ValidationErrors } from '../../types/PatientForms';
import {
  submitConsentForm,
  validateSignatureDate,
} from '../../services/patientFormsService';

const ConsentForm: React.FC = () => {
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitConsentForm(formData);

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          hipaaPrivacyAcknowledgment: false,
          consentToTreatment: false,
          patientSignature: '',
          signatureDate: '',
        });
      } else {
        setSubmitError(result.error || t('error.generic'));
      }
    } catch (err) {
      setSubmitError(t('error.network'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg">
          {t('success.consent')}
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Consent Error */}
      {errors.consents && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errors.consents}
        </div>
      )}

      {/* HIPAA Privacy Acknowledgment Card */}
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

      {/* Consent to Treatment Card */}
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

      {/* Signature Fields */}
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className="w-full bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('buttons.submitting') : t('buttons.submitForm')}
      </button>
    </form>
  );
};

export default ConsentForm;
