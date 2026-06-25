import React, { useState } from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import Logo from '../Logo';

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

    try {
      const success = await login({
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        navigate('/admin');
      } else {
        setError(authError || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
    <div className="min-h-screen flex items-center justify-center bg-onyx py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8">
        <div className="flex flex-col items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-champagne hover:text-bullion mb-8 self-start"
          >
            <Home className="h-4 w-4 mr-1" />
            Back to Website
          </Link>
          <Logo variant="stacked" mode="dark" height={48} />
          <h2 className="mt-8 text-center text-2xl font-serif text-white">
            Content Management
          </h2>
          <p className="mt-2 text-center text-sm text-white/50">
            Sign in to manage your content
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70">
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
                className="mt-1 block w-full px-3 py-2.5 bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-bullion focus:border-bullion sm:text-sm"
                placeholder="admin@atelierlasik.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70">
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
                className="mt-1 block w-full px-3 py-2.5 bg-white/5 border border-white/20 text-white placeholder-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-bullion focus:border-bullion sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-md bg-onyx text-white border border-white/20 hover:bg-champagne hover:text-onyx hover:border-champagne focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bullion disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="flex items-center justify-center">
            <Link
              to="/admin/forgot-password"
              className="text-sm font-medium text-champagne hover:text-bullion transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <p className="text-center text-xs text-white/30">
            Need access? Contact your administrator.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
