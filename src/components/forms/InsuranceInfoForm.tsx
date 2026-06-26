import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import type { InsuranceInfoData } from '../../types/PatientForms';

interface Props {
  data: InsuranceInfoData;
  onChange: (data: InsuranceInfoData) => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const InsuranceInfoForm: React.FC<Props> = ({ data, onChange, onPrevious, onNext }) => {
  const { t } = useTranslation('patientForms');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const showAccountFields = data.hasHsaFsa === 'hsa' || data.hasHsaFsa === 'fsa' || data.hasHsaFsa === 'both';

  const isFormValid =
    data.hasHsaFsa !== '' &&
    data.interestedInPaymentPlan !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onNext?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                data.hasHsaFsa === option
                  ? 'border-champagne bg-cream text-onyx ring-2 ring-champagne/20'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="hasHsaFsa"
                value={option}
                checked={data.hasHsaFsa === option}
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
                value={data.hsaFsaProvider}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne focus:border-transparent"
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
                value={data.accountHolderName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne focus:border-transparent"
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
              value={data.estimatedBalance}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne focus:border-transparent"
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
                data.interestedInPaymentPlan === option
                  ? 'border-champagne bg-cream text-onyx ring-2 ring-champagne/20'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="interestedInPaymentPlan"
                value={option}
                checked={data.interestedInPaymentPlan === option}
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
          value={data.additionalNotes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne focus:border-transparent"
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
          disabled={!isFormValid}
          className="inline-flex items-center gap-2 bg-onyx text-white px-8 py-3 rounded-lg font-semibold hover:bg-graphite transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
        >
          {t('buttons.next', { defaultValue: 'Save & Continue' })}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default InsuranceInfoForm;
