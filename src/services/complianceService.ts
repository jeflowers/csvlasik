import { supabase } from '../lib/supabase';

export interface ComplianceStatus {
  hipaa: HIPAAStatus;
  gdpr: GDPRStatus;
  iso27001: ISO27001Status;
  lastChecked: string;
}

export interface HIPAAStatus {
  compliant: boolean;
  auditLogging: boolean;
  dataEncryption: 'active' | 'partial' | 'missing';
  accessControls: boolean;
  baasInPlace: boolean;
  encryptionAtRest: 'active' | 'pending' | 'missing';
  authentication: boolean;
  transmissionSecurity: boolean;
  integrity: boolean;
}

export interface GDPRStatus {
  compliant: boolean;
  dataSubjectRights: boolean;
  consentManagement: 'advanced' | 'basic' | 'missing';
  dataRetention: 'automated' | 'manual' | 'missing';
  privacyPolicy: boolean;
  privacyPolicyVersion?: string;
}

export interface ISO27001Status {
  compliant: boolean;
  securityControls: boolean;
  riskManagement: 'advanced' | 'basic' | 'missing';
  ismsDocumentation: boolean;
  managementReview: boolean;
}

class ComplianceService {
  async checkHIPAACompliance(): Promise<HIPAAStatus> {
    try {
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('id')
        .limit(1);

      const { data: encryptionKeys, error: encError } = await supabase
        .from('encryption_keys')
        .select('id, status')
        .eq('status', 'active');

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      const hasAuditLogging = !auditError && auditLogs && auditLogs.length > 0;
      const hasUsers = !usersError && users && users.length > 0;

      const encryptionAtRest = encryptionKeys && encryptionKeys.length > 0
        ? 'active' as const
        : 'pending' as const;

      const dataEncryption = encryptionAtRest === 'active' ? 'active' as const : 'partial' as const;

      const status: HIPAAStatus = {
        compliant: hasAuditLogging && hasUsers && encryptionAtRest === 'active',
        auditLogging: hasAuditLogging,
        dataEncryption,
        accessControls: hasUsers,
        baasInPlace: false,
        encryptionAtRest,
        authentication: hasUsers,
        transmissionSecurity: true,
        integrity: true
      };

      return status;
    } catch (error) {
      console.error('Error checking HIPAA compliance:', error);
      return {
        compliant: false,
        auditLogging: false,
        dataEncryption: 'missing',
        accessControls: false,
        baasInPlace: false,
        encryptionAtRest: 'missing',
        authentication: false,
        transmissionSecurity: false,
        integrity: false
      };
    }
  }

  async checkGDPRCompliance(): Promise<GDPRStatus> {
    try {
      const { data: consentRecords, error: consentError } = await supabase
        .from('consent_records')
        .select('id')
        .limit(1);

      const { data: consentCategories, error: categoriesError } = await supabase
        .from('consent_categories')
        .select('id');

      const { data: retentionPolicies, error: retentionError } = await supabase
        .from('data_retention_policies')
        .select('id, automated')
        .eq('active', true);

      const { data: privacyPolicies, error: privacyError } = await supabase
        .from('privacy_policy_versions')
        .select('id, version')
        .eq('status', 'published')
        .order('version', { ascending: false })
        .limit(1);

      const { data: dataExports, error: exportsError } = await supabase
        .from('consent_data_exports')
        .select('id')
        .limit(1);

      const hasConsentManagement = !consentError && consentRecords && consentRecords.length > 0;
      const hasAdvancedConsent = hasConsentManagement &&
                                 consentCategories && consentCategories.length > 0;

      const hasDataRetention = !retentionError && retentionPolicies && retentionPolicies.length > 0;
      const hasAutomatedRetention = retentionPolicies &&
                                    retentionPolicies.some(p => p.automated);

      const hasPrivacyPolicy = !privacyError && privacyPolicies && privacyPolicies.length > 0;
      const hasDataExports = !exportsError && dataExports && dataExports.length > 0;

      const consentManagement = hasAdvancedConsent ? 'advanced' as const :
                               hasConsentManagement ? 'basic' as const :
                               'missing' as const;

      const dataRetention = hasAutomatedRetention ? 'automated' as const :
                           hasDataRetention ? 'manual' as const :
                           'missing' as const;

      const status: GDPRStatus = {
        compliant: hasConsentManagement && hasDataRetention && hasPrivacyPolicy && hasDataExports,
        dataSubjectRights: hasDataExports,
        consentManagement,
        dataRetention,
        privacyPolicy: hasPrivacyPolicy,
        privacyPolicyVersion: privacyPolicies && privacyPolicies[0]?.version
      };

      return status;
    } catch (error) {
      console.error('Error checking GDPR compliance:', error);
      return {
        compliant: false,
        dataSubjectRights: false,
        consentManagement: 'missing',
        dataRetention: 'missing',
        privacyPolicy: false
      };
    }
  }

