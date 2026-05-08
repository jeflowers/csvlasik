import { supabase } from '../lib/supabase';

export type ActivityType =
  | 'login'
  | 'logout'
  | 'form_submit'
  | 'form_update'
  | 'testimonial_submit'
  | 'password_reset'
  | 'account_created'
  | 'admin_updated_profile'
  | 'admin_updated_form'
  | 'admin_deactivated'
  | 'admin_reactivated';

export interface ActivityLogEntry {
  id: number;
  activity_type: ActivityType;
  activity_label: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function logPatientActivity(
  activityType: ActivityType,
  activityLabel: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('patient_activity_log').insert([{
      user_id: user.id,
      activity_type: activityType,
      activity_label: activityLabel,
      metadata: {
        ...metadata,
        user_agent: navigator?.userAgent,
      },
    }]);
  } catch {
    // Activity logging is non-critical; don't break the app
  }
}

export async function getPatientActivityLog(limit = 50): Promise<{
  data: ActivityLogEntry[];
  error: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('patient_activity_log')
      .select('id, activity_type, activity_label, metadata, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { data: [], error: error.message };
    return { data: (data || []) as ActivityLogEntry[], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
