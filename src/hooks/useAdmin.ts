/**
 * @file useAdmin.ts
 * @description React hook for admin authentication state management
 * @author Development
 * @filepath csvlasik/src/hooks/useAdmin.ts
 * @category Hook
 * @pattern Observer
 * @version 1.0.0
 * @last_updated 2025-10-10
 *
 * @dependencies
 * - react: ^18.3.1
 * - @supabase/supabase-js: ^2.58.0
 *
 * @security
 * - Uses Supabase Auth session management
 * - Auto-refresh tokens
 * - Secure session persistence
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AdminUser,
  LoginCredentials,
  signInAdmin,
  signOutAdmin,
  getCurrentAdmin,
  onAuthStateChange,
  hasRole,
} from '../services/cms/authService';

export interface UseAdminReturn {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: string[]) => boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
}

/**
 * Hook for managing admin authentication state
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { user, loading, login, logout, isAdmin } = useAdmin();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <LoginForm onSubmit={login} />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome {user.name}</h1>
 *       {isAdmin && <AdminControls />}
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdmin(): UseAdminReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function initAuth() {
      console.log('[useAdmin] Initializing auth...');

      timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.error('[useAdmin] Auth initialization timeout');
          setError('Authentication timeout. Please refresh the page.');
          setLoading(false);
        }
      }, 10000);

      try {
        const { user: currentUser, error: authError } = await getCurrentAdmin();
        console.log('[useAdmin] getCurrentAdmin result:', { user: currentUser, error: authError });

        if (mounted) {
          clearTimeout(timeoutId);
          if (authError) {
            console.error('[useAdmin] Auth error:', authError);
            setError(authError);
            setUser(null);
          } else {
            console.log('[useAdmin] Auth success:', currentUser);
            setUser(currentUser);
            setError(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[useAdmin] Auth exception:', err);
        if (mounted) {
          clearTimeout(timeoutId);
          setError(err instanceof Error ? err.message : 'Failed to initialize auth');
          setLoading(false);
        }
      }
    }

    initAuth();

    const unsubscribe = onAuthStateChange((newUser) => {
      console.log('[useAdmin] Auth state changed:', newUser);
      if (mounted) {
        setUser(newUser);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { user: loggedInUser, error: loginError } = await signInAdmin(credentials);

      if (loginError) {
        setError(loginError);
        setLoading(false);
        return false;
      }

      setUser(loggedInUser);
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: logoutError } = await signOutAdmin();

      if (logoutError) {
        setError(logoutError);
      }

      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkRole = useCallback(
    (allowedRoles: string[]): boolean => {
      return hasRole(user, allowedRoles);
    },
    [user]
  );

  return {
    user,
    loading,
    error,
    login,
    logout,
    hasRole: checkRole,
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor' || user?.role === 'admin',
    isViewer: user?.role === 'viewer' || user?.role === 'editor' || user?.role === 'admin',
  };
}
