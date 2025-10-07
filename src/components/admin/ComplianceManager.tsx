import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Database, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Globe,
  Key
} from 'lucide-react';
import { apiService } from '../../services/api';

interface AuditLogEntry {
  id: number;
  user_id: number;
  username: string;
  action: string;
  resource_type: string;
  resource_id: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  phi_accessed: boolean;
  gdpr_relevant: boolean;
}

interface DataSubjectRequest {
  id: number;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability';
  email: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  completed_at?: string;
  notes: string;
}

const ComplianceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hipaa');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const [logs, requests, status] = await Promise.all([
        apiService.getAuditLogs(),
        apiService.getDataSubjectRequests(),
        apiService.getComplianceStatus()
      ]);
      
      setAuditLogs(logs);
      setDataRequests(requests);
      setComplianceStatus(status);
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async (email: string) => {
    try {
      const exportData = await apiService.exportUserData(email);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export user data:', error);
    }
  };

  const handleDataDeletion = async (email: string, reason: string) => {
    if (confirm(`Are you sure you want to permanently delete all data for ${email}? This action cannot be undone.`)) {
      try {
        await apiService.deleteUserData(email, reason);
        fetchComplianceData();
      } catch (error) {
        console.error('Failed to delete user data:', error);
      }
    }
  };

  const tabs = [
    { id: 'hipaa', name: 'HIPAA', icon: Shield },
    { id: 'gdpr', name: 'GDPR', icon: Globe },
    { id: 'iso27001', name: 'ISO 27001', icon: Lock },
    { id: 'audit', name: 'Audit Logs', icon: FileText },
    { id: 'requests', name: 'Data Requests', icon: User }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600">HIPAA, GDPR, and ISO 27001 compliance monitoring and management</p>
        </div>
      </div>

      {/* Compliance Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">HIPAA Status</h3>
            <Shield className={`h-6 w-6 ${complianceStatus.hipaa?.compliant ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Audit Logging:</span>
              <span className="text-green-600">✓ Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Data Encryption:</span>
              <span className="text-yellow-600">⚠ Partial</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Access Controls:</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>BAAs in Place:</span>
              <span className="text-red-600">✗ Missing</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">GDPR Status</h3>
            <Globe className={`h-6 w-6 ${complianceStatus.gdpr?.compliant ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Data Subject Rights:</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Consent Management:</span>
              <span className="text-yellow-600">⚠ Basic</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Data Retention:</span>
              <span className="text-yellow-600">⚠ Manual</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Privacy Policy:</span>
              <span className="text-red-600">✗ Missing</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">ISO 27001 Status</h3>
            <Lock className={`h-6 w-6 ${complianceStatus.iso27001?.compliant ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Security Controls:</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Risk Management:</span>
              <span className="text-yellow-600">⚠ Basic</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ISMS Documentation:</span>
              <span className="text-red-600">✗ Missing</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Management Review:</span>
              <span className="text-red-600">✗ Missing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'hipaa' && (
            <HIPAACompliance 
              auditLogs={auditLogs}
              onRefresh={fetchComplianceData}
            />
          )}
          
          {activeTab === 'gdpr' && (
            <GDPRCompliance 
              dataRequests={dataRequests}
              onExport={handleDataExport}
              onDelete={handleDataDeletion}
              onRefresh={fetchComplianceData}
            />
          )}
          
          {activeTab === 'iso27001' && (
            <ISO27001Compliance 
              status={complianceStatus.iso27001}
              onRefresh={fetchComplianceData}
            />
          )}
          
          {activeTab === 'audit' && (
            <AuditLogsView 
              logs={auditLogs}
              onRefresh={fetchComplianceData}
            />
          )}
          
          {activeTab === 'requests' && (
            <DataRequestsView 
              requests={dataRequests}
              onExport={handleDataExport}
              onDelete={handleDataDeletion}
              onRefresh={fetchComplianceData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// HIPAA Compliance Component
const HIPAACompliance: React.FC<{
  auditLogs: AuditLogEntry[];
  onRefresh: () => void;
}> = ({ auditLogs, onRefresh }) => {
  const phiAccessLogs = auditLogs.filter(log => log.phi_accessed);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">HIPAA Technical Safeguards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Access Control:</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex justify-between">
              <span>Audit Controls:</span>
              <span className="text-green-600">✓ Active</span>
            </div>
            <div className="flex justify-between">
              <span>Integrity:</span>
              <span className="text-green-600">✓ Protected</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Authentication:</span>
              <span className="text-green-600">✓ Verified</span>
            </div>
            <div className="flex justify-between">
              <span>Transmission Security:</span>
              <span className="text-green-600">✓ Encrypted</span>
            </div>
            <div className="flex justify-between">
              <span>Encryption at Rest:</span>
              <span className="text-yellow-600">⚠ Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Recent PHI Access Events</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {phiAccessLogs.slice(0, 10).map((log) => (
            <div key={log.id} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {log.username} accessed {log.resource_type} #{log.resource_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()} • IP: {log.ip_address}
                  </p>
                </div>
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// GDPR Compliance Component
const GDPRCompliance: React.FC<{
  dataRequests: DataSubjectRequest[];
  onExport: (email: string) => void;
  onDelete: (email: string, reason: string) => void;
  onRefresh: () => void;
}> = ({ dataRequests, onExport, onDelete, onRefresh }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestType, setRequestType] = useState<'access' | 'rectification' | 'erasure' | 'portability'>('access');

  const handleSubmitRequest = async () => {
    try {
      await apiService.createDataSubjectRequest({
        email: requestEmail,
        request_type: requestType
      });
      setShowRequestModal(false);
      setRequestEmail('');
      onRefresh();
    } catch (error) {
      console.error('Failed to create data subject request:', error);
    }
  };

  const getRequestStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">GDPR Data Subject Rights</h3>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          New Data Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { type: 'access', label: 'Right to Access', count: dataRequests.filter(r => r.request_type === 'access').length },
          { type: 'rectification', label: 'Right to Rectification', count: dataRequests.filter(r => r.request_type === 'rectification').length },
          { type: 'erasure', label: 'Right to Erasure', count: dataRequests.filter(r => r.request_type === 'erasure').length },
          { type: 'portability', label: 'Data Portability', count: dataRequests.filter(r => r.request_type === 'portability').length }
        ].map((stat) => (
          <div key={stat.type} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Data Subject Requests</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dataRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">{request.request_type}</td>
                  <td className="px-6 py-4">{getRequestStatusBadge(request.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {request.request_type === 'access' && (
                        <button
                          onClick={() => onExport(request.email)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Export Data"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {request.request_type === 'erasure' && (
                        <button
                          onClick={() => onDelete(request.email, 'GDPR erasure request')}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Data"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Data Subject Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="access">Right to Access</option>
                  <option value="rectification">Right to Rectification</option>
                  <option value="erasure">Right to Erasure</option>
                  <option value="portability">Data Portability</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ISO 27001 Compliance Component
const ISO27001Compliance: React.FC<{
  status: any;
  onRefresh: () => void;
}> = ({ status, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-medium text-purple-900 mb-2">Information Security Management System</h3>
        <p className="text-sm text-purple-700">
          ISO 27001 requires a systematic approach to managing sensitive information and security risks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Security Controls Status</h4>
          {[
            { control: 'A.9.1.1 Access Control Policy', status: 'implemented' },
            { control: 'A.9.2.1 User Registration', status: 'implemented' },
            { control: 'A.9.4.2 Secure Log-on', status: 'implemented' },
            { control: 'A.12.6.1 Management of Vulnerabilities', status: 'partial' },
            { control: 'A.13.1.1 Network Controls', status: 'implemented' },
            { control: 'A.14.1.3 Protecting Application Services', status: 'implemented' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{item.control}</span>
              <span className={`px-2 py-1 text-xs rounded ${
                item.status === 'implemented' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Risk Assessment</h4>
          <div className="space-y-3">
            {[
              { risk: 'Unauthorized Access', level: 'Low', mitigation: 'Multi-factor authentication' },
              { risk: 'Data Breach', level: 'Medium', mitigation: 'Encryption and monitoring' },
              { risk: 'Service Disruption', level: 'Low', mitigation: 'Backup systems' }
            ].map((risk, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">{risk.risk}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    risk.level === 'Low' ? 'bg-green-100 text-green-800' : 
                    risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {risk.level}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Audit Logs View Component
const AuditLogsView: React.FC<{
  logs: AuditLogEntry[];
  onRefresh: () => void;
}> = ({ logs, onRefresh }) => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.action.toLowerCase().includes(filterType);
    const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{log.username}</span>
                    <span className="text-sm text-gray-500">{log.action}</span>
                    <span className="text-sm text-gray-500">{log.resource_type}</span>
                    {log.phi_accessed && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">PHI</span>
                    )}
                    {log.gdpr_relevant && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">GDPR</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(log.created_at).toLocaleString()} • IP: {log.ip_address}
                  </div>
                  {log.details && (
                    <div className="text-xs text-gray-600 mt-1">{log.details}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Data Requests View Component
const DataRequestsView: React.FC<{
  requests: DataSubjectRequest[];
  onExport: (email: string) => void;
  onDelete: (email: string, reason: string) => void;
  onRefresh: () => void;
}> = ({ requests, onExport, onDelete, onRefresh }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{request.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{request.request_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(request.requested_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {request.request_type === 'access' && (
                      <button
                        onClick={() => onExport(request.email)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Export Data"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    {request.request_type === 'erasure' && (
                      <button
                        onClick={() => onDelete(request.email, 'GDPR erasure request')}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Data"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceManager;