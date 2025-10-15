import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Lock,
  Unlock,
  Eye,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SecurityIncident {
  id: string;
  user_id: string | null;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  user?: {
    email: string;
    name: string;
  };
  resolver?: {
    name: string;
  };
}

interface SecurityStats {
  total_incidents: number;
  unresolved_incidents: number;
  critical_incidents: number;
  failed_logins_today: number;
  locked_accounts: number;
}

const SecurityDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    total_incidents: 0,
    unresolved_incidents: 0,
    critical_incidents: 0,
    failed_logins_today: 0,
    locked_accounts: 0
  });
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [incidentsResult, usersResult] = await Promise.all([
        supabase
          .from('security_incidents')
          .select(`
            *,
            user:users!security_incidents_user_id_fkey(email, name),
            resolver:users!security_incidents_resolved_by_fkey(name)
          `)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('users')
          .select('is_active, locked_until, failed_login_attempts')
      ]);

      if (incidentsResult.data) {
        setIncidents(incidentsResult.data as any);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const failedLoginsToday = incidentsResult.data.filter(
          (i: any) => i.incident_type === 'failed_login' && new Date(i.created_at) >= today
        ).length;

        setStats({
          total_incidents: incidentsResult.data.length,
          unresolved_incidents: incidentsResult.data.filter((i: any) => !i.resolved).length,
          critical_incidents: incidentsResult.data.filter(
            (i: any) => i.severity === 'critical' && !i.resolved
          ).length,
          failed_logins_today: failedLoginsToday,
          locked_accounts: usersResult.data?.filter(
            (u: any) => u.locked_until && new Date(u.locked_until) > new Date()
          ).length || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.user.email)
        .single();

      if (!userRecord) return;

      await supabase
        .from('security_incidents')
        .update({
          resolved: true,
          resolved_by: userRecord.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      fetchData();
      setSelectedIncident(null);
    } catch (error) {
      console.error('Failed to resolve incident:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return styles[severity as keyof typeof styles] || styles.medium;
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Shield className="h-4 w-4" />;
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'resolved' ? incident.resolved : !incident.resolved);
    return matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
        <p className="text-gray-600">Monitor security incidents and system access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.total_incidents}</span>
          </div>
          <p className="text-sm text-gray-600">Total Incidents</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.unresolved_incidents}</span>
          </div>
          <p className="text-sm text-gray-600">Unresolved</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.critical_incidents}</span>
          </div>
          <p className="text-sm text-gray-600">Critical</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="h-8 w-8 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.failed_logins_today}</span>
          </div>
          <p className="text-sm text-gray-600">Failed Logins Today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Lock className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.locked_accounts}</span>
          </div>
          <p className="text-sm text-gray-600">Locked Accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Security Incidents</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No incidents found
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded border flex items-center space-x-1 ${getSeverityBadge(incident.severity)}`}>
                        {getSeverityIcon(incident.severity)}
                        <span className="capitalize">{incident.severity}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {incident.incident_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {incident.user ? (
                        <div>
                          <div className="font-medium text-gray-900">{incident.user.name}</div>
                          <div className="text-gray-500">{incident.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {incident.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(incident.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {incident.resolved ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Resolved</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="text-teal-600 hover:text-teal-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIncident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Incident Details</h3>
                <span className={`inline-block mt-2 px-3 py-1 text-xs rounded border ${getSeverityBadge(selectedIncident.severity)}`}>
                  {selectedIncident.severity.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedIncident.incident_type.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedIncident.description}</p>
              </div>

              {selectedIncident.user && (
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedIncident.user.name} ({selectedIncident.user.email})
                  </p>
                </div>
              )}

              {selectedIncident.ip_address && (
                <div>
                  <label className="text-sm font-medium text-gray-700">IP Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedIncident.ip_address}</p>
                </div>
              )}

              {selectedIncident.user_agent && (
                <div>
                  <label className="text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-600 break-all">{selectedIncident.user_agent}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Time</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedIncident.created_at).toLocaleString()}
                </p>
              </div>

              {selectedIncident.resolved && (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Resolved</span>
                  </div>
                  {selectedIncident.resolver && (
                    <p className="text-sm text-green-700">By: {selectedIncident.resolver.name}</p>
                  )}
                  {selectedIncident.resolved_at && (
                    <p className="text-sm text-green-700">
                      At: {new Date(selectedIncident.resolved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!selectedIncident.resolved && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleResolveIncident(selectedIncident.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
