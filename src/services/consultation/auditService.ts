import type { ConsultationAuditLog, AuditAction } from '../../types/Consultation';
import { supabase } from '../../lib/supabase';

export class AuditService {
  async logAction(
    consultationRequestId: string,
    action: AuditAction,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('consultation_audit_log').insert({
      consultation_request_id: consultationRequestId,
      user_id: user?.id || null,
      action,
      details: this.sanitizeDetails(details),
    });

    if (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  async logFailover(
    consultationRequestId: string,
    reason: string,
    fromMethod: string,
    toMethod: string
  ): Promise<void> {
    await this.logAction(consultationRequestId, 'failover', {
      reason,
      from_method: fromMethod,
      to_method: toMethod,
      timestamp: new Date().toISOString(),
    });
  }

  async getAuditTrail(consultationRequestId: string): Promise<ConsultationAuditLog[]> {
    const { data, error } = await supabase
      .from('consultation_audit_log')
      .select('*')
      .eq('consultation_request_id', consultationRequestId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAuditTrailWithUsers(
    consultationRequestId: string
  ): Promise<
    Array<
      ConsultationAuditLog & {
        user: { id: string; email: string; full_name: string | null } | null;
      }
    >
  > {
    const { data, error } = await supabase
      .from('consultation_audit_log')
      .select(
        `
        *,
        user:users(id, email, full_name)
      `
      )
      .eq('consultation_request_id', consultationRequestId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async exportAuditLogs(
    filters: {
      from_date?: string;
      to_date?: string;
      action?: AuditAction;
      user_id?: string;
    } = {}
  ): Promise<ConsultationAuditLog[]> {
    let query = supabase
      .from('consultation_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.from_date) {
      query = query.gte('created_at', filters.from_date);
    }

    if (filters.to_date) {
      query = query.lte('created_at', filters.to_date);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async exportToCSV(logs: ConsultationAuditLog[]): Promise<string> {
    const headers = ['ID', 'Request ID', 'User ID', 'Action', 'Details', 'Created At'];
    const rows = logs.map((log) => [
      log.id,
      log.consultation_request_id,
      log.user_id || 'System',
      log.action,
      JSON.stringify(this.sanitizeDetails(log.details)),
      log.created_at,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }

  private sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };

    const piiFields = ['email', 'phone', 'first_name', 'last_name', 'ssn', 'dob'];
    piiFields.forEach((field) => {
      if (field in sanitized) {
        if (field === 'phone') {
          const phone = String(sanitized[field]);
          sanitized[field] = phone.slice(-4).padStart(phone.length, '*');
        } else if (field === 'email') {
          const email = String(sanitized[field]);
          const [local, domain] = email.split('@');
          sanitized[field] = `${local.substring(0, 2)}***@${domain}`;
        } else {
          sanitized[field] = '[REDACTED]';
        }
      }
    });

    return sanitized;
  }
}

export const auditService = new AuditService();
