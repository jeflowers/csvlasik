import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { CONSENT_EVENT, ConsentPreferences, getVisitorId, readConsent } from '../lib/consent';

interface ConsentStatus {
  preferences: ConsentPreferences;
  recordedAt: string | null;
}

const CATEGORIES: (keyof ConsentPreferences)[] = ['necessary', 'analytics', 'marketing', 'personalization'];

const ConsentStatusCard: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const local = readConsent();
      let result: ConsentStatus | null = local ? { preferences: local, recordedAt: null } : null;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const identifier = user?.id || getVisitorId();
        if (identifier) {
          const { data, error } = await supabase
            .from('user_consents')
            .select('consent_preferences, created_at')
            .eq('user_identifier', identifier)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!error && data?.consent_preferences) {
            result = {
              preferences: data.consent_preferences as ConsentPreferences,
              recordedAt: data.created_at ?? null
            };
          }
        }
      } catch (error) {
        console.error('Error loading consent status:', error);
      }

      if (!cancelled) {
        setStatus(result);
        setLoading(false);
      }
    };

    load();
    window.addEventListener(CONSENT_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CONSENT_EVENT, load);
    };
  }, []);

  return (
    <div className="mt-6 rounded-lg border border-gray-200 p-6" data-testid="consent-status">
      <div className="flex items-start gap-4">
        <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-2">
            {t('consentStatus.title', 'Your Cookie Consent Status')}
          </h4>

          {loading ? (
            <p className="text-sm text-gray-500">{t('consentStatus.loading', 'Checking your consent record...')}</p>
          ) : status ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {status.recordedAt
                  ? t('consentStatus.recordedOn', 'Consent recorded on {{date}}', {
                      date: new Date(status.recordedAt).toLocaleString()
                    })
                  : t('consentStatus.savedOnDevice', 'Your choices are saved on this device.')}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {CATEGORIES.map((key) => {
                  const on = key === 'necessary' || status.preferences[key];
                  return (
                    <li key={key} className="flex items-center gap-2 text-sm">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          on ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {on ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      <span className="text-gray-800">{t(`consentStatus.categories.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}</span>
                      <span className="text-gray-500">
                        {on ? t('consentStatus.allowed', 'Allowed') : t('consentStatus.declined', 'Declined')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              {t('consentStatus.none', 'No consent recorded on this device.')}
            </p>
          )}

          <Link to="/consent-preferences" className="text-sm font-medium text-blue-600 hover:underline">
            {t('consentStatus.manage', 'Manage cookie preferences')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConsentStatusCard;
