import React, { useState } from 'react';
import { Save, Send } from 'lucide-react';
import { useConsultationSettings } from '../../../hooks/useConsultationSettings';
import { useRingCentralConnection } from '../../../hooks/useRingCentralConnection';
import { notificationService } from '../../../services/consultation/notificationService';
import type { SchedulingMethod, RoutingMode, FailoverBehavior } from '../../../types/Consultation';

interface ConsultationSettingsProps {
  practiceId: string;
}

export const ConsultationSettings: React.FC<ConsultationSettingsProps> = ({ practiceId }) => {
  const { settings, loading, updateSettings } = useConsultationSettings();
  const { connection, isConnected, connect, disconnect } = useRingCentralConnection(practiceId);
  const [saving, setSaving] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  const handleMethodChange = async (method: SchedulingMethod) => {
    try {
      setSaving(true);
      await updateSettings({ scheduling_method: method });
    } catch (err) {
      console.error('Failed to update scheduling method:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRoutingChange = async (mode: RoutingMode) => {
    try {
      setSaving(true);
      await updateSettings({ routing_mode: mode });
    } catch (err) {
      console.error('Failed to update routing mode:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFailoverChange = async (behavior: FailoverBehavior) => {
    try {
      setSaving(true);
      await updateSettings({ failover_behavior: behavior });
    } catch (err) {
      console.error('Failed to update failover behavior:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (type: 'email' | 'sms', enabled: boolean) => {
    try {
      setSaving(true);
      if (type === 'email') {
        await updateSettings({ notification_email: enabled });
      } else {
        await updateSettings({ notification_sms: enabled });
      }
    } catch (err) {
      console.error('Failed to update notification settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setTestingNotification(true);
      const user = await fetch('/api/current-user').then((r) => r.json());
      await notificationService.sendTestNotification(
        user.email,
        user.phone,
        settings?.notification_email,
        settings?.notification_sms
      );
      alert('Test notification sent successfully!');
    } catch (err) {
      alert('Failed to send test notification');
    } finally {
      setTestingNotification(false);
    }
  };

  if (loading || !settings) {
    return <div className="animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="chopard-glass-card p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Consultation Scheduling Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Scheduling Method <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="scheduling_method"
                  value="built-in"
                  checked={settings.scheduling_method === 'built-in'}
                  onChange={() => handleMethodChange('built-in')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">Built-in Scheduler</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="scheduling_method"
                  value="ringcentral"
                  checked={settings.scheduling_method === 'ringcentral'}
                  onChange={() => handleMethodChange('ringcentral')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">RingCentral</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="scheduling_method"
                  value="hybrid"
                  checked={settings.scheduling_method === 'hybrid'}
                  onChange={() => handleMethodChange('hybrid')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">Hybrid (Choose per request)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notifications
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notification_email}
                  onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-900">Email (required)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notification_sms}
                  onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-900">SMS (optional)</span>
              </label>
            </div>
          </div>

          {(settings.scheduling_method === 'ringcentral' || settings.scheduling_method === 'hybrid') && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">RingCentral Connection</h3>
              {isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-700">
                      Connected as "{connection?.rc_account_id}"
                    </span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your RingCentral account to enable scheduling via RingCentral.
                  </p>
                  <button
                    onClick={connect}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Connect RingCentral
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Routing Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="routing_mode"
                  value="notify_all"
                  checked={settings.routing_mode === 'notify_all'}
                  onChange={() => handleRoutingChange('notify_all')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">Notify all recipients</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="routing_mode"
                  value="round_robin"
                  checked={settings.routing_mode === 'round_robin'}
                  onChange={() => handleRoutingChange('round_robin')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">Round-robin (one at a time)</span>
              </label>
            </div>
          </div>

          {(settings.scheduling_method === 'ringcentral' || settings.scheduling_method === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Failover Behavior (RingCentral/Hybrid only)
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="failover_behavior"
                    value="auto_builtin"
                    checked={settings.failover_behavior === 'auto_builtin'}
                    onChange={() => handleFailoverChange('auto_builtin')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900">Use Built-in Scheduler automatically</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="failover_behavior"
                    value="hold_alert"
                    checked={settings.failover_behavior === 'hold_alert'}
                    onChange={() => handleFailoverChange('hold_alert')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900">Hold and alert Admin</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleTestNotification}
              disabled={testingNotification}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Test Notification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
