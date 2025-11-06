export type RingCentralConnectionStatus = 'connected' | 'disconnected' | 'expired' | 'error';

export type RingCentralMessageType = 'sms' | 'mms';

export type RingCentralMessageStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export type RingCentralEventStatus = 'scheduled' | 'cancelled' | 'completed';

export interface RingCentralConnection {
  id: string;
  practice_id: string;
  rc_account_id: string;
  rc_access_token: string;
  rc_refresh_token: string;
  rc_token_expires_at: string;
  default_call_queue: string | null;
  default_team: string | null;
  default_number: string | null;
  default_sms_from: string | null;
  default_provider_location: string | null;
  status: RingCentralConnectionStatus;
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface RingCentralEvent {
  id: string;
  consultation_request_id: string;
  rc_event_id: string;
  rc_event_type: string;
  rc_calendar_id: string | null;
  event_start_time: string | null;
  event_end_time: string | null;
  event_details: Record<string, unknown>;
  status: RingCentralEventStatus;
  created_at: string;
  updated_at: string;
}

export interface RingCentralMessage {
  id: string;
  consultation_request_id: string;
  rc_message_id: string;
  message_type: RingCentralMessageType;
  from_number: string;
  to_number: string;
  message_body: string;
  status: RingCentralMessageStatus;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RingCentralOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  server: string;
}

export interface RingCentralTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  owner_id: string;
  endpoint_id: string;
}

export interface RingCentralCallQueue {
  id: string;
  name: string;
  extensionNumber: string;
}

export interface RingCentralTeam {
  id: string;
  name: string;
  description?: string;
}

export interface RingCentralPhoneNumber {
  id: string;
  phoneNumber: string;
  type: 'VoiceFax' | 'VoiceOnly' | 'FaxOnly';
  usageType: 'MainCompanyNumber' | 'DirectNumber' | 'CompanyNumber';
}

export interface RingCentralCalendarEvent {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  attendees?: Array<{
    name: string;
    email: string;
  }>;
}

export interface RingCentralSMSRequest {
  from: { phoneNumber: string };
  to: Array<{ phoneNumber: string }>;
  text: string;
}

export interface RingCentralCallRequest {
  from: { phoneNumber: string };
  to: { phoneNumber: string };
}

export interface RingCentralWebhookEvent {
  uuid: string;
  event: string;
  timestamp: string;
  subscriptionId: string;
  body: Record<string, unknown>;
}
