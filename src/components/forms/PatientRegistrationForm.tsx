/**
 * ClearSight LASIK - Patient Registration Form
 *
 * Form for capturing new patient demographic and contact information.
 * Tab 1 of the patient forms system.
 *
 * @module components/forms/PatientRegistrationForm
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PatientRegistrationData, ValidationErrors } from '../../types/PatientForms';
import {
  submitPatientRegistration,
  validateEmail,
  validatePhone,
  validateDateOfBirth,
  formatPhoneNumber,
} from '../../services/patientFormsService';

const PatientRegistrationForm: React.FC = () => {
  const { t } = useTranslation('patientForms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<PatientRegistrationData>({
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.required');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.required');
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('validation.required');
    } else if (!validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = t('validation.invalidDateOfBirth');
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('validation.required');
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = t('validation.invalidPhone');
    }
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = t('validation.required');
    } else if (!validateEmail(formData.emailAddress)) {
      newErrors.emailAddress = t('validation.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitPatientRegistration({
        ...formData,
        phoneNumber: formatPhoneNumber(formData.phoneNumber),
      });

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
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
          {t('success.registration')}
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('registration.firstName.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
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
            <p id="firstName-error" className="mt-1 text-sm text-red-600">
              {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('registration.lastName.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
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
            <p id="lastName-error" className="mt-1 text-sm text-red-600">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Date of Birth & Phone Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('registration.dateOfBirth.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-required="true"
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
          />
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="mt-1 text-sm text-red-600">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('registration.phoneNumber.label')}
            <span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
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
            <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">
              {errors.phoneNumber}
            </p>
          )}
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label
          htmlFor="emailAddress"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('registration.emailAddress.label')}
          <span className="text-red-600 ml-1">*</span>
        </label>
        <input
          type="email"
          id="emailAddress"
          name="emailAddress"
          value={formData.emailAddress}
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
          <p id="emailAddress-error" className="mt-1 text-sm text-red-600">
            {errors.emailAddress}
          </p>
        )}
      </div>

      {/* Street Address */}
      <div>
        <label
          htmlFor="streetAddress"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('registration.streetAddress.label')}
        </label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('registration.streetAddress.placeholder')}
        />
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('registration.city.label')}
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('registration.city.placeholder')}
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('registration.state.label')}
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('registration.state.placeholder')}
            maxLength={2}
          />
        </div>

        <div>
          <label
            htmlFor="zip"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {t('registration.zip.label')}
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder={t('registration.zip.placeholder')}
            maxLength={10}
          />
        </div>
      </div>

      {/* Reason for Visit */}
      <div>
        <label
          htmlFor="reasonForVisit"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('registration.reasonForVisit.label')}
        </label>
        <textarea
          id="reasonForVisit"
          name="reasonForVisit"
          value={formData.reasonForVisit}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('registration.reasonForVisit.placeholder')}
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

export default PatientRegistrationForm;
