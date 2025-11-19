import type {
  NextechConnection,
  NextechPatient,
  NextechPatientData,
  NextechPatientCreateRequest,
  NextechPatientSearchParams,
  NextechAppointment,
  NextechAppointmentData,
  NextechAppointmentCreateRequest,
  NextechAppointmentUpdateRequest,
  NextechAppointmentSearchParams,
  NextechProvider,
  NextechLocation,
  NextechAppointmentType,
  NextechAvailabilityRequest,
  NextechAvailabilitySlot,
  NextechCommunicationRequest,
  NextechApiResponse,
  NextechSyncLog,
} from '../../types/Nextech';
import { nextechAuth } from './nextechAuth';
import { supabase } from '../../lib/supabase';

export class NextechService {
  private async makeApiRequest<T>(
    connection: NextechConnection,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<NextechApiResponse<T>> {
    const apiKey = nextechAuth.getApiKey(connection);
    const baseUrl = nextechAuth.getBaseUrl(connection);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: data.message || 'Nextech API error',
            details: JSON.stringify(data),
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      };
    }
  }

  private async logSync(
    practiceId: string,
    syncType: NextechSyncLog['sync_type'],
    entityType: 'patient' | 'appointment',
    entityId: string | undefined,
    nextechEntityId: string | undefined,
    status: 'success' | 'failed' | 'retrying',
    requestPayload?: any,
    responsePayload?: any,
    errorDetails?: any
  ): Promise<void> {
    await supabase.from('nextech_sync_log').insert({
      practice_id: practiceId,
      sync_type: syncType,
      entity_type: entityType,
      entity_id: entityId,
      nextech_entity_id: nextechEntityId,
      operation_status: status,
      request_payload: requestPayload,
      response_payload: responsePayload,
      error_details: errorDetails,
      retry_count: 0,
    });
  }

  async searchPatients(
    connection: NextechConnection,
    searchParams: NextechPatientSearchParams
  ): Promise<NextechApiResponse<NextechPatientData[]>> {
    const queryParams = new URLSearchParams();

    if (searchParams.first_name) queryParams.append('firstName', searchParams.first_name);
    if (searchParams.last_name) queryParams.append('lastName', searchParams.last_name);
    if (searchParams.date_of_birth) queryParams.append('dateOfBirth', searchParams.date_of_birth);
    if (searchParams.phone) queryParams.append('phone', searchParams.phone);
    if (searchParams.email) queryParams.append('email', searchParams.email);
    if (searchParams.patient_id) queryParams.append('patientId', searchParams.patient_id);

    return this.makeApiRequest<NextechPatientData[]>(
      connection,
      `/v1/patients?${queryParams.toString()}`
    );
  }

  async getPatient(
    connection: NextechConnection,
    patientId: string
  ): Promise<NextechApiResponse<NextechPatientData>> {
    return this.makeApiRequest<NextechPatientData>(
      connection,
      `/v1/patients/${patientId}`
    );
  }

  async createPatient(
    connection: NextechConnection,
    patientData: NextechPatientCreateRequest
  ): Promise<NextechApiResponse<NextechPatientData>> {
    const response = await this.makeApiRequest<NextechPatientData>(
      connection,
      '/v1/patients',
      {
        method: 'POST',
        body: JSON.stringify(patientData),
      }
    );

    await this.logSync(
      connection.practice_id,
      'patient_create',
      'patient',
      undefined,
      response.data?.patient_id,
      response.success ? 'success' : 'failed',
      patientData,
      response.data,
      response.error
    );

    return response;
  }

  async updatePatient(
    connection: NextechConnection,
    patientId: string,
    patientData: Partial<NextechPatientCreateRequest>
  ): Promise<NextechApiResponse<NextechPatientData>> {
    const response = await this.makeApiRequest<NextechPatientData>(
      connection,
      `/v1/patients/${patientId}`,
      {
        method: 'PUT',
        body: JSON.stringify(patientData),
      }
    );

    await this.logSync(
      connection.practice_id,
      'patient_update',
      'patient',
      undefined,
      patientId,
      response.success ? 'success' : 'failed',
      patientData,
      response.data,
      response.error
    );

    return response;
  }

  async findOrCreatePatient(
    connection: NextechConnection,
    consultationRequest: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      preferred_language?: string;
    }
  ): Promise<{ patient_id: string; is_new: boolean } | null> {
    const searchResult = await this.searchPatients(connection, {
      first_name: consultationRequest.first_name,
      last_name: consultationRequest.last_name,
      phone: consultationRequest.phone,
    });

    if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
      return {
        patient_id: searchResult.data[0].patient_id,
        is_new: false,
      };
    }

    const createResult = await this.createPatient(connection, {
      first_name: consultationRequest.first_name,
      last_name: consultationRequest.last_name,
      email: consultationRequest.email,
      mobile_phone: consultationRequest.phone,
      preferred_language: consultationRequest.preferred_language,
    });

    if (createResult.success && createResult.data) {
      return {
        patient_id: createResult.data.patient_id,
        is_new: true,
      };
    }

    return null;
  }

  async linkPatientToConsultation(
    consultationRequestId: string,
    nextechPatientId: string,
    practiceId: string,
    patientData: NextechPatientData
  ): Promise<void> {
    await supabase.from('nextech_patients').insert({
      consultation_request_id: consultationRequestId,
      nextech_patient_id: nextechPatientId,
      nextech_practice_id: practiceId,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
      patient_data: patientData,
    });

    await supabase
      .from('consultation_requests')
      .update({
        nextech_patient_id: nextechPatientId,
        nextech_sync_status: 'synced',
      })
      .eq('id', consultationRequestId);
  }

  async getProviders(
    connection: NextechConnection
  ): Promise<NextechApiResponse<NextechProvider[]>> {
    return this.makeApiRequest<NextechProvider[]>(connection, '/v1/providers');
  }

  async getLocations(
    connection: NextechConnection
  ): Promise<NextechApiResponse<NextechLocation[]>> {
    return this.makeApiRequest<NextechLocation[]>(connection, '/v1/locations');
  }

  async getAppointmentTypes(
    connection: NextechConnection
  ): Promise<NextechApiResponse<NextechAppointmentType[]>> {
    return this.makeApiRequest<NextechAppointmentType[]>(
      connection,
      '/v1/appointment-types'
    );
  }

  async getAvailability(
    connection: NextechConnection,
    request: NextechAvailabilityRequest
  ): Promise<NextechApiResponse<NextechAvailabilitySlot[]>> {
    const queryParams = new URLSearchParams({
      providerId: request.provider_id,
      locationId: request.location_id,
      appointmentTypeId: request.appointment_type_id,
      startDate: request.start_date,
      endDate: request.end_date,
    });

    if (request.duration_minutes) {
      queryParams.append('durationMinutes', request.duration_minutes.toString());
    }

    return this.makeApiRequest<NextechAvailabilitySlot[]>(
      connection,
      `/v1/availability?${queryParams.toString()}`
    );
  }

  async searchAppointments(
    connection: NextechConnection,
    searchParams: NextechAppointmentSearchParams
  ): Promise<NextechApiResponse<NextechAppointmentData[]>> {
    const queryParams = new URLSearchParams();

    if (searchParams.patient_id) queryParams.append('patientId', searchParams.patient_id);
    if (searchParams.provider_id) queryParams.append('providerId', searchParams.provider_id);
    if (searchParams.location_id) queryParams.append('locationId', searchParams.location_id);
    if (searchParams.start_date) queryParams.append('startDate', searchParams.start_date);
    if (searchParams.end_date) queryParams.append('endDate', searchParams.end_date);
    if (searchParams.status) queryParams.append('status', searchParams.status);

    return this.makeApiRequest<NextechAppointmentData[]>(
      connection,
      `/v1/appointments?${queryParams.toString()}`
    );
  }

  async createAppointment(
    connection: NextechConnection,
    appointmentData: NextechAppointmentCreateRequest
  ): Promise<NextechApiResponse<NextechAppointmentData>> {
    const response = await this.makeApiRequest<NextechAppointmentData>(
      connection,
      '/v1/appointments',
      {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      }
    );

    await this.logSync(
      connection.practice_id,
      'appointment_create',
      'appointment',
      undefined,
      response.data?.appointment_id,
      response.success ? 'success' : 'failed',
      appointmentData,
      response.data,
      response.error
    );

    return response;
  }

  async updateAppointment(
    connection: NextechConnection,
    appointmentData: NextechAppointmentUpdateRequest
  ): Promise<NextechApiResponse<NextechAppointmentData>> {
    const response = await this.makeApiRequest<NextechAppointmentData>(
      connection,
      `/v1/appointments/${appointmentData.appointment_id}`,
      {
        method: 'PUT',
        body: JSON.stringify(appointmentData),
      }
    );

    await this.logSync(
      connection.practice_id,
      'appointment_update',
      'appointment',
      undefined,
      appointmentData.appointment_id,
      response.success ? 'success' : 'failed',
      appointmentData,
      response.data,
      response.error
    );

    return response;
  }

  async cancelAppointment(
    connection: NextechConnection,
    appointmentId: string,
    reason?: string
  ): Promise<NextechApiResponse<void>> {
    const response = await this.makeApiRequest<void>(
      connection,
      `/v1/appointments/${appointmentId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );

    await this.logSync(
      connection.practice_id,
      'appointment_cancel',
      'appointment',
      undefined,
      appointmentId,
      response.success ? 'success' : 'failed',
      { reason },
      response.data,
      response.error
    );

    return response;
  }

  async linkAppointmentToConsultation(
    consultationRequestId: string,
    nextechAppointmentId: string,
    nextechPatientId: string,
    practiceId: string,
    appointmentData: NextechAppointmentData
  ): Promise<void> {
    await supabase.from('nextech_appointments').insert({
      consultation_request_id: consultationRequestId,
      nextech_patient_id: nextechPatientId,
      nextech_appointment_id: nextechAppointmentId,
      nextech_practice_id: practiceId,
      appointment_status: 'scheduled',
      appointment_date: appointmentData.start_date_time,
      appointment_type: appointmentData.appointment_type_name,
      provider_id: appointmentData.provider_id,
      location_id: appointmentData.location_id,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
      appointment_data: appointmentData,
    });

    await supabase
      .from('consultation_requests')
      .update({
        nextech_appointment_id: nextechAppointmentId,
        status: 'scheduled',
        scheduled_via: 'nextech',
      })
      .eq('id', consultationRequestId);
  }

  async sendCommunication(
    connection: NextechConnection,
    communicationData: NextechCommunicationRequest
  ): Promise<NextechApiResponse<void>> {
    return this.makeApiRequest<void>(connection, '/v1/communications', {
      method: 'POST',
      body: JSON.stringify(communicationData),
    });
  }

  async syncAppointmentStatus(
    connection: NextechConnection,
    appointmentId: string
  ): Promise<void> {
    const response = await this.makeApiRequest<NextechAppointmentData>(
      connection,
      `/v1/appointments/${appointmentId}`
    );

    if (response.success && response.data) {
      await supabase
        .from('nextech_appointments')
        .update({
          appointment_status: response.data.status as any,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
          appointment_data: response.data,
        })
        .eq('nextech_appointment_id', appointmentId);

      await this.logSync(
        connection.practice_id,
        'status_sync',
        'appointment',
        undefined,
        appointmentId,
        'success',
        { appointmentId },
        response.data
      );
    }
  }

  async getSyncLogs(
    practiceId: string,
    filters?: {
      sync_type?: string;
      entity_type?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<NextechSyncLog[]> {
    let query = supabase
      .from('nextech_sync_log')
      .select('*')
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: false });

    if (filters?.sync_type) {
      query = query.eq('sync_type', filters.sync_type);
    }

    if (filters?.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters?.status) {
      query = query.eq('operation_status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}

export const nextechService = new NextechService();
