import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { LogIn, UserPlus, Lock, MailCheck } from 'lucide-react';

interface BookingAuthGateProps {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  error: string | null;
  pendingConfirmationEmail?: string | null;
  resendConfirmation?: () => Promise<boolean>;
  clearPendingConfirmation?: () => void;
}

export const BookingAuthGate: React.FC<BookingAuthGateProps> = ({
  login,
  register,
  error,
  pendingConfirmationEmail,
  resendConfirmation,
  clearPendingConfirmation,
}) => {
  const { t } = useTranslation('patientForms');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const handleResend = async () => {
    if (!resendConfirmation) return;
    setResendState('sending');
    const ok = await resendConfirmation();
    setResendState(ok ? 'sent' : 'failed');
  };

  const handleBackToSignIn = () => {
    clearPendingConfirmation?.();
    setResendState('idle');
    setPassword('');
    setMode('signin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === 'signin') {
      await login(email.trim(), password);
    } else {
      await register(email.trim(), password, firstName.trim(), lastName.trim());
    }
    setSubmitting(false);
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition';

  const displayError =
    error && error.startsWith('Please confirm your email address first') ? t('bookingGate.emailNotConfirmed') : error;

  if (pendingConfirmationEmail) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8" data-testid="booking-auth-gate">
        <div className="flex flex-col items-center text-center" data-testid="booking-confirm-email">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
            <MailCheck className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('bookingGate.checkInboxTitle')}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            <Trans
              t={t}
              i18nKey="bookingGate.checkInboxBody"
              values={{ email: pendingConfirmationEmail }}
              components={{ strong: <span className="font-medium text-gray-900" /> }}
            />
          </p>

          {resendState === 'sent' && (
            <p className="w-full text-sm text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 mb-4" role="status">
              {t('bookingGate.resent')}
            </p>
          )}
          {(resendState === 'failed' || (displayError && resendState !== 'sent')) && (
            <p className="w-full text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4" role="alert">
              {displayError || t('bookingGate.resendFailed')}
            </p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === 'sending' || !resendConfirmation}
            data-testid="resend-confirmation"
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-60 transition mb-3"
          >
            {resendState === 'sending' ? t('bookingGate.sending') : t('bookingGate.resend')}
          </button>
          <button
            type="button"
            onClick={handleBackToSignIn}
            className="w-full py-3 rounded-lg font-medium text-teal-700 hover:bg-teal-50 transition"
          >
            {t('bookingGate.backToSignIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8" data-testid="booking-auth-gate">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('bookingGate.title')}</h2>
        <p className="text-gray-600 leading-relaxed">{t('bookingGate.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg mb-6">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`py-2 rounded-md text-sm font-medium transition ${
              mode === m ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {m === 'signin' ? t('bookingGate.tabSignIn') : t('bookingGate.tabCreateAccount')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              placeholder={t('bookingGate.firstName')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
            <input
              className={inputClass}
              placeholder={t('bookingGate.lastName')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
        )}
        <input
          type="email"
          className={inputClass}
          placeholder={t('bookingGate.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          className={inputClass}
          placeholder={t('bookingGate.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />

        {displayError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2" role="alert">
            {displayError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-60 transition"
        >
          {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {submitting
            ? t('bookingGate.pleaseWait')
            : mode === 'signin'
              ? t('bookingGate.signInContinue')
              : t('bookingGate.createContinue')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('bookingGate.forgotPassword')}{' '}
        <Link to="/portal/login" className="text-teal-600 hover:text-teal-700 font-medium">
          {t('bookingGate.visitPortal')}
        </Link>
      </p>
    </div>
  );
};
