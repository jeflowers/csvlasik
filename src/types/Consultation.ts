export type SchedulingMethod = 'built-in' | 'ringcentral' | 'nextech' | 'hybrid';

export type RoutingMode = 'notify_all' | 'round_robin';

export type FailoverBehavior = 'auto_builtin' | 'hold_alert';

export type PreferredContact = 'phone' | 'email' | 'sms';

export type ConsultationStatus = 'unassigned' | 'assigned' | 'scheduled' | 'closed';

export type ScheduledVia = 'built-in' | 'ringcentral' | 'nextech';

export type NextechSyncStatus = 'not_synced' | 'synced' | 'error';

export type AuditAction =
  | 'created'
  | 'assigned'
  | 'contacted'
  | 'scheduled_builtin'
  | 'scheduled_rc'
  | 'scheduled_nextech'
  | 'closed'
  | 'failover'
  | 'status_changed'
  | 'note_added';

export interface ConsultationSettings {
  id: string;
  practice_id: string;
  scheduling_method: SchedulingMethod;
  recipient_user_ids: string[];
  notification_email: boolean;
  notification_sms: boolean;
  routing_mode: RoutingMode;
  fallback_user_id: string | null;
  failover_behavior: FailoverBehavior;
  last_assigned_index: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultationRequest {
  id: string;
  practice_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  procedure: string;
  preferred_contact: PreferredContact;
  preferred_language?: string;
  comments: string | null;
  status: ConsultationStatus;
  assigned_to_user_id: string | null;
  scheduled_via: ScheduledVia | null;
  ringcentral_event_id: string | null;
  ringcentral_message_id: string | null;
  nextech_patient_id: string | null;
  nextech_appointment_id: string | null;
  nextech_sync_status: NextechSyncStatus;
  submission_ip: string | null;
  duplicate_suppressed: boolean;
  duplicate_of_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultationAuditLog {
  id: string;
  consultation_request_id: string;
  user_id: string | null;
  action: AuditAction;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ConsultationRequestWithUser extends ConsultationRequest {
  assigned_user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface ConsultationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  procedure: string;
  preferred_contact: PreferredContact;
  comments?: string;
}

export interface ConsultationFilters {
  status?: ConsultationStatus | 'all' | 'mine';
  search?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
}

export interface ConsultationStats {
  total: number;
  unassigned: number;
  assigned: number;
  scheduled: number;
  closed: number;
  avg_time_to_schedule: number;
  scheduled_via_builtin: number;
  scheduled_via_ringcentral: number;
  scheduled_via_nextech: number;
}
