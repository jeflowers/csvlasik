import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Trash2, Archive, Play, Pause, Plus, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RetentionPolicy {
  id: string;
  table_name: string;
  description: string;
  retention_period_days: number;
  date_column: string;
  archive_before_delete: boolean;
  archive_storage_path: string | null;
  status: 'active' | 'paused' | 'archived';
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RetentionExecution {
  id: string;
  policy_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  records_evaluated: number;
  records_archived: number;
  records_deleted: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

interface RetentionException {
  id: string;
  table_name: string;
  record_id: number;
  reason: string;
  exemption_type: 'legal_hold' | 'active_case' | 'under_review' | 'regulatory_requirement';
  expires_at: string | null;
  created_at: string;
}

const DataRetentionManager: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [executions, setExecutions] = useState<RetentionExecution[]>([]);
  const [exceptions, setExceptions] = useState<RetentionException[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'policies' | 'executions' | 'exceptions'>('policies');
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showAddException, setShowAddException] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPolicy, setNewPolicy] = useState({
    table_name: '',
    description: '',
    retention_period_days: 365,
    date_column: 'created_at',
    archive_before_delete: true,
    status: 'active' as const
  });

  const [newException, setNewException] = useState({
    table_name: '',
    record_id: 0,
    reason: '',
    exemption_type: 'legal_hold' as const,
    expires_at: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [policiesRes, executionsRes, exceptionsRes] = await Promise.all([
        supabase.from('data_retention_policies').select('*').order('created_at', { ascending: false }),
        supabase.from('data_retention_executions').select('*').order('started_at', { ascending: false }).limit(50),
        supabase.from('data_retention_exceptions').select('*').order('created_at', { ascending: false })
      ]);

      if (policiesRes.error) throw policiesRes.error;
      if (executionsRes.error) throw executionsRes.error;
      if (exceptionsRes.error) throw exceptionsRes.error;

      setPolicies(policiesRes.data || []);
      setExecutions(executionsRes.data || []);
      setExceptions(exceptionsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load retention data');
    } finally {
      setLoading(false);
    }
  };

  const executePolicy = async (policyId: string) => {
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error: execError } = await supabase.rpc('execute_retention_policy', {
        p_policy_id: policyId,
        p_executed_by: user?.id || null
      });

      if (execError) throw execError;

      setSuccess('Retention policy executed successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute policy');
    }
  };

  const togglePolicyStatus = async (policyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error: updateError } = await supabase
        .from('data_retention_policies')
        .update({ status: newStatus })
        .eq('id', policyId);

      if (updateError) throw updateError;

      setSuccess(`Policy ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update policy status');
    }
  };

  const createPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('data_retention_policies')
        .insert({
          ...newPolicy,
          created_by: user?.id,
          next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (insertError) throw insertError;

      setSuccess('Retention policy created successfully');
      setShowAddPolicy(false);
      setNewPolicy({
        table_name: '',
        description: '',
        retention_period_days: 365,
        date_column: 'created_at',
        archive_before_delete: true,
        status: 'active'
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create policy');
    }
  };

  const createException = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.rpc('add_retention_exception', {
        p_table_name: newException.table_name,
        p_record_id: newException.record_id,
        p_reason: newException.reason,
        p_exemption_type: newException.exemption_type,
        p_expires_at: newException.expires_at || null,
        p_created_by: user?.id
      });

      if (insertError) throw insertError;

      setSuccess('Retention exception created successfully');
      setShowAddException(false);
      setNewException({
        table_name: '',
        record_id: 0,
        reason: '',
        exemption_type: 'legal_hold',
        expires_at: ''
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exception');
    }
  };

  const deleteException = async (exceptionId: string) => {
    if (!confirm('Are you sure you want to remove this retention exception?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('data_retention_exceptions')
        .delete()
        .eq('id', exceptionId);

      if (deleteError) throw deleteError;

      setSuccess('Retention exception removed successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exception');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800',
      running: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading retention policies...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-8 w-8" />
              Data Retention Management
            </h1>
            <p className="text-gray-600 mt-2">
              HIPAA, GDPR, and ISO 27001 compliant automated data retention policies
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'policies'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 inline-block mr-2" />
            Policies ({policies.length})
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'executions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Clock className="h-4 w-4 inline-block mr-2" />
            Execution History ({executions.length})
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'exceptions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline-block mr-2" />
            Exceptions ({exceptions.length})
          </button>
        </div>
      </div>

      {activeTab === 'policies' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Retention Policies</h2>
            <button
              onClick={() => setShowAddPolicy(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Policy
            </button>
          </div>

          {showAddPolicy && (
            <form onSubmit={createPolicy} className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Create New Retention Policy</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                  <input
                    type="text"
                    value={newPolicy.table_name}
                    onChange={(e) => setNewPolicy({ ...newPolicy, table_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPolicy.retention_period_days}
                    onChange={(e) => setNewPolicy({ ...newPolicy, retention_period_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newPolicy.description}
                    onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Column</label>
                  <input
                    type="text"
                    value={newPolicy.date_column}
                    onChange={(e) => setNewPolicy({ ...newPolicy, date_column: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPolicy.archive_before_delete}
                    onChange={(e) => setNewPolicy({ ...newPolicy, archive_before_delete: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Archive Before Delete</label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Policy
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPolicy(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{policy.table_name}</h3>
                      {getStatusBadge(policy.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{policy.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Retention Period:</span> {policy.retention_period_days} days
                      </div>
                      <div>
                        <span className="font-medium">Date Column:</span> {policy.date_column}
                      </div>
                      <div>
                        <span className="font-medium">Last Run:</span> {formatDate(policy.last_run_at)}
                      </div>
                      <div>
                        <span className="font-medium">Next Run:</span> {formatDate(policy.next_run_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => executePolicy(policy.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Execute Now"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => togglePolicyStatus(policy.id, policy.status)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                      title={policy.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {policy.archive_before_delete && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Archive className="h-4 w-4" />
                    Records will be archived before deletion
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'executions' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Execution History</h2>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evaluated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archived</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {executions.map((execution) => (
                  <tr key={execution.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{getStatusBadge(execution.status)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(execution.started_at)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(execution.completed_at)}</td>
                    <td className="px-4 py-3 text-sm">{execution.records_evaluated}</td>
                    <td className="px-4 py-3 text-sm">{execution.records_archived}</td>
                    <td className="px-4 py-3 text-sm">{execution.records_deleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'exceptions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Retention Exceptions</h2>
            <button
              onClick={() => setShowAddException(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Exception
            </button>
          </div>

          {showAddException && (
            <form onSubmit={createException} className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Create Retention Exception</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                  <input
                    type="text"
                    value={newException.table_name}
                    onChange={(e) => setNewException({ ...newException, table_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Record ID</label>
                  <input
                    type="number"
                    value={newException.record_id}
                    onChange={(e) => setNewException({ ...newException, record_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exception Type</label>
                  <select
                    value={newException.exemption_type}
                    onChange={(e) => setNewException({ ...newException, exemption_type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="legal_hold">Legal Hold</option>
                    <option value="active_case">Active Case</option>
                    <option value="under_review">Under Review</option>
                    <option value="regulatory_requirement">Regulatory Requirement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newException.expires_at}
                    onChange={(e) => setNewException({ ...newException, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={newException.reason}
                    onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Exception
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddException(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {exceptions.map((exception) => (
              <div key={exception.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{exception.table_name}</h3>
                      <span className="text-sm text-gray-500">Record ID: {exception.record_id}</span>
                      {getStatusBadge(exception.exemption_type)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{exception.reason}</p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Expires:</span> {formatDate(exception.expires_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteException(exception.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove Exception"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataRetentionManager;
