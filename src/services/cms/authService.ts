/**
 * @file authService.ts
 * @description Supabase authentication service for CMS admin panel
 * @author Development
 * @filepath csvlasik/src/services/cms/authService.ts
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
  role: 'admin' | 'editor' | 'viewer';
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
export async function signInAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Authentication failed' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      await supabase.auth.signOut();
      return { user: null, error: 'User not found in database' };
    }

    if (!['admin', 'editor', 'viewer'].includes(userData.role)) {
      await supabase.auth.signOut();
      return { user: null, error: 'Insufficient permissions' };
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
 * Sign out current admin user
 */
export async function signOutAdmin(): Promise<{ error: string | null }> {
  try {
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
    console.log('[authService] Getting current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[authService] Session result:', { session: !!session, error: sessionError });

    if (sessionError || !session) {
      console.log('[authService] No active session');
      return { user: null, error: null };
    }

    console.log('[authService] Fetching user data for:', session.user.id);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    console.log('[authService] User data result:', { userData, userError });

    if (userError) {
      console.error('[authService] User fetch error:', userError);
      return { user: null, error: userError.message };
    }

    if (!userData) {
      console.log('[authService] User not found in database');
      return { user: null, error: null };
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
    console.error('[authService] Exception:', error);
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
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { user } = await getCurrentAdmin();
      callback(user);
    } else {
      callback(null);
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
  role: 'admin' | 'editor' | 'viewer'
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
