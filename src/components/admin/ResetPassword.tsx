import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Logo from '../Logo';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkResetToken();
  }, []);

  const checkResetToken = async () => {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (error) {
          setError('Invalid or expired reset link. Please request a new one.');
          setTokenValid(false);
        } else if (data.session) {
          setTokenValid(true);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
          setTokenValid(false);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setTokenValid(true);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
          setTokenValid(false);
        }
      }
    } catch (err) {
      setError('Failed to validate reset link.');
      setTokenValid(false);
    } finally {
      setValidatingToken(false);
    }
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(pwd)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&#])/.test(pwd)) return 'Password must contain at least one special character (@$!%*?&#)';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): { strength: string; color: string; width: string } => {
    if (pwd.length === 0) return { strength: '', color: '', width: '0%' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&#]/.test(pwd)) score++;

    if (score <= 2) return { strength: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 4) return { strength: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-champagne"></div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex flex-col items-center mb-8">
            <Logo variant="stacked" mode="dark" height={44} />
          </div>
          <div className="bg-graphite border border-white/10 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-900/20 border border-red-500/30 rounded-full mb-4">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-xl font-serif text-white mb-2">Invalid Reset Link</h2>
            <p className="text-white/50 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/admin/forgot-password')}
              className="w-full py-2.5 px-4 text-sm font-medium rounded-md bg-onyx text-white border border-white/20 hover:bg-champagne hover:text-onyx hover:border-champagne transition-colors"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex flex-col items-center mb-8">
          <Logo variant="stacked" mode="dark" height={44} />
        </div>

        <div className="bg-graphite border border-white/10 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-full mb-4">
              <Lock className="h-5 w-5 text-champagne" />
            </div>
            <h2 className="text-xl font-serif text-white">Reset Password</h2>
            <p className="text-white/50 mt-2 text-sm">
              Choose a strong password for your account
            </p>
          </div>

          {success ? (
            <div className="bg-green-900/20 border border-green-500/30 rounded-md p-6 text-center">
              <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-4" />
              <h3 className="text-base font-medium text-green-300 mb-2">Password Reset Successfully!</h3>
              <p className="text-sm text-green-400/70 mb-4">Redirecting to login...</p>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mx-auto"></div>
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
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2.5 pr-10 bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-bullion focus:border-bullion sm:text-sm"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/40 hover:text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/40 hover:text-white/60" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                      <span>Strength:</span>
                      <span className="font-medium">{passwordStrength.strength}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-3 py-2.5 pr-10 bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-bullion focus:border-bullion sm:text-sm"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-white/40 hover:text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/40 hover:text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-md p-3">
                <h4 className="text-xs font-medium text-white/60 mb-2">Requirements:</h4>
                <ul className="text-xs text-white/40 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${password.length >= 8 ? 'text-green-400' : 'text-white/20'}`} />
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-white/20'}`} />
                    One lowercase letter
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-white/20'}`} />
                    One uppercase letter
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${/\d/.test(password) ? 'text-green-400' : 'text-white/20'}`} />
                    One number
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${/[@$!%*?&#]/.test(password) ? 'text-green-400' : 'text-white/20'}`} />
                    One special character
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-medium rounded-md bg-onyx text-white border border-white/20 hover:bg-champagne hover:text-onyx hover:border-champagne focus:outline-none focus:ring-2 focus:ring-bullion disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
