import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Key, 
  Shield, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { apiService } from '../../services/api';

interface EncryptionStatus {
  database: {
    encrypted: boolean;
    algorithm: string;
    keyRotationDate: string;
  };
  backups: {
    encrypted: boolean;
    location: string;
    lastBackup: string;
  };
  uploads: {
    encrypted: boolean;
    scanningEnabled: boolean;
  };
}

const EncryptionManager: React.FC = () => {
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>({
    database: { encrypted: false, algorithm: '', keyRotationDate: '' },
    backups: { encrypted: false, location: '', lastBackup: '' },
    uploads: { encrypted: false, scanningEnabled: false }
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEncryptionStatus();
  }, []);

  const fetchEncryptionStatus = async () => {
    try {
      setLoading(true);
      const status = await apiService.getEncryptionStatus();
      setEncryptionStatus(status);
    } catch (error) {
      console.error('Failed to fetch encryption status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableEncryption = async (type: 'database' | 'backups' | 'uploads') => {
    if (confirm(`Are you sure you want to enable encryption for ${type}? This process may take several minutes.`)) {
      try {
        setProcessing(true);
        await apiService.enableEncryption(type);
        fetchEncryptionStatus();
      } catch (error) {
        console.error(`Failed to enable ${type} encryption:`, error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleKeyRotation = async () => {
    if (confirm('Are you sure you want to rotate encryption keys? This will require system downtime.')) {
      try {
        setProcessing(true);
        await apiService.rotateEncryptionKeys();
        fetchEncryptionStatus();
      } catch (error) {
        console.error('Failed to rotate encryption keys:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleBackupEncryption = async () => {
    try {
      setProcessing(true);
      await apiService.createEncryptedBackup();
      fetchEncryptionStatus();
    } catch (error) {
      console.error('Failed to create encrypted backup:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encryption Management</h1>
          <p className="text-gray-600">Manage data encryption for HIPAA compliance</p>
        </div>
        <button
          onClick={fetchEncryptionStatus}
          disabled={loading}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Encryption Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Database Encryption</h3>
            <Database className={`h-6 w-6 ${encryptionStatus.database.encrypted ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span className={encryptionStatus.database.encrypted ? 'text-green-600' : 'text-red-600'}>
                {encryptionStatus.database.encrypted ? 'Encrypted' : 'Not Encrypted'}
              </span>
            </div>
            {encryptionStatus.database.encrypted && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Algorithm:</span>
                  <span className="text-gray-600">{encryptionStatus.database.algorithm}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Key Rotation:</span>
                  <span className="text-gray-600">{encryptionStatus.database.keyRotationDate}</span>
                </div>
              </>
            )}
            <button
              onClick={() => handleEnableEncryption('database')}
              disabled={encryptionStatus.database.encrypted || processing}
              className="w-full mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {encryptionStatus.database.encrypted ? 'Encryption Active' : 'Enable Encryption'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Backup Encryption</h3>
            <Shield className={`h-6 w-6 ${encryptionStatus.backups.encrypted ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span className={encryptionStatus.backups.encrypted ? 'text-green-600' : 'text-yellow-600'}>
                {encryptionStatus.backups.encrypted ? 'Encrypted' : 'Standard'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Location:</span>
              <span className="text-gray-600">{encryptionStatus.backups.location || 'Local'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Backup:</span>
              <span className="text-gray-600">{encryptionStatus.backups.lastBackup || 'Never'}</span>
            </div>
            <button
              onClick={handleBackupEncryption}
              disabled={processing}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Create Encrypted Backup
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">File Upload Security</h3>
            <Lock className={`h-6 w-6 ${encryptionStatus.uploads.scanningEnabled ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Virus Scanning:</span>
              <span className={encryptionStatus.uploads.scanningEnabled ? 'text-green-600' : 'text-yellow-600'}>
                {encryptionStatus.uploads.scanningEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>File Encryption:</span>
              <span className={encryptionStatus.uploads.encrypted ? 'text-green-600' : 'text-yellow-600'}>
                {encryptionStatus.uploads.encrypted ? 'Enabled' : 'Standard'}
              </span>
            </div>
            <button
              onClick={() => handleEnableEncryption('uploads')}
              disabled={processing}
              className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Configure Security
            </button>
          </div>
        </div>
      </div>

      {/* Key Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Encryption Key Management</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Current Keys</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Database Key</span>
                    <p className="text-xs text-gray-500">AES-256 encryption</p>
                  </div>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Backup Key</span>
                    <p className="text-xs text-gray-500">RSA-4096 encryption</p>
                  </div>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-gray-900">JWT Secret</span>
                    <p className="text-xs text-gray-500">HMAC-SHA256</p>
                  </div>
                  <span className="text-green-600">Secure</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Key Rotation</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-900">Key Rotation Required</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Encryption keys should be rotated every 90 days for optimal security.
                </p>
                <button
                  onClick={handleKeyRotation}
                  disabled={processing}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {processing ? 'Rotating Keys...' : 'Rotate Keys Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">HIPAA Encryption Checklist</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { item: 'Database encryption at rest', status: encryptionStatus.database.encrypted },
              { item: 'Backup encryption', status: encryptionStatus.backups.encrypted },
              { item: 'Transmission encryption (HTTPS)', status: true },
              { item: 'File upload security', status: encryptionStatus.uploads.scanningEnabled },
              { item: 'Key rotation procedures', status: false },
              { item: 'Access logging', status: true }
            ].map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <span className="text-sm text-gray-700">{check.item}</span>
                <div className="flex items-center">
                  {check.status ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className={`ml-2 text-sm ${check.status ? 'text-green-600' : 'text-yellow-600'}`}>
                    {check.status ? 'Compliant' : 'Needs Action'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionManager;