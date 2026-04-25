import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import { resetPatientPassword } from '../../services/patientAuthService';

type AuthView = 'login' | 'register' | 'forgot-password';

const PortalAuth: React.FC = () => {
  const { login, register, loading, error } = usePatient();
  const { t } = useTranslation('patientForms');
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setLocalError('');
    setSuccessMsg('');
  };

  const switchView = (v: AuthView) => {
    resetForm();
    setView(v);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError(t('auth.fillAllFields'));
      return;
    }

    await login(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!firstName || !lastName || !email || !password) {
      setLocalError(t('auth.fillAllRequired'));
      return;
    }

    if (password.length < 8) {
      setLocalError(t('auth.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }

    const success = await register(email, password, firstName, lastName);
    if (success) {
      setSuccessMsg(t('auth.accountCreated'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!email) {
      setLocalError(t('auth.enterEmail'));
      return;
    }

    const { error: resetError } = await resetPatientPassword(email);
    if (resetError) {
      setLocalError(resetError);
    } else {
      setSuccessMsg(t('auth.resetSuccess'));
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToWebsite')}
          </Link>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-serif text-gray-900">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {view === 'login' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('auth.welcomeBack')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('auth.signInDescription')}</p>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {displayError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                      placeholder="Your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchView('forgot-password')}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {t('auth.noAccount')}{' '}
                <button onClick={() => switchView('register')} className="text-teal-600 hover:text-teal-700 font-medium">
                  {t('auth.createAccount')}
                </button>
              </p>
            </>
          )}

          {view === 'register' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('auth.createYourAccount')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('auth.registerDescription')}</p>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {displayError}
                </div>
              )}

              {successMsg && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-first" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.firstName')}</label>
                    <input
                      id="reg-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="First"
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-last" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.lastName')}</label>
                    <input
                      id="reg-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Last"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                      placeholder={t('auth.minCharsPlaceholder')}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder={t('auth.reenterPassword')}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? t('auth.creatingAccount') : t('auth.signUp')}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {t('auth.haveAccount')}{' '}
                <button onClick={() => switchView('login')} className="text-teal-600 hover:text-teal-700 font-medium">
                  {t('auth.signInHere')}
                </button>
              </p>
            </>
          )}

          {view === 'forgot-password' && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('auth.resetTitle')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('auth.resetDescription')}</p>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {displayError}
                </div>
              )}

              {successMsg && (
                <div className="bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-3 rounded-lg mb-4">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t('auth.sendResetLink')}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <button onClick={() => switchView('login')} className="text-teal-600 hover:text-teal-700 font-medium">
                  {t('auth.backToSignIn')}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t('auth.hipaaNotice')}
        </p>
      </div>
    </div>
  );
};

export default PortalAuth;
