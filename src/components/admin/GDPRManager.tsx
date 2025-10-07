import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Shield,
  Calendar
} from 'lucide-react';
import { apiService } from '../../services/api';

interface ConsentRecord {
  id: number;
  email: string;
  consent_type: string;
  consent_given: boolean;
  consent_date: string;
  ip_address: string;
  user_agent: string;
  withdrawn_date?: string;
}

interface DataRetentionPolicy {
  id: number;
  data_type: string;
  retention_period: number;
  retention_unit: 'days' | 'months' | 'years';
  auto_delete: boolean;
  last_cleanup: string;
}

const GDPRManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rights');
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([]);
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGDPRData();
  }, []);

  const fetchGDPRData = async () => {
    try {
      setLoading(true);
      const [consent, retention, requests] = await Promise.all([
        apiService.getConsentRecords(),
        apiService.getRetentionPolicies(),
        apiService.getDataSubjectRequests()
      ]);
      
      setConsentRecords(consent);
      setRetentionPolicies(retention);
      setDataRequests(requests);
    } catch (error) {
      console.error('Failed to fetch GDPR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async (email: string) => {
    try {
      const exportData = await apiService.exportUserData(email);
      
      // Create comprehensive data export
      const fullExport = {
        export_date: new Date().toISOString(),
        data_subject: email,
        data_categories: {
          personal_information: exportData.personal || {},
          testimonials: exportData.testimonials || [],
          communications: exportData.communications || [],
          system_logs: exportData.logs || []
        },
        retention_information: {
          data_collected: exportData.first_interaction,
          retention_period: '7 years (medical records)',
          deletion_date: exportData.scheduled_deletion
        }
      };
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-data-export-${email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Log the export for audit purposes
      await apiService.logDataExport(email);
    } catch (error) {
      console.error('Failed to export user data:', error);
    }
  };

  const handleRightToErasure = async (email: string, reason: string) => {
    if (confirm(`Are you sure you want to permanently delete all data for ${email}? This action cannot be undone and will be logged for compliance.`)) {
      try {
        await apiService.deleteUserData(email, {
          reason,
          legal_basis: 'GDPR Article 17 - Right to Erasure',
          retention_override: false
        });
        
        fetchGDPRData();
      } catch (error) {
        console.error('Failed to delete user data:', error);
      }
    }
  };

  const tabs = [
    { id: 'rights', name: 'Data Subject Rights', icon: User },
    { id: 'consent', name: 'Consent Management', icon: CheckCircle },
    { id: 'retention', name: 'Data Retention', icon: Clock },
    { id: 'privacy', name: 'Privacy Controls', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GDPR Compliance Manager</h1>
          <p className="text-gray-600">Manage data subject rights and privacy compliance</p>
        </div>
      </div>

      {/* GDPR Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{dataRequests.length}</div>
          <div className="text-sm text-gray-600">Active Requests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{consentRecords.filter(c => c.consent_given).length}</div>
          <div className="text-sm text-gray-600">Valid Consents</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{retentionPolicies.length}</div>
          <div className="text-sm text-gray-600">Retention Policies</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">72h</div>
          <div className="text-sm text-gray-600">Response Time</div>
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
          {activeTab === 'rights' && (
            <DataSubjectRights 
              requests={dataRequests}
              onExport={handleDataExport}
              onDelete={handleRightToErasure}
              onRefresh={fetchGDPRData}
            />
          )}
          
          {activeTab === 'consent' && (
            <ConsentManagement 
              records={consentRecords}
              onRefresh={fetchGDPRData}
            />
          )}
          
          {activeTab === 'retention' && (
            <DataRetention 
              policies={retentionPolicies}
              onRefresh={fetchGDPRData}
            />
          )}
          
          {activeTab === 'privacy' && (
            <PrivacyControls onRefresh={fetchGDPRData} />
          )}
        </div>
      </div>
    </div>
  );
};

// Data Subject Rights Component
const DataSubjectRights: React.FC<{
  requests: any[];
  onExport: (email: string) => void;
  onDelete: (email: string, reason: string) => void;
  onRefresh: () => void;
}> = ({ requests, onExport, onDelete, onRefresh }) => {
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    email: '',
    request_type: 'access' as 'access' | 'rectification' | 'erasure' | 'portability',
    notes: ''
  });

  const handleCreateRequest = async () => {
    try {
      await apiService.createDataSubjectRequest(newRequestData);
      setShowNewRequestModal(false);
      setNewRequestData({ email: '', request_type: 'access', notes: '' });
      onRefresh();
    } catch (error) {
      console.error('Failed to create data subject request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Data Subject Rights Management</h3>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          New Request
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">GDPR Article Rights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div>• Article 15: Right to Access</div>
            <div>• Article 16: Right to Rectification</div>
            <div>• Article 17: Right to Erasure</div>
          </div>
          <div className="space-y-1">
            <div>• Article 18: Right to Restriction</div>
            <div>• Article 20: Data Portability</div>
            <div>• Article 21: Right to Object</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
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
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{request.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{request.request_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(request.requested_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onExport(request.email)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Export Data"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(request.email, 'GDPR erasure request')}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Data"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Data Subject Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={newRequestData.email}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                <select
                  value={newRequestData.request_type}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, request_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="access">Right to Access (Article 15)</option>
                  <option value="rectification">Right to Rectification (Article 16)</option>
                  <option value="erasure">Right to Erasure (Article 17)</option>
                  <option value="portability">Data Portability (Article 20)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={newRequestData.notes}
                  onChange={(e) => setNewRequestData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Additional details about the request..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
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

// Consent Management Component
const ConsentManagement: React.FC<{
  records: ConsentRecord[];
  onRefresh: () => void;
}> = ({ records, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Consent Tracking</h4>
        <p className="text-sm text-green-700">
          All user consents are tracked with timestamp, IP address, and user agent for legal compliance.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consent Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Given</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{record.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.consent_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    record.consent_given ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {record.consent_given ? 'Given' : 'Withdrawn'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(record.consent_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{record.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Data Retention Component
const DataRetention: React.FC<{
  policies: DataRetentionPolicy[];
  onRefresh: () => void;
}> = ({ policies, onRefresh }) => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Data Retention Policies</h3>
        <button
          onClick={() => setShowPolicyModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Add Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{policy.data_type}</h4>
              <div className="flex items-center space-x-2">
                {policy.auto_delete ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Retention Period:</span>
                <span>{policy.retention_period} {policy.retention_unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Auto Delete:</span>
                <span className={policy.auto_delete ? 'text-green-600' : 'text-yellow-600'}>
                  {policy.auto_delete ? 'Enabled' : 'Manual'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Cleanup:</span>
                <span>{policy.last_cleanup ? new Date(policy.last_cleanup).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Privacy Controls Component
const PrivacyControls: React.FC<{
  onRefresh: () => void;
}> = ({ onRefresh }) => {
  const [privacySettings, setPrivacySettings] = useState({
    cookie_consent_required: true,
    data_minimization: true,
    purpose_limitation: true,
    storage_limitation: true,
    privacy_by_design: true
  });

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">Privacy by Design Principles</h4>
        <p className="text-sm text-purple-700">
          GDPR requires privacy to be built into systems from the ground up.
        </p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'cookie_consent_required', label: 'Cookie Consent Required', description: 'Users must consent to non-essential cookies' },
          { key: 'data_minimization', label: 'Data Minimization', description: 'Collect only necessary data' },
          { key: 'purpose_limitation', label: 'Purpose Limitation', description: 'Use data only for stated purposes' },
          { key: 'storage_limitation', label: 'Storage Limitation', description: 'Delete data when no longer needed' },
          { key: 'privacy_by_design', label: 'Privacy by Design', description: 'Privacy considerations in all development' }
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">{setting.label}</h5>
              <p className="text-sm text-gray-500">{setting.description}</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={privacySettings[setting.key as keyof typeof privacySettings]}
                onChange={(e) => setPrivacySettings(prev => ({ 
                  ...prev, 
                  [setting.key]: e.target.checked 
                }))}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-600">
                {privacySettings[setting.key as keyof typeof privacySettings] ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GDPRManager;