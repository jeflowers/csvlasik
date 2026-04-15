import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import type { PatientRegistrationData, ValidationErrors } from '../../types/PatientForms';
import {
  validateEmail,
  validatePhone,
  validateDateOfBirth,
} from '../../services/patientFormsService';

interface Props {
  data: PatientRegistrationData;
  onChange: (data: PatientRegistrationData) => void;
  onNext?: () => void;
}

const PatientRegistrationForm: React.FC<Props> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation('patientForms');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = t('validation.required');
    }
    if (!data.lastName.trim()) {
      newErrors.lastName = t('validation.required');
    }
    if (!data.dateOfBirth) {
      newErrors.dateOfBirth = t('validation.required');
    } else if (!validateDateOfBirth(data.dateOfBirth)) {
      newErrors.dateOfBirth = t('validation.invalidDateOfBirth');
    }
    if (!data.phoneNumber.trim()) {
      newErrors.phoneNumber = t('validation.required');
    } else if (!validatePhone(data.phoneNumber)) {
      newErrors.phoneNumber = t('validation.invalidPhone');
    }
    if (!data.emailAddress.trim()) {
      newErrors.emailAddress = t('validation.required');
    } else if (!validateEmail(data.emailAddress)) {
      newErrors.emailAddress = t('validation.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    data.firstName.trim() !== '' &&
    data.lastName.trim() !== '' &&
    data.dateOfBirth !== '' &&
    data.phoneNumber.trim() !== '' &&
    data.emailAddress.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onNext?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('registration.firstName.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={data.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('registration.firstName.placeholder')}
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('registration.lastName.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={data.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('registration.lastName.placeholder')}
            aria-required="true"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('registration.dateOfBirth.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={data.dateOfBirth}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
          />
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('registration.phoneNumber.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={data.phoneNumber}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('registration.phoneNumber.placeholder')}
            aria-required="true"
            aria-invalid={!!errors.phoneNumber}
            aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
          />
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="emailAddress" className="block text-sm font-semibold text-gray-700 mb-2">
          {t('registration.emailAddress.label')}
          <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          type="email"
          id="emailAddress"
          name="emailAddress"
          value={data.emailAddress}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
            errors.emailAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('registration.emailAddress.placeholder')}
          aria-required="true"
          aria-invalid={!!errors.emailAddress}
          aria-describedby={errors.emailAddress ? 'emailAddress-error' : undefined}
        />
        {errors.emailAddress && (
          <p id="emailAddress-error" className="mt-1 text-sm text-red-600">{errors.emailAddress}</p>
        )}
      </div>

      <div>
        <label htmlFor="streetAddress" className="block text-sm font-semibold text-gray-700 mb-2">
          {t('registration.streetAddress.label')}
        </label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          value={data.streetAddress}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('registration.streetAddress.placeholder')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('registration.city.label')}
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={data.city}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('registration.city.placeholder')}
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('registration.state.label')}
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={data.state}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('registration.state.placeholder')}
            maxLength={2}
          />
        </div>

        <div>
          <label htmlFor="zip" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('registration.zip.label')}
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={data.zip}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('registration.zip.placeholder')}
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <label htmlFor="reasonForVisit" className="block text-sm font-semibold text-gray-700 mb-2">
          {t('registration.reasonForVisit.label')}
        </label>
        <textarea
          id="reasonForVisit"
          name="reasonForVisit"
          value={data.reasonForVisit}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('registration.reasonForVisit.placeholder')}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={!isFormValid}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
        >
          {t('buttons.next', { defaultValue: 'Save & Continue' })}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default PatientRegistrationForm;
