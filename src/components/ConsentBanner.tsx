import React, { useState, useEffect } from 'react';
import { Cookie, Settings, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const ConsentBanner: React.FC = () => {
  const { t, i18n } = useTranslation(['cookies', 'common']);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = Cookies.get('gdpr_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (error) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    
    saveConsent(allConsent);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    
    saveConsent(necessaryOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowPreferences(false);
  };

  const saveConsent = (consentData: ConsentPreferences) => {
    // Save to cookies
    Cookies.set('gdpr_consent', JSON.stringify(consentData), { 
      expires: 365, // 1 year
      secure: window.location.protocol === 'https:',
      sameSite: 'strict'
    });
    
    // Log consent for compliance
    logConsent(consentData);
    
    setShowBanner(false);
    setPreferences(consentData);
  };

  const logConsent = async (consentData: ConsentPreferences) => {
    try {
      await fetch('/api/compliance/log-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consent_data: consentData,
          language: i18n.language,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to log consent:', error);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <Cookie className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('banner.title')}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t('banner.description')}
                  <a href="/privacy-policy" className="text-teal-600 hover:text-teal-700 underline ml-1">
                    {t('banner.learnMore')}
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-4">
              <button
                onClick={() => setShowPreferences(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('banner.preferences')}
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('banner.necessaryOnly')}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                {t('banner.acceptAll')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">{t('preferences.title')}</h3>
              <button 
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  {t('preferences.description')}
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'necessary',
                    title: t('preferences.categories.necessary.title'),
                    description: t('preferences.categories.necessary.description'),
                    required: true
                  },
                  {
                    key: 'analytics',
                    title: t('preferences.categories.analytics.title'),
                    description: t('preferences.categories.analytics.description'),
                    required: false
                  },
                  {
                    key: 'marketing',
                    title: t('preferences.categories.marketing.title'),
                    description: t('preferences.categories.marketing.description'),
                    required: false
                  },
                  {
                    key: 'personalization',
                    title: t('preferences.categories.personalization.title'),
                    description: t('preferences.categories.personalization.description'),
                    required: false
                  }
                ].map((category) => (
                  <div key={category.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{category.title}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences[category.key as keyof ConsentPreferences]}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          [category.key]: e.target.checked
                        }))}
                        disabled={category.required}
                        className="rounded border-gray-300"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{t('preferences.rights.title')}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• {t('preferences.rights.change')}</p>
                  <p>• {t('preferences.rights.access')}</p>
                  <p>• {t('preferences.rights.deletion')}</p>
                  <p>• {t('preferences.rights.withdraw')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                {t('preferences.buttons.cancel')}
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
              >
                <Check className="h-4 w-4 mr-2 inline" />
                {t('preferences.buttons.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsentBanner;