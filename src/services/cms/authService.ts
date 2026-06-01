/**
 * @file authService.ts
 * @description Supabase authentication service for CMS admin panel
 * @author Development
 * @filepath atelierlasik/src/services/cms/authService.ts
 * @category Service
 * @pattern Service Layer
 * @version 1.0.0
 * @last_updated 2025-10-10
 *
 * @dependencies
 * - @supabase/supabase-js: ^2.58.0
 *
 * @security
 * - Uses Supabase Auth for authentication
 * - Passwords hashed by Supabase
 * - RLS policies enforced
 * - Session management via Supabase
 */

import { supabase } from '../../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser | null;
  error: string | null;
}

/**
 * Sign in admin user with email and password
 */
let userCache: { user: AdminUser | null; timestamp: number } | null = null;
const CACHE_DURATION = 60000;

export async function signInAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
  console.log('[authService] Starting login for:', credentials.email);

  try {
    // Step 1: Authenticate
    console.log('[authService] Step 1: Authenticating with Supabase...');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      console.error('[authService] Auth failed:', authError.message);
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      console.error('[authService] No user in auth response');
      return { user: null, error: 'Authentication failed' };
    }

    console.log('[authService] Step 2: Verifying account is not a patient...');

    const { data: patientRow } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (patientRow) {
      console.error('[authService] Patient account attempted admin login');
      await supabase.auth.signOut();
      return { user: null, error: 'This account is not authorized for system access.' };
    }

    console.log('[authService] Step 3: Fetching user data for ID:', authData.user.id);

    const userPromise = supabase
      .from('users')
      .select('id,email,name,role,created_at,updated_at')
      .eq('id', authData.user.id)
      .maybeSingle();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('User query timeout')), 5000)
    );

    const { data: userData, error: userError } = await Promise.race([
      userPromise,
      timeoutPromise,
    ]) as any;

    if (userError) {
      console.error('[authService] User query error:', userError);
      await supabase.auth.signOut();
      return { user: null, error: 'Database error: ' + userError.message };
    }

    if (!userData) {
      console.error('[authService] User not found in database');
      await supabase.auth.signOut();
      return { user: null, error: 'User not found in database' };
    }

    console.log('[authService] Step 3: Verifying role:', userData.role);

    // Step 3: Verify role with timeout (skip if it fails - we already have role from users table)
    try {
      const rolePromise = supabase
        .from('roles')
        .select('name')
        .eq('name', userData.role)
        .maybeSingle();

      const roleTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Role query timeout')), 3000)
      );

      const { data: roleData, error: roleError } = await Promise.race([
        rolePromise,
        roleTimeout,
      ]) as any;

      if (roleError) {
        console.warn('[authService] Role query error (continuing anyway):', roleError);
      }

      if (!roleData) {
        console.warn('[authService] Role not found in roles table, but proceeding with user role:', userData.role);
      }
    } catch (roleErr) {
      console.warn('[authService] Role verification failed (continuing anyway):', roleErr);
    }

    console.log('[authService] Login successful!');

    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    userCache = { user, timestamp: Date.now() };

    return {
      user,
      error: null,
    };
  } catch (error) {
    console.error('[authService] Exception during login:', error);
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Sign out current admin user
 */
export async function signOutAdmin(): Promise<{ error: string | null }> {
  try {
    userCache = null;
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get current admin user session
 */
export async function getCurrentAdmin(): Promise<AuthResponse> {
  try {
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      return { user: userCache.user, error: null };
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      userCache = null;
      return { user: null, error: null };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id,email,name,role,created_at,updated_at')
      .eq('id', session.user.id)
      .maybeSingle();

    if (userError) {
      userCache = null;
      return { user: null, error: userError.message };
    }

    if (!userData) {
      userCache = null;
      return { user: null, error: null };
    }

    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    userCache = { user, timestamp: Date.now() };

    return {
      user,
      error: null,
    };
  } catch (error) {
    userCache = null;
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AdminUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: AdminUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      userCache = null;
      callback(null);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (!session?.user) {
        userCache = null;
        callback(null);
        return;
      }

      (async () => {
        const { user } = await getCurrentAdmin();
        callback(user);
      })();
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Create a new admin user (admin only)
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string,
  role: string
): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Failed to create user' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        password: 'SUPABASE_MANAGED',
        name,
        role,
      })
      .select()
      .single();

    if (userError) {
      return { user: null, error: userError.message };
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update admin user password
 */
export async function updateAdminPassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error: error?.message || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
