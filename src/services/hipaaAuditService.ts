import { supabase } from '../lib/supabase';

export interface HIPAAAuditEvent {
  id: string;
  event_type: string;
  user_id: string;
  patient_id?: string;
  phi_tables_accessed: string[];
  phi_fields_accessed?: string[];
  record_count: number;
  purpose_of_use: string;
  minimum_necessary_verified: boolean;
  is_emergency_access: boolean;
  emergency_justification?: string;
  session_id?: string;
  ip_address?: string;
  created_at: string;
  hipaa_compliant: boolean;
}

export interface SecurityAuditEvent {
  id: string;
  event_type: string;
  user_id?: string;
  username?: string;
  event_details: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  reviewed: boolean;
}

export interface AuditSession {
  id: string;
  session_id: string;
  user_id: string;
  started_at: string;
  last_activity: string;
  ended_at?: string;
  status: 'active' | 'expired' | 'terminated' | 'timeout';
  ip_address?: string;
  actions_performed: number;
  phi_accesses: number;
  suspicious_activity: boolean;
}

export interface AuditMetrics {
  total_phi_accesses: number;
  unique_users_accessed_phi: number;
  emergency_accesses: number;
  non_compliant_accesses: number;
  avg_accesses_per_day: number;
  compliance_score: number;
}

export interface SuspiciousPattern {
  user_id: string;
  username: string;
  suspicious_pattern: string;
  event_count: number;
  risk_level: string;
  details: Record<string, any>;
}

export interface AuditIntegrityCheck {
  audit_log_id: number;
  is_valid: boolean;
  expected_hash: string;
  actual_hash: string;
  message: string;
}

export interface ComplianceReport {
  id: string;
  report_type: string;
  report_name: string;
  date_range_start: string;
  date_range_end: string;
  status: 'generating' | 'completed' | 'failed';
  file_path?: string;
  file_format?: string;
  generated_at: string;
}

