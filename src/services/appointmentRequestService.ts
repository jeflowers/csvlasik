import { supabase } from '../lib/supabase';
import type { AppointmentRequest, AppointmentRequestCreate, AppointmentRequestUpdate } from '../types/appointments';
import { emailService } from './emailService';
import { emailTemplates } from '../utils/emailTemplates';

const APPOINTMENT_REQUESTS_TABLE = 'appointment_requests';

export class AppointmentRequestService {
  async createRequest(data: AppointmentRequestCreate): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    try {
      const { data: result, error } = await supabase
        .from(APPOINTMENT_REQUESTS_TABLE)
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          procedure_type: data.procedure_type || 'consultation',
          location: data.location || 'los_angeles',
          notes: data.notes || '',
          status: 'pending'
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!result) {
        throw new Error('Failed to create appointment request');
      }

      const fullName = `${data.first_name} ${data.last_name}`;

      const confirmationEmail = emailTemplates.appointmentConfirmation({
        name: fullName,
        email: data.email,
        phone: data.phone,
        preferredDate: new Date().toLocaleDateString(),
        message: data.notes || 'Consultation request',
        requestId: result.id,
      });

      await emailService.queueEmail({
        to: data.email,
        subject: confirmationEmail.subject,
        htmlBody: confirmationEmail.html,
        textBody: confirmationEmail.text,
      }).catch(err => console.warn('Email queue error:', err));

      const notificationEmail = emailTemplates.appointmentNotification({
        name: fullName,
        email: data.email,
        phone: data.phone,
        preferredDate: new Date().toLocaleDateString(),
        message: data.notes || 'Consultation request',
        requestId: result.id,
      });

      await emailService.queueEmail({
        to: 'appointments@atelierlasik.com',
        subject: notificationEmail.subject,
        htmlBody: notificationEmail.html,
        textBody: notificationEmail.text,
      }).catch(err => console.warn('Email queue error:', err));

      await emailService.processQueue().catch(err => console.warn('Email processing error:', err));

      return { data: result as any, error: null };
    } catch (error) {
      console.error('Error creating appointment request:', error);
      return { data: null, error: error as Error };
    }
  }

  async getAllRequests(): Promise<{ data: AppointmentRequest[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from(APPOINTMENT_REQUESTS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as any[] || [], error: null };
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      return { data: [], error: error as Error };
    }
  }

  async updateRequest(id: string, updates: AppointmentRequestUpdate): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from(APPOINTMENT_REQUESTS_TABLE)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as any, error: null };
    } catch (error) {
      console.error('Error updating appointment request:', error);
      return { data: null, error: error as Error };
    }
  }

  async confirmAppointment(id: string, confirmedTime: string, staffNotes?: string): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();

      const updates: AppointmentRequestUpdate = {
        status: 'confirmed',
        confirmed_time: confirmedTime,
        staff_notes: staffNotes || '',
        reviewed_at: new Date().toISOString()
      };

      if (currentUser?.user?.id) {
        updates.reviewed_by = currentUser.user.id;
      }

      return await this.updateRequest(id, updates);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      return { data: null, error: error as Error };
    }
  }

  async declineAppointment(id: string, staffNotes: string): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();

      const updates: AppointmentRequestUpdate = {
        status: 'declined',
        staff_notes: staffNotes,
        reviewed_at: new Date().toISOString()
      };

      if (currentUser?.user?.id) {
        updates.reviewed_by = currentUser.user.id;
      }

      return await this.updateRequest(id, updates);
    } catch (error) {
      console.error('Error declining appointment:', error);
      return { data: null, error: error as Error };
    }
  }

  async setReviewing(id: string): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    return await this.updateRequest(id, { status: 'reviewing' });
  }

  async createFromPatientPortal(input: {
    user_id: string | null;
    registration_id: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    notes?: string;
  }): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    try {
      const { data: result, error } = await supabase
        .from(APPOINTMENT_REQUESTS_TABLE)
        .insert([{
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          phone: input.phone,
          procedure_type: 'consultation',
          location: 'los_angeles',
          notes: input.notes || 'Submitted via Patient Portal',
          status: 'pending',
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data: result as any, error: null };
    } catch (error) {
      console.error('Error creating appointment request from portal:', error);
      return { data: null, error: error as Error };
    }
  }
}

export const appointmentRequestService = new AppointmentRequestService();
