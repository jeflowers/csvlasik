/**
 * ClearSight LASIK - Insurance Information Form
 *
 * Form for capturing patient insurance provider and policy information.
 * Tab 3 of the patient forms system.
 *
 * @module components/forms/InsuranceInfoForm
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InsuranceInfoData } from '../../types/PatientForms';
import { submitInsuranceInfo } from '../../services/patientFormsService';

const InsuranceInfoForm: React.FC = () => {
  const { t } = useTranslation('patientForms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<InsuranceInfoData>({
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    policyholderName: '',
    relationshipToPatient: '',
    secondaryInsurance: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await submitInsuranceInfo(formData);

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          insuranceProvider: '',
          policyNumber: '',
          groupNumber: '',
          policyholderName: '',
          relationshipToPatient: '',
          secondaryInsurance: '',
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
          {t('success.insuranceInfo')}
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Insurance Provider */}
      <div>
        <label
          htmlFor="insuranceProvider"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('insuranceInfo.insuranceProvider.label')}
        </label>
        <input
          type="text"
          id="insuranceProvider"
          name="insuranceProvider"
          value={formData.insuranceProvider}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('insuranceInfo.insuranceProvider.placeholder')}
        />
      </div>

      {/* Policy Number & Group Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="policyNumber"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('insuranceInfo.policyNumber.label')}
          </label>
          <input
            type="text"
            id="policyNumber"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('insuranceInfo.policyNumber.placeholder')}
          />
        </div>

        <div>
          <label
            htmlFor="groupNumber"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('insuranceInfo.groupNumber.label')}
          </label>
          <input
            type="text"
            id="groupNumber"
            name="groupNumber"
            value={formData.groupNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('insuranceInfo.groupNumber.placeholder')}
          />
        </div>
      </div>

      {/* Policyholder Name & Relationship to Patient */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="policyholderName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('insuranceInfo.policyholderName.label')}
          </label>
          <input
            type="text"
            id="policyholderName"
            name="policyholderName"
            value={formData.policyholderName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('insuranceInfo.policyholderName.placeholder')}
          />
        </div>

        <div>
          <label
            htmlFor="relationshipToPatient"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('insuranceInfo.relationshipToPatient.label')}
          </label>
          <select
            id="relationshipToPatient"
            name="relationshipToPatient"
            value={formData.relationshipToPatient}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">
              {t('insuranceInfo.relationshipToPatient.options.select')}
            </option>
            <option value="self">
              {t('insuranceInfo.relationshipToPatient.options.self')}
            </option>
            <option value="spouse">
              {t('insuranceInfo.relationshipToPatient.options.spouse')}
            </option>
            <option value="parent">
              {t('insuranceInfo.relationshipToPatient.options.parent')}
            </option>
            <option value="other">
              {t('insuranceInfo.relationshipToPatient.options.other')}
            </option>
          </select>
        </div>
      </div>

      {/* Secondary Insurance */}
      <div>
        <label
          htmlFor="secondaryInsurance"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('insuranceInfo.secondaryInsurance.label')}
        </label>
        <input
          type="text"
          id="secondaryInsurance"
          name="secondaryInsurance"
          value={formData.secondaryInsurance}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('insuranceInfo.secondaryInsurance.placeholder')}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('buttons.submitting') : t('buttons.submitForm')}
      </button>
    </form>
  );
};

export default InsuranceInfoForm;
