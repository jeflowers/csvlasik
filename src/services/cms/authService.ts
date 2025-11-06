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
      .select('id,email,name,role,created_at,updated_at')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError || !userData) {
      await supabase.auth.signOut();
      return { user: null, error: 'User not found in database' };
    }

    // Verify user has a valid role from the roles table
    const { data: roleData } = await supabase
      .from('roles')
      .select('name')
      .eq('name', userData.role)
      .maybeSingle();

    if (!roleData) {
      await supabase.auth.signOut();
      return { user: null, error: 'Invalid role assigned to user' };
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
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      userCache = null;
      callback(null);
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.user) {
        const { user } = await getCurrentAdmin();
        callback(user);
      } else {
        userCache = null;
        callback(null);
      }
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
