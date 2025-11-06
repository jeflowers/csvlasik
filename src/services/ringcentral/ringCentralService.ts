import type {
  RingCentralConnection,
  RingCentralCallQueue,
  RingCentralTeam,
  RingCentralPhoneNumber,
  RingCentralCalendarEvent,
  RingCentralSMSRequest,
  RingCentralCallRequest,
} from '../../types/RingCentral';
import { ringCentralAuth } from './ringCentralAuth';
import { supabase } from '../../lib/supabase';

const RC_API_BASE_URL = 'https://platform.ringcentral.com/restapi/v1.0';

export class RingCentralService {
  private async getValidAccessToken(connection: RingCentralConnection): Promise<string> {
    if (ringCentralAuth.isTokenExpired(connection)) {
      const refreshedConnection = await ringCentralAuth.refreshConnectionToken(connection);
      return ringCentralAuth['decryptToken'](refreshedConnection.rc_access_token);
    }
    return ringCentralAuth['decryptToken'](connection.rc_access_token);
  }

  private async makeApiRequest<T>(
    connection: RingCentralConnection,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = await this.getValidAccessToken(connection);

    const response = await fetch(`${RC_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`RingCentral API error: ${error}`);
    }

    return response.json();
  }

  async getCallQueues(connection: RingCentralConnection): Promise<RingCentralCallQueue[]> {
    const data = await this.makeApiRequest<{ records: RingCentralCallQueue[] }>(
      connection,
      '/account/~/call-queues'
    );
    return data.records || [];
  }

  async getTeams(connection: RingCentralConnection): Promise<RingCentralTeam[]> {
    const data = await this.makeApiRequest<{ records: RingCentralTeam[] }>(
      connection,
      '/account/~/extension/~/address-book-sync'
    );
    return data.records || [];
  }

  async getPhoneNumbers(connection: RingCentralConnection): Promise<RingCentralPhoneNumber[]> {
    const data = await this.makeApiRequest<{ records: RingCentralPhoneNumber[] }>(
      connection,
      '/account/~/phone-number'
    );
    return data.records || [];
  }

  async createCalendarEvent(
    connection: RingCentralConnection,
    event: {
      subject: string;
      startTime: string;
      endTime: string;
      location?: string;
      description?: string;
    }
  ): Promise<RingCentralCalendarEvent> {
    return this.makeApiRequest<RingCentralCalendarEvent>(
      connection,
      '/account/~/extension/~/calendar-event',
      {
        method: 'POST',
        body: JSON.stringify(event),
      }
    );
  }

  async sendSMS(
    connection: RingCentralConnection,
    smsRequest: RingCentralSMSRequest
  ): Promise<{ id: string; messageStatus: string }> {
    const result = await this.makeApiRequest<{ id: string; messageStatus: string }>(
      connection,
      '/account/~/extension/~/sms',
      {
        method: 'POST',
        body: JSON.stringify(smsRequest),
      }
    );

    return result;
  }

  async saveEvent(
    consultationRequestId: string,
    rcEventId: string,
    eventDetails: Partial<RingCentralCalendarEvent>
  ): Promise<void> {
    const { error } = await supabase.from('ringcentral_events').insert({
      consultation_request_id: consultationRequestId,
      rc_event_id: rcEventId,
      rc_event_type: 'calendar',
      event_start_time: eventDetails.startTime,
      event_end_time: eventDetails.endTime,
      event_details: eventDetails,
      status: 'scheduled',
    });

    if (error) throw error;
  }

  async saveMessage(
    consultationRequestId: string,
    rcMessageId: string,
    fromNumber: string,
    toNumber: string,
    messageBody: string
  ): Promise<void> {
    const { error } = await supabase.from('ringcentral_messages').insert({
      consultation_request_id: consultationRequestId,
      rc_message_id: rcMessageId,
      message_type: 'sms',
      from_number: fromNumber,
      to_number: toNumber,
      message_body: messageBody,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  getBookingDeepLink(
    connection: RingCentralConnection,
    consultationRequest: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      procedure: string;
    }
  ): string {
    const params = new URLSearchParams({
      subject: `Consultation: ${consultationRequest.first_name} ${consultationRequest.last_name}`,
      location: connection.default_provider_location || 'ClearSight LASIK',
      description: `Patient: ${consultationRequest.first_name} ${consultationRequest.last_name}\nEmail: ${consultationRequest.email}\nPhone: ${consultationRequest.phone}\nProcedure: ${consultationRequest.procedure}`,
    });

    return `https://app.ringcentral.com/calendar/new?${params.toString()}`;
  }

  getClickToCallLink(fromNumber: string, toNumber: string): string {
    return `rcapp://r/call?number=${encodeURIComponent(toNumber)}&from=${encodeURIComponent(fromNumber)}`;
  }

  getSMSDeepLink(
    fromNumber: string,
    toNumber: string,
    prefilledMessage?: string
  ): string {
    const params = new URLSearchParams({
      to: toNumber,
      from: fromNumber,
    });

    if (prefilledMessage) {
      params.append('body', prefilledMessage);
    }

    return `rcapp://r/sms?${params.toString()}`;
  }

  async updateConnectionDefaults(
    connectionId: string,
    defaults: {
      default_call_queue?: string;
      default_team?: string;
      default_number?: string;
      default_sms_from?: string;
      default_provider_location?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('ringcentral_connections')
      .update(defaults)
      .eq('id', connectionId);

    if (error) throw error;
  }

  async testConnection(connection: RingCentralConnection): Promise<boolean> {
    try {
      await this.getPhoneNumbers(connection);
      await ringCentralAuth.updateConnectionStatus(connection.id, 'connected');
      return true;
    } catch (err) {
      await ringCentralAuth.updateConnectionStatus(
        connection.id,
        'error',
        err instanceof Error ? err.message : 'Unknown error'
      );
      return false;
    }
  }
}

export const ringCentralService = new RingCentralService();
