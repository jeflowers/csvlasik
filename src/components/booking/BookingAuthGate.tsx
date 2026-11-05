import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Lock } from 'lucide-react';

interface BookingAuthGateProps {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  error: string | null;
}

export const BookingAuthGate: React.FC<BookingAuthGateProps> = ({ login, register, error }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8" data-testid="booking-auth-gate">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to book</h2>
        <p className="text-gray-600 leading-relaxed">
          To protect your privacy, appointments can only be booked and viewed from your patient account.
        </p>
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
            {m === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
            <input
              className={inputClass}
              placeholder="Last name"
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
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          className={inputClass}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-60 transition"
        >
          {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign in and continue' : 'Create account and continue'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Forgot your password?{' '}
        <Link to="/portal/login" className="text-teal-600 hover:text-teal-700 font-medium">
          Visit the patient portal
        </Link>
      </p>
    </div>
  );
};
