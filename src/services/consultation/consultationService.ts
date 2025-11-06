import type {
  ConsultationRequest,
  ConsultationFormData,
  ConsultationFilters,
  ConsultationSettings,
  ConsultationRequestWithUser,
} from '../../types/Consultation';
import { supabase } from '../../lib/supabase';

export class ConsultationService {
  async getSettings(): Promise<ConsultationSettings | null> {
    const { data, error } = await supabase
      .from('consultation_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateSettings(
    settings: Partial<ConsultationSettings>
  ): Promise<ConsultationSettings> {
    const existing = await this.getSettings();

    if (existing) {
      const { data, error } = await supabase
        .from('consultation_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('consultation_settings')
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async checkDuplicate(
    email: string,
    phone: string,
    procedure: string
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc('check_duplicate_submission', {
      p_email: email,
      p_phone: phone,
      p_procedure: procedure,
    });

    if (error) throw error;
    return data;
  }

  async createRequest(
    formData: ConsultationFormData,
    submissionIp?: string
  ): Promise<ConsultationRequest> {
    const duplicateId = await this.checkDuplicate(
      formData.email,
      formData.phone,
      formData.procedure
    );

    if (duplicateId) {
      const { data: existing } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('id', duplicateId)
        .single();

      if (existing) return existing;
    }

    const { data, error } = await supabase
      .from('consultation_requests')
      .insert({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        procedure: formData.procedure,
        preferred_contact: formData.preferred_contact,
        comments: formData.comments || null,
        submission_ip: submissionIp || null,
        status: 'unassigned',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('consultation_audit_log').insert({
      consultation_request_id: data.id,
      user_id: null,
      action: 'created',
      details: { source: 'web_form' },
    });

    return data;
  }

  async getRequests(
    filters: ConsultationFilters = {},
    limit = 20,
    offset = 0
  ): Promise<ConsultationRequestWithUser[]> {
    let query = supabase
      .from('consultation_requests')
      .select(
        `
        *,
        assigned_user:users!consultation_requests_assigned_to_user_id_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.status && filters.status !== 'all' && filters.status !== 'mine') {
      query = query.eq('status', filters.status);
    }

    if (filters.status === 'mine') {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('assigned_to_user_id', user.id);
      }
    }

    if (filters.assigned_to) {
      query = query.eq('assigned_to_user_id', filters.assigned_to);
    }

    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getRequestById(id: string): Promise<ConsultationRequestWithUser | null> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select(
        `
        *,
        assigned_user:users!consultation_requests_assigned_to_user_id_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateRequest(
    id: string,
    updates: Partial<ConsultationRequest>
  ): Promise<ConsultationRequest> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async assignRequest(id: string, userId: string): Promise<ConsultationRequest> {
    return this.updateRequest(id, {
      assigned_to_user_id: userId,
      status: 'assigned',
    });
  }

  async markAsScheduled(
    id: string,
    scheduledVia: 'built-in' | 'ringcentral',
    eventId?: string
  ): Promise<ConsultationRequest> {
    const updates: Partial<ConsultationRequest> = {
      status: 'scheduled',
      scheduled_via: scheduledVia,
    };

    if (eventId) {
      if (scheduledVia === 'ringcentral') {
        updates.ringcentral_event_id = eventId;
      }
    }

    return this.updateRequest(id, updates);
  }

  async markAsClosed(id: string): Promise<ConsultationRequest> {
    return this.updateRequest(id, { status: 'closed' });
  }

  async getStats(): Promise<{
    total: number;
    unassigned: number;
    assigned: number;
    scheduled: number;
    closed: number;
  }> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('status');

    if (error) throw error;

    const stats = {
      total: data.length,
      unassigned: 0,
      assigned: 0,
      scheduled: 0,
      closed: 0,
    };

    data.forEach((item) => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats]++;
      }
    });

    return stats;
  }

  subscribeToRequests(
    callback: (payload: { new: ConsultationRequest; old: ConsultationRequest | null }) => void
  ) {
    return supabase
      .channel('consultation_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultation_requests',
        },
        callback as any
      )
      .subscribe();
  }
}

export const consultationService = new ConsultationService();
