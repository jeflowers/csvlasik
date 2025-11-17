import React, { useState, useEffect } from 'react';
import {
  Cookie, Shield, Download, Bell, Calendar, BarChart3,
  Check, X, ChevronRight, Settings, Info, ExternalLink, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Cookies from 'js-cookie';

interface CookiePreference {
  cookie_id: string;
  cookie_name: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: string;
  category_name: string;
  is_enabled: boolean;
  override_category: boolean;
}

const ConsentPreferencesCenter: React.FC = () => {
  const [userIdentifier, setUserIdentifier] = useState<string>('');
  const [consentDetails, setConsentDetails] = useState<any>(null);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreference[]>([]);
  const [notifications, setNotifications] = useState<any>({
    notify_policy_changes: true,
    notify_before_expiry: true,
    notify_data_usage: false,
    notification_frequency: 'immediate'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'cookies' | 'schedule' | 'export' | 'analytics'>('preferences');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userId = Cookies.get('user_id');
      if (!userId) {
        setError('No consent record found');
        setLoading(false);
        return;
      }

      setUserIdentifier(userId);

      // Load consent details
      const { data: detailsData, error: detailsError } = await supabase
        .rpc('get_user_consent_details', { p_user_identifier: userId });

      if (detailsError) throw detailsError;
      if (detailsData && detailsData.length > 0) {
        setConsentDetails(detailsData[0]);
      }

      // Load cookie preferences
      const { data: cookiesData, error: cookiesError } = await supabase
        .from('consent_cookies')
        .select(`
          id,
          cookie_name,
          provider,
          purpose,
          expiry,
          type,
          consent_categories(category_name)
        `)
        .eq('active', true);

      if (cookiesError) throw cookiesError;

      // Load user's specific cookie preferences
      const { data: userConsents } = await supabase
        .from('user_consents')
        .select('id')
        .eq('user_identifier', userId)
        .eq('is_active', true)
        .single();

      if (userConsents) {
        const { data: userCookiePrefs } = await supabase
          .from('user_cookie_preferences')
          .select('*')
          .eq('user_consent_id', userConsents.id);

        const cookiePrefsMap = new Map(
          (userCookiePrefs || []).map(p => [p.cookie_id, p])
        );

        const enrichedCookies = (cookiesData || []).map((cookie: any) => ({
          cookie_id: cookie.id,
          cookie_name: cookie.cookie_name,
          provider: cookie.provider,
          purpose: cookie.purpose,
          expiry: cookie.expiry,
          type: cookie.type,
          category_name: cookie.consent_categories?.category_name || 'Unknown',
          is_enabled: cookiePrefsMap.get(cookie.id)?.is_enabled ?? true,
          override_category: cookiePrefsMap.get(cookie.id)?.override_category ?? false
        }));

        setCookiePreferences(enrichedCookies);
      }

      // Load notification preferences
      const { data: notifData } = await supabase
        .from('consent_notifications')
        .select('*')
        .eq('user_identifier', userId)
        .single();

      if (notifData) {
        setNotifications(notifData);
      }

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load consent data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCookiePreference = async (cookieId: string) => {
    const updatedPrefs = cookiePreferences.map(pref =>
      pref.cookie_id === cookieId
        ? { ...pref, is_enabled: !pref.is_enabled, override_category: true }
        : pref
    );
    setCookiePreferences(updatedPrefs);
  };

  const saveCookiePreferences = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: userConsents } = await supabase
        .from('user_consents')
        .select('id')
        .eq('user_identifier', userIdentifier)
        .eq('is_active', true)
        .single();

      if (!userConsents) throw new Error('No active consent found');

      // Delete existing preferences
      await supabase
        .from('user_cookie_preferences')
        .delete()
        .eq('user_consent_id', userConsents.id);

      // Insert new preferences
      const prefsToInsert = cookiePreferences
        .filter(p => p.override_category)
        .map(pref => ({
          user_consent_id: userConsents.id,
          cookie_id: pref.cookie_id,
          is_enabled: pref.is_enabled,
          override_category: true
        }));

      if (prefsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('user_cookie_preferences')
          .insert(prefsToInsert);

        if (insertError) throw insertError;
      }

      // Log analytics event
      await supabase.from('consent_analytics_events').insert({
        user_identifier: userIdentifier,
        event_type: 'cookie_toggled',
        event_data: { modified_cookies: prefsToInsert.length }
      });

      setSuccess('Cookie preferences saved successfully');
      await loadUserData();
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationPreferences = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: upsertError } = await supabase
        .from('consent_notifications')
        .upsert({
          user_identifier: userIdentifier,
          ...notifications
        });

      if (upsertError) throw upsertError;

      setSuccess('Notification preferences saved');
    } catch (err) {
      console.error('Error saving notifications:', err);
      setError('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const requestDataExport = async (format: 'json' | 'csv' | 'pdf') => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertError } = await supabase
        .from('consent_data_exports')
        .insert({
          user_identifier: userIdentifier,
          export_type: 'full',
          export_format: format,
          status: 'requested'
        });

      if (insertError) throw insertError;

      // Log analytics event
      await supabase.from('consent_analytics_events').insert({
        user_identifier: userIdentifier,
        event_type: 'export_requested',
        event_data: { format }
      });

      setSuccess(`Export requested in ${format.toUpperCase()} format. You will receive a download link once processing is complete.`);
    } catch (err) {
      console.error('Error requesting export:', err);
      setError('Failed to request data export');
    } finally {
      setSaving(false);
    }
  };

  const withdrawConsent = async () => {
    if (!confirm('Are you sure you want to withdraw your consent? This cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('user_consents')
        .update({
          is_active: false,
          withdrawal_timestamp: new Date().toISOString()
        })
        .eq('user_identifier', userIdentifier)
        .eq('is_active', true);

      if (updateError) throw updateError;

      // Log analytics event
      await supabase.from('consent_analytics_events').insert({
        user_identifier: userIdentifier,
        event_type: 'withdraw_initiated'
      });

      setSuccess('Consent withdrawn successfully. You will need to provide consent again to use this site.');

      // Clear consent cookie
      Cookies.remove('gdpr_consent');

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error withdrawing consent:', err);
      setError('Failed to withdraw consent');
    } finally {
      setSaving(false);
    }
  };

  const groupCookiesByCategory = () => {
    const grouped = new Map<string, CookiePreference[]>();
    cookiePreferences.forEach(cookie => {
      const category = cookie.category_name;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(cookie);
    });
    return grouped;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading preferences...</div>;
  }

  const groupedCookies = groupCookiesByCategory();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-teal-600" />
            Privacy & Consent Center
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your cookie preferences, consent settings, and data privacy
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Consent Overview Card */}
        {consentDetails && (
          <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Your Consent Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Consent Given</p>
                <p className="font-medium text-gray-900">
                  {new Date(consentDetails.consent_timestamp).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Policy Version</p>
                <p className="font-medium text-gray-900">{consentDetails.consent_version}</p>
              </div>
              {consentDetails.expiry_date && (
                <div>
                  <p className="text-gray-600">Expires</p>
                  <p className="font-medium text-gray-900">
                    {new Date(consentDetails.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'preferences', label: 'Category Preferences', icon: Shield },
            { key: 'cookies', label: 'Cookie Controls', icon: Cookie },
            { key: 'schedule', label: 'Schedule & Expiry', icon: Calendar },
            { key: 'export', label: 'Export Data', icon: Download },
            { key: 'analytics', label: 'My Activity', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          {/* Category Preferences Tab */}
          {activeTab === 'preferences' && consentDetails && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Category-Based Preferences</h3>
              <p className="text-sm text-gray-600 mb-6">
                These are your current category-level consent preferences. For more granular control, use the Cookie Controls tab.
              </p>
              <div className="space-y-4">
                {Object.entries(consentDetails.category_preferences || {}).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-600">
                        {enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cookie Controls Tab */}
          {activeTab === 'cookies' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Ultra-Granular Cookie Controls</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable or disable individual cookies. Changes override category settings.
                  </p>
                </div>
                <button
                  onClick={saveCookiePreferences}
                  disabled={saving}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {Array.from(groupedCookies.entries()).map(([category, cookies]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                    {category}
                  </h4>
                  <div className="space-y-3">
                    {cookies.map(cookie => (
                      <div key={cookie.cookie_id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">{cookie.cookie_name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              cookie.type === 'first_party'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {cookie.type === 'first_party' ? '1st Party' : '3rd Party'}
                            </span>
                            {cookie.override_category && (
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Provider:</strong> {cookie.provider} | <strong>Expires:</strong> {cookie.expiry}
                          </p>
                          <p className="text-xs text-gray-600">{cookie.purpose}</p>
                        </div>
                        <label className="ml-4 relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cookie.is_enabled}
                            onChange={() => toggleCookiePreference(cookie.cookie_id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule & Expiry Tab */}
          {activeTab === 'schedule' && consentDetails && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Consent Schedule & Expiry</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Next Review Date
                  </h4>
                  <p className="text-blue-800">
                    {consentDetails.next_review_date
                      ? new Date(consentDetails.next_review_date).toLocaleDateString()
                      : 'Not scheduled'}
                  </p>
                </div>

                {consentDetails.expiry_date && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Consent Expiry
                    </h4>
                    <p className="text-yellow-800">
                      Your consent will expire on {new Date(consentDetails.expiry_date).toLocaleDateString()}.
                      You will need to review and renew your consent before this date.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Notification Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="text-sm">Notify me of policy changes</span>
                      <input
                        type="checkbox"
                        checked={notifications.notify_policy_changes}
                        onChange={(e) => setNotifications({...notifications, notify_policy_changes: e.target.checked})}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="text-sm">Remind me before consent expires</span>
                      <input
                        type="checkbox"
                        checked={notifications.notify_before_expiry}
                        onChange={(e) => setNotifications({...notifications, notify_before_expiry: e.target.checked})}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="text-sm">Send me data usage reports</span>
                      <input
                        type="checkbox"
                        checked={notifications.notify_data_usage}
                        onChange={(e) => setNotifications({...notifications, notify_data_usage: e.target.checked})}
                        className="rounded"
                      />
                    </label>
                  </div>
                  <button
                    onClick={saveNotificationPreferences}
                    disabled={saving}
                    className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Notification Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export Data Tab */}
          {activeTab === 'export' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Export Your Data (GDPR Article 20)</h3>
              <p className="text-gray-600 mb-6">
                Download a complete copy of your consent data, including preferences, audit history, and cookie settings.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {(['json', 'csv', 'pdf'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => requestDataExport(format)}
                    disabled={saving}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-all text-center disabled:opacity-50"
                  >
                    <Download className="h-8 w-8 mx-auto mb-3 text-teal-600" />
                    <h4 className="font-semibold mb-1">{format.toUpperCase()} Format</h4>
                    <p className="text-xs text-gray-600">
                      {format === 'json' && 'Machine-readable format'}
                      {format === 'csv' && 'Spreadsheet format'}
                      {format === 'pdf' && 'Human-readable document'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-red-900 mb-3">Withdraw Consent</h4>
                <p className="text-sm text-gray-600 mb-4">
                  You have the right to withdraw your consent at any time. This will disable all non-essential cookies and remove your consent preferences.
                </p>
                <button
                  onClick={withdrawConsent}
                  disabled={saving}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {saving ? 'Processing...' : 'Withdraw All Consent'}
                </button>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Privacy Activity</h3>
              <p className="text-gray-600 mb-6">
                View your consent interaction history and understand how your preferences have been used.
              </p>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>Activity analytics coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentPreferencesCenter;
