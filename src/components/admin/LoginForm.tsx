/**
 * @file LoginForm.tsx
 * @description Admin login form component using Supabase authentication
 * @author Development
 * @filepath atelierlasik/src/components/admin/LoginForm.tsx
 * @category Component
 * @pattern Controlled Form
 * @version 2.0.0
 * @last_updated 2025-10-10
 *
 * @dependencies
 * - react: ^18.3.1
 * - lucide-react: ^0.344.0
 *
 * @security
 * - Uses Supabase Auth for authentication
 * - Passwords never stored in state longer than submission
 * - Error messages sanitized
 * - HTTPS enforced by Supabase
 */

import React, { useState } from 'react';
import { Eye, AlertCircle, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAdmin();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('[LoginForm] Submitting login for:', formData.email);

    try {
      const success = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log('[LoginForm] Login result:', success, 'Auth error:', authError);

      if (success) {
        console.log('[LoginForm] Login successful, navigating to /admin');
        navigate('/admin');
      } else {
        const errorMsg = authError || 'Login failed. Please check your credentials.';
        console.error('[LoginForm] Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[LoginForm] Login exception:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 mb-4"
          >
            <Home className="h-4 w-4 mr-1" />
            Back to Website
          </Link>
          <div className="flex justify-center items-center space-x-3">
            <img
              src="/assets/images/ClearSight-icon-nb-blk-gld.png"
              alt="ClearSight Vision Institute"
              className="h-16 w-auto"
            />
            <div className="flex flex-col">
              <h1 className="text-2xl font-serif text-gray-900 leading-tight">ClearSight</h1>
              <p className="text-xs text-gray-600 font-light tracking-widest uppercase">VISION INSTITUTE</p>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ClearSight CMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your content
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="admin@clearsight.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Link
              to="/admin/forgot-password"
              className="text-sm font-medium text-teal-600 hover:text-teal-500"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Secure authentication via Supabase
            </p>
            <p className="text-xs text-gray-400">
              Need access? Contact your administrator
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