class HIPAAAuditService {
  async getHIPAAAuditEvents(
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<HIPAAAuditEvent[]> {
    try {
      let query = supabase
        .from('hipaa_audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching HIPAA audit events:', error);
      return [];
    }
  }

  async getPHIAccessByUser(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HIPAAAuditEvent[]> {
    try {
      let query = supabase
        .from('hipaa_audit_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching PHI access by user:', error);
      return [];
    }
  }

  async getPHIAccessByPatient(
    patientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HIPAAAuditEvent[]> {
    try {
      let query = supabase
        .from('hipaa_audit_events')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching PHI access by patient:', error);
      return [];
    }
  }

  async getEmergencyAccesses(
    startDate?: string,
    endDate?: string
  ): Promise<HIPAAAuditEvent[]> {
    try {
      let query = supabase
        .from('hipaa_audit_events')
        .select('*')
        .eq('is_emergency_access', true)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emergency accesses:', error);
      return [];
    }
  }

  async getNonCompliantAccesses(
    startDate?: string,
    endDate?: string
  ): Promise<HIPAAAuditEvent[]> {
    try {
      let query = supabase
        .from('hipaa_audit_events')
        .select('*')
        .eq('hipaa_compliant', false)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching non-compliant accesses:', error);
      return [];
    }
  }

  async getHIPAAMetrics(
    startDate?: string,
    endDate?: string
  ): Promise<AuditMetrics | null> {
    try {
      const { data, error } = await supabase.rpc('get_hipaa_audit_metrics', {
        p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate || new Date().toISOString()
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching HIPAA metrics:', error);
      return null;
    }
  }

  async getSecurityAuditEvents(
    limit: number = 100,
    riskLevel?: string
  ): Promise<SecurityAuditEvent[]> {
    try {
      let query = supabase
        .from('security_audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (riskLevel) {
        query = query.eq('risk_level', riskLevel);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching security audit events:', error);
      return [];
    }
  }

  async getUnreviewedSecurityEvents(): Promise<SecurityAuditEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_events')
        .select('*')
        .eq('reviewed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unreviewed security events:', error);
      return [];
    }
  }

  async getActiveSessions(): Promise<AuditSession[]> {
    try {
      const { data, error } = await supabase
        .from('audit_sessions')
        .select('*')
        .eq('status', 'active')
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  async getSuspiciousSessions(): Promise<AuditSession[]> {
    try {
      const { data, error } = await supabase
        .from('audit_sessions')
        .select('*')
        .eq('suspicious_activity', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suspicious sessions:', error);
      return [];
    }
  }

  async detectSuspiciousPatterns(
    lookbackHours: number = 24
  ): Promise<SuspiciousPattern[]> {
    try {
      const { data, error } = await supabase.rpc('detect_suspicious_audit_patterns', {
        p_lookback_hours: lookbackHours
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error detecting suspicious patterns:', error);
      return [];
    }
  }

  async verifyAuditLogIntegrity(
    auditLogId?: number
  ): Promise<AuditIntegrityCheck[]> {
    try {
      const { data, error } = await supabase.rpc('verify_audit_log_integrity', {
        p_audit_log_id: auditLogId || null
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error verifying audit log integrity:', error);
      return [];
    }
  }

  async getTamperedAuditLogs(): Promise<AuditIntegrityCheck[]> {
    try {
      const { data, error } = await supabase
        .from('audit_log_integrity')
        .select('*')
        .eq('tampering_detected', true)
        .order('last_verification', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tampered audit logs:', error);
      return [];
    }
  }

  async getComplianceReports(
    reportType?: string,
    limit: number = 50
  ): Promise<ComplianceReport[]> {
    try {
      let query = supabase
        .from('compliance_audit_reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (reportType) {
        query = query.eq('report_type', reportType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
      return [];
    }
  }

  async generateComplianceReport(
    reportType: string,
    reportName: string,
    startDate: string,
    endDate: string,
    filters?: Record<string, any>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('compliance_audit_reports')
        .insert({
          report_type: reportType,
          report_name: reportName,
          date_range_start: startDate,
          date_range_end: endDate,
          filters: filters || {},
          status: 'generating',
          file_format: 'pdf'
        })
        .select()
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return null;
    }
  }

  async logPHIAccess(
    patientId: string,
    eventType: string,
    purposeOfUse: string,
    tablesAccessed?: string[],
    fieldsAccessed?: string[],
    isEmergency: boolean = false
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_phi_access', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_patient_id: patientId,
        p_event_type: eventType,
        p_purpose_of_use: purposeOfUse,
        p_tables_accessed: tablesAccessed,
        p_fields_accessed: fieldsAccessed,
        p_is_emergency: isEmergency,
        p_session_id: null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging PHI access:', error);
      return null;
    }
  }

  async logEmergencyAccess(
    patientId: string,
    emergencyReason: string,
    tablesAccessed?: string[]
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_emergency_phi_access', {
        p_patient_id: patientId,
        p_emergency_reason: emergencyReason,
        p_tables_accessed: tablesAccessed
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging emergency access:', error);
      return null;
    }
  }

  async logDataExport(
    exportType: string,
    recordCount: number,
    tableNames: string[],
    purpose: string,
    filePath?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_data_export', {
        p_export_type: exportType,
        p_record_count: recordCount,
        p_table_names: tableNames,
        p_purpose: purpose,
        p_file_path: filePath
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging data export:', error);
      return null;
    }
  }

  async searchAuditLogs(
    searchParams: {
      userId?: string;
      action?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
      phiOnly?: boolean;
      severity?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          users!inner(email, name)
        `)
        .order('created_at', { ascending: false })
        .limit(searchParams.limit || 100);

      if (searchParams.userId) {
        query = query.eq('user_id', searchParams.userId);
      }
      if (searchParams.action) {
        query = query.eq('action', searchParams.action);
      }
      if (searchParams.resourceType) {
        query = query.eq('resource_type', searchParams.resourceType);
      }
      if (searchParams.startDate) {
        query = query.gte('created_at', searchParams.startDate);
      }
      if (searchParams.endDate) {
        query = query.lte('created_at', searchParams.endDate);
      }
      if (searchParams.phiOnly) {
        query = query.eq('phi_accessed', true);
      }
      if (searchParams.severity) {
        query = query.eq('severity', searchParams.severity);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching audit logs:', error);
      return [];
    }
  }

  async getUserAuditTrail(
    userId: string,
    startDate?: string,
    endDate?: string,
    phiOnly: boolean = false
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_audit_trail', {
        p_user_id: userId,
        p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate || new Date().toISOString(),
        p_include_phi_only: phiOnly
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user audit trail:', error);
      return [];
    }
  }
}

export const hipaaAuditService = new HIPAAAuditService();
