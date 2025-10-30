import { supabase } from '../lib/supabase';
import type { AppointmentRequest, AppointmentRequestCreate, AppointmentRequestUpdate } from '../types/appointments';

export class AppointmentRequestService {
  async createRequest(data: AppointmentRequestCreate): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    try {
      const { data: result, error } = await supabase
        .from('appointment_requests')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error('Error creating appointment request:', error);
      return { data: null, error: error as Error };
    }
  }

  async getAllRequests(): Promise<{ data: AppointmentRequest[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      return { data: [], error: error as Error };
    }
  }

  async updateRequest(id: string, updates: AppointmentRequestUpdate): Promise<{ data: AppointmentRequest | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
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
}

export const appointmentRequestService = new AppointmentRequestService();
