import React, { useState, useEffect } from 'react';
import {
  Shield, Key, Lock, AlertTriangle, CheckCircle, RefreshCw,
  BarChart3, Database, Clock, Eye, EyeOff, Download, FileKey, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EncryptionKey {
  id: string;
  key_name: string;
  key_type: string;
  algorithm: string;
  purpose: string;
  created_at: string;
  rotated_at: string | null;
  is_active: boolean;
  rotation_schedule_days: number;
}

interface EncryptionStats {
  total_encrypted_records: number;
  phi_records: number;
  pii_records: number;
  financial_records: number;
  total_encryptions_24h: number;
  total_decryptions_24h: number;
  active_keys: number;
  keys_needing_rotation: number;
}

interface KeyRotationNeeded {
  key_name: string;
  days_since_rotation: number;
  rotation_schedule_days: number;
  days_overdue: number;
}

const EncryptionManager: React.FC = () => {
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [stats, setStats] = useState<EncryptionStats | null>(null);
  const [keysNeedingRotation, setKeysNeedingRotation] = useState<KeyRotationNeeded[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'audit'>('overview');
  const [showKeySetup, setShowKeySetup] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: keysData, error: keysError } = await supabase
        .from('encryption_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (keysError) throw keysError;
      setKeys(keysData || []);

      const { data: statsData, error: statsError } = await supabase
        .rpc('get_encryption_statistics');

      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      const { data: rotationData, error: rotationError } = await supabase
        .rpc('get_keys_needing_rotation');

      if (rotationError) throw rotationError;
      setKeysNeedingRotation(rotationData || []);

    } catch (error) {
      console.error('Error loading encryption data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysSinceRotation = (key: EncryptionKey) => {
    const rotationDate = key.rotated_at || key.created_at;
    const daysSince = Math.floor(
      (Date.now() - new Date(rotationDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince;
  };

  const isKeyOverdue = (key: EncryptionKey) => {
    return getDaysSinceRotation(key) > key.rotation_schedule_days;
  };

  const getKeyStatusColor = (key: EncryptionKey) => {
    if (!key.is_active) return 'gray';
    if (isKeyOverdue(key)) return 'red';
    const daysSince = getDaysSinceRotation(key);
    const percentUsed = (daysSince / key.rotation_schedule_days) * 100;
    if (percentUsed > 80) return 'yellow';
    return 'green';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="h-8 w-8 text-teal-600" />
          Encryption at Rest Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage encryption keys, monitor encrypted data, and ensure compliance with security policies
        </p>
      </div>

      {keysNeedingRotation.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {keysNeedingRotation.length} Encryption {keysNeedingRotation.length === 1 ? 'Key' : 'Keys'} Require Rotation
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {keysNeedingRotation.map(key => (
                    <li key={key.key_name}>
                      <strong>{key.key_name}</strong>: {key.days_overdue} days overdue
                      (last rotated {key.days_since_rotation} days ago)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'keys', label: 'Encryption Keys', icon: Key },
          { key: 'audit', label: 'Audit Trail', icon: Eye }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === tab.key
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Encrypted Records</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_encrypted_records.toLocaleString()}
                  </p>
                </div>
                <Database className="h-12 w-12 text-teal-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PHI Records</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.phi_records.toLocaleString()}
                  </p>
                </div>
                <Shield className="h-12 w-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Keys</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.active_keys}
                  </p>
                </div>
                <Key className="h-12 w-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Keys Need Rotation</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.keys_needing_rotation}
                  </p>
                </div>
                <AlertTriangle className="h-12 w-12 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Last 24 Hours Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">
                  {stats.total_encryptions_24h.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Encryptions</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">
                  {stats.total_decryptions_24h.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700">Decryptions</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {stats.pii_records.toLocaleString()}
                </p>
                <p className="text-sm text-purple-700">PII Records</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <FileKey className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Encryption Key Setup Required
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Encryption keys must be configured in Supabase secrets to enable encryption functionality.
                </p>
                <button
                  onClick={() => setShowKeySetup(!showKeySetup)}
                  className="text-sm text-yellow-900 font-medium hover:underline flex items-center gap-1"
                >
                  {showKeySetup ? 'Hide' : 'Show'} Setup Instructions
                  <ChevronRight className={`h-4 w-4 transition-transform ${showKeySetup ? 'rotate-90' : ''}`} />
                </button>
                {showKeySetup && (
                  <div className="mt-4 bg-white rounded p-4 text-sm text-gray-700">
                    <p className="font-semibold mb-2">Required Supabase Secrets:</p>
                    <ul className="space-y-2 font-mono text-xs">
                      <li className="bg-gray-100 p-2 rounded">
                        app.encryption_key_phi_key = [32-byte random key]
                      </li>
                      <li className="bg-gray-100 p-2 rounded">
                        app.encryption_key_pii_key = [32-byte random key]
                      </li>
                      <li className="bg-gray-100 p-2 rounded">
                        app.encryption_key_financial_key = [32-byte random key]
                      </li>
                      <li className="bg-gray-100 p-2 rounded">
                        app.encryption_key_communications_key = [32-byte random key]
                      </li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-600">
                      Generate secure random keys using: <code className="bg-gray-100 px-1">openssl rand -base64 32</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Algorithm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Rotated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keys.map(key => {
                  const statusColor = getKeyStatusColor(key);
                  const daysSince = getDaysSinceRotation(key);
                  const percentUsed = (daysSince / key.rotation_schedule_days) * 100;

                  return (
                    <tr key={key.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Key className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-mono text-sm font-medium text-gray-900">{key.key_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{key.purpose}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{key.algorithm}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {key.rotated_at ? new Date(key.rotated_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-xs text-gray-500">{daysSince} days ago</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              statusColor === 'green' ? 'bg-green-100 text-green-800' :
                              statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              statusColor === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {key.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {key.is_active && (
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  percentUsed > 100 ? 'bg-red-600' : percentUsed > 80 ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          className="text-teal-600 hover:text-teal-900 flex items-center gap-1"
                          onClick={() => alert('Key rotation requires Supabase dashboard access')}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Rotate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Encryption Audit Trail</h3>
          <p className="text-gray-600">
            Detailed audit logs showing all encryption and decryption operations are available
            in the database. Contact your database administrator for access to encryption_audit_log table.
          </p>
        </div>
      )}
    </div>
  );
};

export default EncryptionManager; 
