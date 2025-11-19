export interface NextechConnection {
  id: string;
  practice_id: string;
  environment: 'sandbox' | 'production';
  api_key: string;
  practice_api_id: string;
  location_id?: string;
  default_provider_id?: string;
  connection_status: 'connected' | 'disconnected' | 'error';
  last_sync_at?: string;
  error_message?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NextechPatient {
  id: string;
  consultation_request_id: string;
  nextech_patient_id: string;
  nextech_practice_id: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_synced_at?: string;
  patient_data?: NextechPatientData;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface NextechPatientData {
  patient_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  home_phone?: string;
  mobile_phone?: string;
  work_phone?: string;
  address?: NextechAddress;
  emergency_contact?: NextechEmergencyContact;
  insurance?: NextechInsurance[];
  preferred_language?: string;
  ethnicity?: string;
  race?: string;
  ssn?: string;
}

export interface NextechAddress {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface NextechEmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface NextechInsurance {
  insurance_id?: string;
  plan_name?: string;
  member_id?: string;
  group_number?: string;
  is_primary?: boolean;
}

export interface NextechAppointment {
  id: string;
  consultation_request_id: string;
  nextech_patient_id: string;
  nextech_appointment_id: string;
  nextech_practice_id: string;
  appointment_status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  appointment_date: string;
  appointment_type?: string;
  provider_id?: string;
  location_id?: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_synced_at?: string;
  appointment_data?: NextechAppointmentData;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface NextechAppointmentData {
  appointment_id: string;
  patient_id: string;
  provider_id: string;
  location_id: string;
  appointment_type_id: string;
  appointment_type_name?: string;
  start_date_time: string;
  end_date_time: string;
  duration_minutes?: number;
  status: string;
  status_reason?: string;
  chief_complaint?: string;
  notes?: string;
  confirmation_status?: string;
  reminder_sent?: boolean;
  resource_ids?: string[];
}

export interface NextechProvider {
  provider_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  credentials?: string;
  specialty?: string;
  npi_number?: string;
  is_active: boolean;
  email?: string;
  phone?: string;
}

export interface NextechLocation {
  location_id: string;
  location_name: string;
  address?: NextechAddress;
  phone?: string;
  fax?: string;
  email?: string;
  is_active: boolean;
}

export interface NextechAppointmentType {
  appointment_type_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  color?: string;
  is_active: boolean;
}

export interface NextechSyncLog {
  id: string;
  practice_id: string;
  sync_type: 'patient_create' | 'patient_update' | 'appointment_create' | 'appointment_update' | 'appointment_cancel' | 'status_sync';
  entity_type: 'patient' | 'appointment';
  entity_id?: string;
  nextech_entity_id?: string;
  operation_status: 'success' | 'failed' | 'retrying';
  request_payload?: Record<string, any>;
  response_payload?: Record<string, any>;
  error_details?: Record<string, any>;
  retry_count: number;
  created_at: string;
}

export interface NextechApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: NextechApiError;
  metadata?: {
    total_count?: number;
    page?: number;
    page_size?: number;
  };
}

export interface NextechApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
}

export interface NextechPatientSearchParams {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  patient_id?: string;
}

export interface NextechAppointmentSearchParams {
  patient_id?: string;
  provider_id?: string;
  location_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface NextechPatientCreateRequest {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  home_phone?: string;
  mobile_phone?: string;
  work_phone?: string;
  address?: NextechAddress;
  emergency_contact?: NextechEmergencyContact;
  preferred_language?: string;
  ethnicity?: string;
  race?: string;
}

export interface NextechAppointmentCreateRequest {
  patient_id: string;
  provider_id: string;
  location_id: string;
  appointment_type_id: string;
  start_date_time: string;
  duration_minutes?: number;
  chief_complaint?: string;
  notes?: string;
  send_confirmation?: boolean;
  send_reminder?: boolean;
}

export interface NextechAppointmentUpdateRequest {
  appointment_id: string;
  status?: string;
  status_reason?: string;
  start_date_time?: string;
  duration_minutes?: number;
  provider_id?: string;
  location_id?: string;
  notes?: string;
}

export interface NextechCommunicationRequest {
  patient_id: string;
  communication_type: 'email' | 'sms' | 'voice';
  recipient?: string;
  subject?: string;
  message: string;
  template_id?: string;
  variables?: Record<string, string>;
}

export interface NextechAvailabilityRequest {
  provider_id: string;
  location_id: string;
  appointment_type_id: string;
  start_date: string;
  end_date: string;
  duration_minutes?: number;
}

export interface NextechAvailabilitySlot {
  start_date_time: string;
  end_date_time: string;
  available: boolean;
  provider_id: string;
  location_id: string;
}

export interface StaffCapabilities {
  id: string;
  user_id: string;
  languages: string[];
  procedures: string[];
  time_zones: string[];
  max_active_consultations: number;
  is_active: boolean;
  specialties?: Record<string, any>;
  vip_handling: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRules {
  id: string;
  practice_id: string;
  rule_name: string;
  priority_order: number;
  language_weight: number;
  procedure_weight: number;
  workload_weight: number;
  timezone_weight: number;
  enabled: boolean;
  vip_rules?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssignmentHistory {
  id: string;
  consultation_request_id: string;
  assigned_to_user_id?: string;
  assigned_by_user_id?: string;
  assignment_method: 'automatic' | 'manual' | 'reassignment';
  assignment_rationale?: Record<string, any>;
  score_details?: AssignmentScoreDetails;
  created_at: string;
}

export interface AssignmentScoreDetails {
  all_scores: AssignmentScore[];
}

export interface AssignmentScore {
  total_score: number;
  language_score: number;
  procedure_score: number;
  workload_score: number;
  timezone_score: number;
  current_workload: number;
  max_workload: number;
  eligible: boolean;
  staff_user_id: string;
  reason?: string;
}
