import { useState, useEffect } from 'react';
import { hipaaAuditService, type AuditMetrics, type HIPAAAuditEvent, type SecurityAuditEvent, type SuspiciousPattern } from '../../services/hipaaAuditService';
import { Shield, AlertTriangle, Activity, Users, FileText, Eye, Download, Search, Calendar } from 'lucide-react';

export default function HIPAAAuditDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null);
  const [phiAccesses, setPhiAccesses] = useState<HIPAAAuditEvent[]>([]);
  const [emergencyAccesses, setEmergencyAccesses] = useState<HIPAAAuditEvent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityAuditEvent[]>([]);
  const [suspiciousPatterns, setSuspiciousPatterns] = useState<SuspiciousPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [patternsExpanded, setPatternsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        metricsData,
        phiData,
        emergencyData,
        securityData,
        suspiciousData
      ] = await Promise.all([
        hipaaAuditService.getHIPAAMetrics(dateRange.start, dateRange.end),
        hipaaAuditService.getHIPAAAuditEvents(dateRange.start, dateRange.end, 50),
        hipaaAuditService.getEmergencyAccesses(dateRange.start, dateRange.end),
        hipaaAuditService.getSecurityAuditEvents(50),
        hipaaAuditService.detectSuspiciousPatterns(24)
      ]);

      setMetrics(metricsData);
      setPhiAccesses(phiData);
      setEmergencyAccesses(emergencyData);
      setSecurityEvents(securityData);
      setSuspiciousPatterns(suspiciousData);
    } catch (error) {
      console.error('Error loading HIPAA audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleExportReport = async () => {
    try {
      await hipaaAuditService.generateComplianceReport(
        'hipaa_audit_trail',
        `HIPAA Audit Report ${dateRange.start} to ${dateRange.end}`,
        dateRange.start,
        dateRange.end
      );
      alert('Report generation started. Check the Compliance Reports section.');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HIPAA audit data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 px-4 sm:px-6 lg:px-8 pt-6 pb-4 bg-gray-50/95 backdrop-blur border-b border-gray-200 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-teal-600" />
            HIPAA Audit Controls
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive PHI access tracking and compliance monitoring</p>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border-0 focus:ring-0 p-0"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border-0 focus:ring-0 p-0"
            />
          </div>

          <button
            onClick={handleExportReport}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total PHI Accesses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.total_phi_accesses}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.avg_accesses_per_day.toFixed(1)}/day avg
                </p>
              </div>
              <Eye className="w-12 h-12 text-teal-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.unique_users_accessed_phi}
                </p>
                <p className="text-sm text-gray-500 mt-1">accessed PHI</p>
              </div>
              <Users className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emergency Accesses</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {metrics.emergency_accesses}
                </p>
                <p className="text-sm text-gray-500 mt-1">break-glass events</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className={`text-3xl font-bold mt-2 ${getComplianceColor(metrics.compliance_score)}`}>
                  {metrics.compliance_score.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.non_compliant_accesses} non-compliant
                </p>
              </div>
              <Shield className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {suspiciousPatterns.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-red-900">Suspicious Activity Detected</h3>
                  <p className="text-sm text-red-700 mt-0.5">
                    {suspiciousPatterns.length} pattern{suspiciousPatterns.length === 1 ? '' : 's'} flagged in the last 24 hours
                  </p>
                </div>
                <button
                  onClick={() => setPatternsExpanded(!patternsExpanded)}
                  className="text-sm font-medium text-red-700 hover:text-red-900 whitespace-nowrap"
                >
                  {patternsExpanded ? 'Hide patterns' : 'Review patterns →'}
                </button>
              </div>
              {patternsExpanded && (
                <div className="mt-3 space-y-2">
                  {suspiciousPatterns.map((pattern, idx) => (
                    <div key={idx} className="bg-white rounded p-3 border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-red-900">{pattern.username}</p>
                          <p className="text-sm text-gray-600">
                            {pattern.suspicious_pattern.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(pattern.risk_level)}`}>
                          {pattern.risk_level.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {pattern.event_count} events detected
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'phi-access', label: 'PHI Access Log', icon: Eye },
              { id: 'emergency', label: 'Emergency Access', icon: AlertTriangle },
              { id: 'security', label: 'Security Events', icon: Shield },
              { id: 'search', label: 'Audit Search', icon: Search }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent PHI Access Activity</h3>
                <div className="space-y-3">
                  {phiAccesses.slice(0, 10).map((access) => (
                    <div key={access.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              access.is_emergency_access ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {access.event_type}
                            </span>
                            {!access.hipaa_compliant && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Non-Compliant
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            Purpose: {access.purpose_of_use}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Tables: {access.phi_tables_accessed.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Records: {access.record_count}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(access.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phi-access' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete PHI Access Log</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tables
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {phiAccesses.map((access) => (
                      <tr
                        key={access.id}
                        className={`hover:bg-gray-50 ${
                          !access.hipaa_compliant
                            ? 'bg-red-50'
                            : access.is_emergency_access
                            ? 'bg-orange-50'
                            : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(access.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium font-mono ${
                            access.is_emergency_access ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {access.event_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {access.purpose_of_use}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {access.phi_tables_accessed.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {access.record_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {access.hipaa_compliant ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Compliant
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Review Required
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Emergency Access (Break-Glass) Events
              </h3>
              {emergencyAccesses.length > 0 ? (
                <div className="space-y-4">
                  {emergencyAccesses.map((access) => (
                    <div key={access.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-red-900">
                              Emergency PHI Access
                            </p>
                            <span className="text-sm text-red-600">
                              {new Date(access.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-medium">Justification:</span> {access.emergency_justification}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Tables Accessed:</span> {access.phi_tables_accessed.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Records:</span> {access.record_count}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No emergency access events in the selected date range
                </p>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Audit Events</h3>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.risk_level)}`}>
                            {event.risk_level.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                          {!event.reviewed && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Needs Review
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          User: {event.username || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Audit Search</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Type
                    </label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                      <option value="">All Actions</option>
                      <option value="phi_access">PHI Access</option>
                      <option value="phi_create">PHI Create</option>
                      <option value="phi_update">PHI Update</option>
                      <option value="phi_delete">PHI Delete</option>
                      <option value="phi_export">PHI Export</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                      <option value="">All Severities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PHI Only
                    </label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                      <option value="false">All Records</option>
                      <option value="true">PHI Access Only</option>
                    </select>
                  </div>
                </div>
                <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Audit Logs
                </button>
              </div>
              <p className="text-gray-600 text-center py-8">
                Configure search parameters and click Search to view results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
