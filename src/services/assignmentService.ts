import type {
  StaffCapabilities,
  AssignmentRules,
  AssignmentScore,
  AssignmentHistory,
} from '../types/Nextech';
import { supabase } from '../lib/supabase';

export class AssignmentService {
  async getStaffCapabilities(userId: string): Promise<StaffCapabilities | null> {
    const { data, error } = await supabase
      .from('staff_capabilities')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllActiveStaff(): Promise<StaffCapabilities[]> {
    const { data, error } = await supabase
      .from('staff_capabilities')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async updateStaffCapabilities(
    userId: string,
    capabilities: Partial<StaffCapabilities>
  ): Promise<StaffCapabilities> {
    const existing = await this.getStaffCapabilities(userId);

    if (existing) {
      const { data, error } = await supabase
        .from('staff_capabilities')
        .update(capabilities)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('staff_capabilities')
        .insert({
          user_id: userId,
          ...capabilities,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async getAssignmentRules(practiceId: string): Promise<AssignmentRules[]> {
    const { data, error } = await supabase
      .from('assignment_rules')
      .select('*')
      .eq('practice_id', practiceId)
      .eq('enabled', true)
      .order('priority_order');

    if (error) throw error;
    return data || [];
  }

  async updateAssignmentRules(
    ruleId: string,
    updates: Partial<AssignmentRules>
  ): Promise<AssignmentRules> {
    const { data, error } = await supabase
      .from('assignment_rules')
      .update(updates)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async calculateAssignmentScore(
    consultationId: string,
    staffUserId: string
  ): Promise<AssignmentScore> {
    const { data, error } = await supabase.rpc('calculate_staff_assignment_score', {
      p_consultation_id: consultationId,
      p_staff_user_id: staffUserId,
    });

    if (error) throw error;
    return data as AssignmentScore;
  }

  async findBestStaffMember(consultationId: string): Promise<{
    staff_user_id: string;
    score: AssignmentScore;
  } | null> {
    const activeStaff = await this.getAllActiveStaff();

    if (activeStaff.length === 0) {
      return null;
    }

    let bestStaff: { staff_user_id: string; score: AssignmentScore } | null = null;
    let highestScore = 0;

    for (const staff of activeStaff) {
      const score = await this.calculateAssignmentScore(consultationId, staff.user_id);

      if (score.total_score > highestScore) {
        highestScore = score.total_score;
        bestStaff = {
          staff_user_id: staff.user_id,
          score,
        };
      }
    }

    return bestStaff;
  }

  async assignConsultation(
    consultationId: string,
    staffUserId: string,
    assignedByUserId: string | null,
    method: 'automatic' | 'manual' | 'reassignment',
    rationale?: Record<string, any>
  ): Promise<void> {
    await supabase
      .from('consultation_requests')
      .update({
        assigned_to_user_id: staffUserId,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', consultationId);

    await supabase.from('assignment_history').insert({
      consultation_request_id: consultationId,
      assigned_to_user_id: staffUserId,
      assigned_by_user_id: assignedByUserId,
      assignment_method: method,
      assignment_rationale: rationale,
    });

    await supabase.from('consultation_audit_log').insert({
      consultation_request_id: consultationId,
      user_id: staffUserId,
      action: 'assigned',
      details: {
        method,
        assigned_by: assignedByUserId,
        rationale,
      },
    });
  }

  async autoAssignConsultation(consultationId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('auto_assign_consultation_intelligent', {
      p_consultation_id: consultationId,
    });

    if (error) throw error;
    return data;
  }

  async getAssignmentHistory(consultationId: string): Promise<AssignmentHistory[]> {
    const { data, error } = await supabase
      .from('assignment_history')
      .select('*')
      .eq('consultation_request_id', consultationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStaffWorkload(staffUserId: string): Promise<{
    active_count: number;
    total_assigned: number;
    max_capacity: number;
    utilization_percentage: number;
  }> {
    const { data: activeRequests, error: activeError } = await supabase
      .from('consultation_requests')
      .select('id')
      .eq('assigned_to_user_id', staffUserId)
      .in('status', ['assigned', 'unassigned']);

    if (activeError) throw activeError;

    const { data: allRequests, error: allError } = await supabase
      .from('consultation_requests')
      .select('id')
      .eq('assigned_to_user_id', staffUserId);

    if (allError) throw allError;

    const capabilities = await this.getStaffCapabilities(staffUserId);

    const activeCount = activeRequests?.length || 0;
    const totalAssigned = allRequests?.length || 0;
    const maxCapacity = capabilities?.max_active_consultations || 10;
    const utilizationPercentage = (activeCount / maxCapacity) * 100;

    return {
      active_count: activeCount,
      total_assigned: totalAssigned,
      max_capacity: maxCapacity,
      utilization_percentage: Math.round(utilizationPercentage),
    };
  }

  async getStaffPerformanceMetrics(staffUserId: string, days: number = 30): Promise<{
    total_assignments: number;
    completed_consultations: number;
    average_time_to_first_contact_hours: number;
    average_time_to_schedule_hours: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: assignments, error } = await supabase
      .from('consultation_requests')
      .select('id, status, created_at, updated_at')
      .eq('assigned_to_user_id', staffUserId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const totalAssignments = assignments?.length || 0;
    const completedConsultations =
      assignments?.filter((a) => a.status === 'scheduled' || a.status === 'closed').length || 0;

    return {
      total_assignments: totalAssignments,
      completed_consultations: completedConsultations,
      average_time_to_first_contact_hours: 0,
      average_time_to_schedule_hours: 0,
    };
  }

  async bulkAssign(
    consultationIds: string[],
    staffUserId: string,
    assignedByUserId: string
  ): Promise<void> {
    for (const consultationId of consultationIds) {
      await this.assignConsultation(
        consultationId,
        staffUserId,
        assignedByUserId,
        'manual',
        { bulk_assignment: true }
      );
    }
  }

  async reassignConsultation(
    consultationId: string,
    newStaffUserId: string,
    reassignedByUserId: string,
    reason?: string
  ): Promise<void> {
    const { data: currentRequest } = await supabase
      .from('consultation_requests')
      .select('assigned_to_user_id')
      .eq('id', consultationId)
      .single();

    await this.assignConsultation(
      consultationId,
      newStaffUserId,
      reassignedByUserId,
      'reassignment',
      {
        previous_assignee: currentRequest?.assigned_to_user_id,
        reason,
      }
    );
  }
}

export const assignmentService = new AssignmentService();
