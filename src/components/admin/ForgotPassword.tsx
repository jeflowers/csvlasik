import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Logo from '../Logo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-onyx flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex flex-col items-center mb-8">
          <Logo variant="stacked" mode="dark" height={44} />
        </div>

        <div className="bg-graphite border border-white/10 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-full mb-4">
              <Mail className="h-5 w-5 text-champagne" />
            </div>
            <h2 className="text-xl font-serif text-white">Forgot Password?</h2>
            <p className="text-white/50 mt-2 text-sm">
              Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {success ? (
            <div className="bg-green-900/20 border border-green-500/30 rounded-md p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-300 mb-1">Email Sent!</h3>
                  <p className="text-sm text-green-400/70">
                    Check your email for a password reset link.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-bullion focus:border-bullion sm:text-sm"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-medium rounded-md bg-onyx text-white border border-white/20 hover:bg-champagne hover:text-onyx hover:border-champagne focus:outline-none focus:ring-2 focus:ring-bullion disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="inline-flex items-center text-sm text-champagne hover:text-bullion font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
