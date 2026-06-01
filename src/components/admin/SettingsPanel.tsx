import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Globe, 
  Database, 
  Bell,
  Save,
  RefreshCw,
  Key,
  Lock,
  Server,
  Mail,
  Smartphone
} from 'lucide-react';
import { apiService } from '../../services/api';

interface SystemSettings {
  site_name: string;
  site_description: string;
  admin_email: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_upload_size: number;
  session_timeout: number;
  backup_frequency: string;
  email_notifications: boolean;
  security_alerts: boolean;
}

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'Atelier CMS',
    site_description: 'Revolutionary Vision Care Content Management',
    admin_email: 'admin@atelierlasik.com',
    maintenance_mode: false,
    registration_enabled: false,
    max_upload_size: 50,
    session_timeout: 24,
    backup_frequency: 'daily',
    email_notifications: true,
    security_alerts: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [systemInfo, setSystemInfo] = useState<any>({});

  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from API
      // const data = await apiService.getSettings();
      // setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // await apiService.updateSettings(settings);
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'translation', name: 'Translation', icon: Globe },
    { id: 'system', name: 'System', icon: Server },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2 inline" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => setSettings(prev => ({ ...prev, admin_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  rows={3}
                  value={settings.site_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={(e) => setSettings(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700">Maintenance Mode</span>
                  <span className="ml-2 text-xs text-gray-500">(disables public access)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.registration_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, registration_enabled: e.target.checked }))}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700">User Registration</span>
                  <span className="ml-2 text-xs text-gray-500">(allow new user signups)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.session_timeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.max_upload_size}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_upload_size: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Lock className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="font-medium text-yellow-900">Security Status</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>JWT Secret:</span>
                    <span className={systemInfo.security?.jwtConfigured ? 'text-green-600' : 'text-red-600'}>
                      {systemInfo.security?.jwtConfigured ? 'Configured' : 'Default (Insecure)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>HTTPS Enforced:</span>
                    <span className={systemInfo.security?.httpsEnforced ? 'text-green-600' : 'text-yellow-600'}>
                      {systemInfo.security?.httpsEnforced ? 'Yes' : 'Development Mode'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate Limiting:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security_alerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, security_alerts: e.target.checked }))}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700">Security Alerts</span>
                  <span className="ml-2 text-xs text-gray-500">(email notifications for security events)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'translation' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Translation Services</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Configure API keys in your environment variables for dynamic translation
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>DeepL API:</span>
                    <span className="text-gray-600">Configure in .env</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Google Translate:</span>
                    <span className="text-gray-600">Configure in .env</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Supported Languages</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                    { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
                    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
                    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
                    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
                    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
                    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
                    { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
                    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
                    { code: 'hy', name: 'Armenian', flag: '🇦🇲' }
                  ].map(lang => (
                    <div key={lang.code} className="flex items-center p-2 bg-gray-50 rounded">
                      <span className="mr-2">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    System Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600">{systemInfo.status || 'OK'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <span>{systemInfo.environment || 'development'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{systemInfo.uptime ? Math.floor(systemInfo.uptime / 3600) + 'h' : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span>{systemInfo.version || '1.0.0'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>SQLite</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>~2.5 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Backup:</span>
                      <span>Today</span>
                    </div>
                  </div>
                  <button className="mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200">
                    Create Backup
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={settings.backup_frequency}
                  onChange={(e) => setSettings(prev => ({ ...prev, backup_frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                      className="rounded border-gray-300 mr-2"
                    />
                    <div>
                      <span className="text-sm text-gray-700">Email Notifications</span>
                      <p className="text-xs text-gray-500">Receive email alerts for important events</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security_alerts}
                      onChange={(e) => setSettings(prev => ({ ...prev, security_alerts: e.target.checked }))}
                      className="rounded border-gray-300 mr-2"
                    />
                    <div>
                      <span className="text-sm text-gray-700">Security Alerts</span>
                      <p className="text-xs text-gray-500">Immediate notifications for security events</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-900 mb-2">Notification Types</h5>
                <div className="space-y-2 text-sm text-yellow-800">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>New testimonial submissions</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Security incidents and failed logins</span>
                  </div>
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    <span>System errors and backup failures</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Translation service issues</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Health Dashboard */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
            <button
              onClick={fetchSystemInfo}
              className="text-teal-600 hover:text-teal-900"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600 mt-1">API Status</div>
              <div className="text-xs text-green-600">Healthy</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {systemInfo.security?.rateLimitActive ? '✓' : '⚠'}
              </div>
              <div className="text-sm text-gray-600 mt-1">Security</div>
              <div className="text-xs text-blue-600">Protected</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">11</div>
              <div className="text-sm text-gray-600 mt-1">Languages</div>
              <div className="text-xs text-purple-600">Supported</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor((systemInfo.uptime || 0) / 86400)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Days</div>
              <div className="text-xs text-orange-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;