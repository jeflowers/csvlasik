/**
 * ClearSight LASIK - Medical History Form
 *
 * Form for capturing patient medical history information.
 * Tab 2 of the patient forms system.
 *
 * @module components/forms/MedicalHistoryForm
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MedicalHistoryData } from '../../types/PatientForms';
import { submitMedicalHistory } from '../../services/patientFormsService';

const MedicalHistoryForm: React.FC = () => {
  const { t } = useTranslation('patientForms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<MedicalHistoryData>({
    currentEyeConditions: '',
    previousEyeSurgeries: '',
    currentMedications: '',
    drugAllergies: '',
    hasDiabetes: undefined,
    familyHistoryEyeDisease: undefined,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'hasDiabetes' || name === 'familyHistoryEyeDisease') {
      const boolValue = value === 'yes' ? true : value === 'no' ? false : undefined;
      setFormData((prev) => ({ ...prev, [name]: boolValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await submitMedicalHistory(formData);

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          currentEyeConditions: '',
          previousEyeSurgeries: '',
          currentMedications: '',
          drugAllergies: '',
          hasDiabetes: undefined,
          familyHistoryEyeDisease: undefined,
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
          {t('success.medicalHistory')}
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Current Eye Conditions */}
      <div>
        <label
          htmlFor="currentEyeConditions"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('medicalHistory.currentEyeConditions.label')}
        </label>
        <textarea
          id="currentEyeConditions"
          name="currentEyeConditions"
          value={formData.currentEyeConditions}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('medicalHistory.currentEyeConditions.placeholder')}
        />
      </div>

      {/* Previous Eye Surgeries */}
      <div>
        <label
          htmlFor="previousEyeSurgeries"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('medicalHistory.previousEyeSurgeries.label')}
        </label>
        <textarea
          id="previousEyeSurgeries"
          name="previousEyeSurgeries"
          value={formData.previousEyeSurgeries}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('medicalHistory.previousEyeSurgeries.placeholder')}
        />
      </div>

      {/* Current Medications */}
      <div>
        <label
          htmlFor="currentMedications"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('medicalHistory.currentMedications.label')}
        </label>
        <textarea
          id="currentMedications"
          name="currentMedications"
          value={formData.currentMedications}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('medicalHistory.currentMedications.placeholder')}
        />
      </div>

      {/* Drug Allergies */}
      <div>
        <label
          htmlFor="drugAllergies"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('medicalHistory.drugAllergies.label')}
        </label>
        <input
          type="text"
          id="drugAllergies"
          name="drugAllergies"
          value={formData.drugAllergies}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('medicalHistory.drugAllergies.placeholder')}
        />
      </div>

      {/* Has Diabetes & Family History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="hasDiabetes"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('medicalHistory.hasDiabetes.label')}
          </label>
          <select
            id="hasDiabetes"
            name="hasDiabetes"
            value={
              formData.hasDiabetes === true
                ? 'yes'
                : formData.hasDiabetes === false
                ? 'no'
                : ''
            }
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">{t('medicalHistory.hasDiabetes.options.select')}</option>
            <option value="yes">{t('medicalHistory.hasDiabetes.options.yes')}</option>
            <option value="no">{t('medicalHistory.hasDiabetes.options.no')}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="familyHistoryEyeDisease"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('medicalHistory.familyHistoryEyeDisease.label')}
          </label>
          <select
            id="familyHistoryEyeDisease"
            name="familyHistoryEyeDisease"
            value={
              formData.familyHistoryEyeDisease === true
                ? 'yes'
                : formData.familyHistoryEyeDisease === false
                ? 'no'
                : ''
            }
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">{t('medicalHistory.familyHistoryEyeDisease.options.select')}</option>
            <option value="yes">{t('medicalHistory.familyHistoryEyeDisease.options.yes')}</option>
            <option value="no">{t('medicalHistory.familyHistoryEyeDisease.options.no')}</option>
          </select>
        </div>
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

export default MedicalHistoryForm;
