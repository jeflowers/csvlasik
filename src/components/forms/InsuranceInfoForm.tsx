import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import type { InsuranceInfoData } from '../../types/PatientForms';
import { submitInsuranceInfo } from '../../services/patientFormsService';

interface Props {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmitSuccess?: () => void;
}

const InsuranceInfoForm: React.FC<Props> = ({ onPrevious, onNext, onSubmitSuccess }) => {
  const { t } = useTranslation('patientForms');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState<InsuranceInfoData>({
    hasHsaFsa: '',
    hsaFsaProvider: '',
    accountHolderName: '',
    estimatedBalance: '',
    interestedInPaymentPlan: '',
    additionalNotes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

  const showAccountFields = formData.hasHsaFsa === 'hsa' || formData.hasHsaFsa === 'fsa' || formData.hasHsaFsa === 'both';

  const isFormValid =
    formData.hasHsaFsa !== '' &&
    formData.interestedInPaymentPlan !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg text-sm">
          {t('success.insuranceInfo')}
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">{t('hsaFsa.notice.title')}</p>
          <p className="text-sm text-amber-800 mt-1">{t('hsaFsa.notice.body')}</p>
        </div>
      </div>

      <div>
        <label
          htmlFor="hasHsaFsa"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('hsaFsa.hasAccount.label')}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['hsa', 'fsa', 'both', 'none'] as const).map((option) => (
            <label
              key={option}
              className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-all text-sm font-medium ${
                formData.hasHsaFsa === option
                  ? 'border-teal-600 bg-teal-50 text-teal-700 ring-2 ring-teal-600/20'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="hasHsaFsa"
                value={option}
                checked={formData.hasHsaFsa === option}
                onChange={handleChange}
                className="sr-only"
              />
              {option === 'hsa' || option === 'fsa' ? (
                <Wallet className="h-4 w-4" />
              ) : null}
              {t(`hsaFsa.hasAccount.options.${option}`)}
            </label>
          ))}
        </div>
      </div>

      {showAccountFields && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="hsaFsaProvider"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t('hsaFsa.provider.label')}
              </label>
              <input
                type="text"
                id="hsaFsaProvider"
                name="hsaFsaProvider"
                value={formData.hsaFsaProvider}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={t('hsaFsa.provider.placeholder')}
              />
            </div>

            <div>
              <label
                htmlFor="accountHolderName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t('hsaFsa.accountHolder.label')}
              </label>
              <input
                type="text"
                id="accountHolderName"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={t('hsaFsa.accountHolder.placeholder')}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="estimatedBalance"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('hsaFsa.estimatedBalance.label')}
            </label>
            <input
              type="text"
              id="estimatedBalance"
              name="estimatedBalance"
              value={formData.estimatedBalance}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder={t('hsaFsa.estimatedBalance.placeholder')}
            />
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="interestedInPaymentPlan"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('hsaFsa.paymentPlan.label')}
        </label>
        <div className="flex gap-3">
          {(['yes', 'no'] as const).map((option) => (
            <label
              key={option}
              className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all text-sm font-medium ${
                formData.interestedInPaymentPlan === option
                  ? 'border-teal-600 bg-teal-50 text-teal-700 ring-2 ring-teal-600/20'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="interestedInPaymentPlan"
                value={option}
                checked={formData.interestedInPaymentPlan === option}
                onChange={handleChange}
                className="sr-only"
              />
              {t(`hsaFsa.paymentPlan.options.${option}`)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="additionalNotes"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {t('hsaFsa.additionalNotes.label')}
        </label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder={t('hsaFsa.additionalNotes.placeholder')}
        />
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
              {t('buttons.next', { defaultValue: 'Save & Continue' })}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InsuranceInfoForm;
