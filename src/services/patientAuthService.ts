import { supabase } from '../lib/supabase';

export interface PatientUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface PatientAuthResponse {
  user: PatientUser | null;
  error: string | null;
}

function mapAuthUser(authUser: { id: string; email?: string; created_at: string; user_metadata?: Record<string, unknown> }): PatientUser {
  return {
    id: authUser.id,
    email: authUser.email || '',
    firstName: (authUser.user_metadata?.first_name as string) || undefined,
    lastName: (authUser.user_metadata?.last_name as string) || undefined,
    createdAt: authUser.created_at,
  };
}

export async function signUpPatient(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<PatientAuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          account_type: 'patient',
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Registration failed' };
    }

    const { error: profileError } = await supabase
      .from('patient_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email || email,
        first_name: firstName,
        last_name: lastName,
      });

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('[patientAuthService] Failed to create patient profile:', profileError);
    }

    return { user: mapAuthUser(data.user), error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function signInPatient(
  email: string,
  password: string
): Promise<PatientAuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Sign in failed' };
    }

    return { user: mapAuthUser(data.user), error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function signOutPatient(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function getCurrentPatient(): Promise<PatientAuthResponse> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { user: null, error: null };
    }

    return { user: mapAuthUser(session.user), error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function resetPatientPassword(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/portal/reset-password`,
    });
    return { error: error?.message || null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updatePatientPassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message || null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
