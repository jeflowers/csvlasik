import { supabase } from '../lib/supabase';
import { logPatientActivity } from './patientActivityService';

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
  needsConfirmation?: boolean;
}

function confirmationRedirectUrl(): string {
  return `${window.location.origin}/portal`;
}

async function ensurePatientProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const { data: existing } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('id', authUser.id)
    .maybeSingle();

  if (existing) return;

  const { error: profileError } = await supabase
    .from('patient_profiles')
    .insert({
      id: authUser.id,
      email: authUser.email || '',
      first_name: (authUser.user_metadata?.first_name as string) || '',
      last_name: (authUser.user_metadata?.last_name as string) || '',
    });

  if (profileError && !profileError.message.includes('duplicate')) {
    console.error('[patientAuthService] Failed to create patient profile:', profileError);
    return;
  }

  await logPatientActivity('account_created', 'Portal account created', {
    email: authUser.email,
  });
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
        emailRedirectTo: confirmationRedirectUrl(),
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

    if (!data.session) {
      return { user: null, error: null, needsConfirmation: true };
    }

    await ensurePatientProfile(data.user);

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
      if (error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message)) {
        return {
          user: null,
          error: 'Please confirm your email address first. Check your inbox for the confirmation link.',
          needsConfirmation: true,
        };
      }
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Sign in failed' };
    }

    await ensurePatientProfile(data.user);

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

export async function resendPatientConfirmation(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });
    return { error: error?.message || null };
  } catch (err) {
    return {
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
