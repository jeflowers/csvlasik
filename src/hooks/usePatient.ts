import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  PatientUser,
  signInPatient,
  signUpPatient,
  signOutPatient,
  getCurrentPatient,
} from '../services/patientAuthService';

export interface UsePatientReturn {
  user: PatientUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function usePatient(): UsePatientReturn {
  const [user, setUser] = useState<PatientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { user: current, error: authError } = await getCurrentPatient();
        if (mounted) {
          if (authError) {
            setError(authError);
          } else {
            setUser(current);
          }
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setError(null);
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          firstName: (session.user.user_metadata?.first_name as string) || undefined,
          lastName: (session.user.user_metadata?.last_name as string) || undefined,
          createdAt: session.user.created_at,
        });
        setError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { user: loggedIn, error: loginError } = await signInPatient(email, password);

    if (loginError) {
      setError(loginError);
      setLoading(false);
      return false;
    }

    setUser(loggedIn);
    setLoading(false);
    return true;
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { user: registered, error: regError } = await signUpPatient(email, password, firstName, lastName);

    if (regError) {
      setError(regError);
      setLoading(false);
      return false;
    }

    setUser(registered);
    setLoading(false);
    return true;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { error: logoutError } = await signOutPatient();
    if (logoutError) {
      setError(logoutError);
    }
    setUser(null);
    setLoading(false);
  }, []);

  return { user, loading, error, login, register, logout };
}