  async checkISO27001Compliance(): Promise<ISO27001Status> {
    try {
      const { data: reviews, error: reviewsError } = await supabase
        .from('management_reviews')
        .select('id')
        .limit(1);

      const { data: riskAssessments, error: riskError } = await supabase
        .from('risk_assessments')
        .select('id')
        .limit(1);

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('id')
        .limit(1);

      const hasManagementReviews = !reviewsError && reviews && reviews.length > 0;
      const hasRiskAssessments = !riskError && riskAssessments && riskAssessments.length > 0;
      const hasSecurityControls = !usersError && users && users.length > 0 &&
                                  !auditError && auditLogs && auditLogs.length > 0;

      const riskManagement = hasRiskAssessments ? 'basic' as const : 'missing' as const;

      const status: ISO27001Status = {
        compliant: hasManagementReviews && hasRiskAssessments && hasSecurityControls,
        securityControls: hasSecurityControls,
        riskManagement,
        ismsDocumentation: hasManagementReviews || hasRiskAssessments,
        managementReview: hasManagementReviews
      };

      return status;
    } catch (error) {
      console.error('Error checking ISO 27001 compliance:', error);
      return {
        compliant: false,
        securityControls: false,
        riskManagement: 'missing',
        ismsDocumentation: false,
        managementReview: false
      };
    }
  }

  async getComplianceStatus(): Promise<ComplianceStatus> {
    const [hipaa, gdpr, iso27001] = await Promise.all([
      this.checkHIPAACompliance(),
      this.checkGDPRCompliance(),
      this.checkISO27001Compliance()
    ]);

    return {
      hipaa,
      gdpr,
      iso27001,
      lastChecked: new Date().toISOString()
    };
  }

  async getAuditLogs(limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          resource_type,
          resource_id,
          details,
          ip_address,
          user_agent,
          created_at,
          phi_accessed,
          gdpr_relevant,
          users!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(log => ({
        id: log.id,
        user_id: log.user_id,
        username: log.users?.email || 'Unknown',
        action: log.action,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        details: log.details || '',
        ip_address: log.ip_address || '',
        user_agent: log.user_agent || '',
        created_at: log.created_at,
        phi_accessed: log.phi_accessed || false,
        gdpr_relevant: log.gdpr_relevant || false
      })) || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  async getDataSubjectRequests() {
    try {
      const { data, error } = await supabase
        .from('data_subject_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(request => ({
        id: request.id,
        request_type: request.request_type,
        email: request.email,
        status: request.status,
        requested_at: request.created_at,
        completed_at: request.processed_at,
        notes: request.reason || ''
      })) || [];
    } catch (error) {
      console.error('Error fetching data subject requests:', error);
      return [];
    }
  }

  async checkPrivacyPolicyStatus() {
    try {
      const { data, error } = await supabase
        .from('privacy_policy_versions')
        .select('id, version, status, effective_date')
        .eq('status', 'published')
        .order('version', { ascending: false })
        .limit(1);

      if (error) throw error;

      return {
        hasPolicy: data && data.length > 0,
        version: data?.[0]?.version,
        effectiveDate: data?.[0]?.effective_date
      };
    } catch (error) {
      console.error('Error checking privacy policy:', error);
      return { hasPolicy: false };
    }
  }

  async checkConsentManagementStatus() {
    try {
      const [categories, records] = await Promise.all([
        supabase.from('consent_categories').select('id').eq('active', true),
        supabase.from('consent_records').select('id').limit(1)
      ]);

      return {
        hasCategories: categories.data && categories.data.length > 0,
        categoryCount: categories.data?.length || 0,
        hasRecords: records.data && records.data.length > 0,
        level: categories.data && categories.data.length > 0 ? 'advanced' :
               records.data && records.data.length > 0 ? 'basic' : 'missing'
      };
    } catch (error) {
      console.error('Error checking consent management:', error);
      return { hasCategories: false, categoryCount: 0, hasRecords: false, level: 'missing' };
    }
  }

  async checkDataRetentionStatus() {
    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('id, policy_name, automated, active')
        .eq('active', true);

      if (error) throw error;

      const automatedPolicies = data?.filter(p => p.automated) || [];

      return {
        hasPolicies: data && data.length > 0,
        policyCount: data?.length || 0,
        automatedCount: automatedPolicies.length,
        level: automatedPolicies.length > 0 ? 'automated' :
               data && data.length > 0 ? 'manual' : 'missing'
      };
    } catch (error) {
      console.error('Error checking data retention:', error);
      return { hasPolicies: false, policyCount: 0, automatedCount: 0, level: 'missing' };
    }
  }

  async checkEncryptionStatus() {
    try {
      const { data, error } = await supabase
        .from('encryption_keys')
        .select('id, key_purpose, status, algorithm')
        .eq('status', 'active');

      if (error) throw error;

      return {
        hasEncryption: data && data.length > 0,
        activeKeys: data?.length || 0,
        keyTypes: data?.map(k => k.key_purpose) || [],
        status: data && data.length > 0 ? 'active' : 'pending'
      };
    } catch (error) {
      console.error('Error checking encryption:', error);
      return { hasEncryption: false, activeKeys: 0, keyTypes: [], status: 'missing' };
    }
  }
}

export const complianceService = new ComplianceService();
