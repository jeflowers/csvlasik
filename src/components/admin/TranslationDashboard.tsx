import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Database,
  TrendingUp,
  Edit
} from 'lucide-react';
import { useTranslationService } from '../../hooks/useTranslationService';
import { SUPPORTED_LANGUAGES } from '../../i18n';

const TranslationDashboard: React.FC = () => {
  const { serviceStatus, clearCache } = useTranslationService();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testTranslation, setTestTranslation] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleTestTranslation = async () => {
    if (!testTranslation.trim()) return;
    
    setTestResult({ loading: true });
    
    try {
      const { translateText } = useTranslationService();
      const results: { [key: string]: string } = {};
      
      // Test translation to a few key languages
      const testLanguages = ['es', 'ko', 'ar'];
      
      for (const lang of testLanguages) {
        results[lang] = await translateText(testTranslation, lang);
      }
      
      setTestResult({ success: true, results });
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Translation failed' 
      });
    }
  };

  const getServiceStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-gray-400" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Translation Dashboard</h1>
          <p className="text-gray-600">Monitor and manage translation services</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/translations/editor"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Translations
          </Link>
          <button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Service Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">DeepL Service</h3>
            {getServiceStatusIcon(serviceStatus.deepl?.enabled)}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Status: {serviceStatus.deepl?.enabled ? 'Active' : 'Not Configured'}
            </p>
            <p className="text-sm text-gray-600">
              Languages: {serviceStatus.deepl?.supportedLanguages?.length || 0}
            </p>
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {serviceStatus.deepl?.supportedLanguages?.map((lang: string) => (
                  <span key={lang} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.flag} {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Google Translate</h3>
            {getServiceStatusIcon(serviceStatus.google?.enabled)}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Status: {serviceStatus.google?.enabled ? 'Active' : 'Not Configured'}
            </p>
            <p className="text-sm text-gray-600">
              Languages: {serviceStatus.google?.supportedLanguages?.length || 0}
            </p>
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {serviceStatus.google?.supportedLanguages?.map((lang: string) => (
                  <span key={lang} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.flag} {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Cache Status</h3>
            <Database className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Entries: {serviceStatus.cache?.entries || 0}
            </p>
            <p className="text-sm text-gray-600">
              Last Cleared: {serviceStatus.cache?.lastCleared || 'Never'}
            </p>
            <button
              onClick={clearCache}
              className="mt-3 px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Language Support Matrix */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Language Support Matrix</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-900">Language</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">DeepL</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Google</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">Local Files</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-900">RTL</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(SUPPORTED_LANGUAGES).map((language) => (
                  <tr key={language.code} className="border-b border-gray-100">
                    <td className="py-3 px-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{language.flag}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{language.nativeName}</div>
                          <div className="text-xs text-gray-500">{language.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3">
                      {serviceStatus.deepl?.supportedLanguages?.includes(language.code) ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto"></div>
                      )}
                    </td>
                    <td className="text-center py-3 px-3">
                      {serviceStatus.google?.supportedLanguages?.includes(language.code) ? (
                        <CheckCircle className="h-4 w-4 text-blue-500 mx-auto" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto"></div>
                      )}
                    </td>
                    <td className="text-center py-3 px-3">
                      <CheckCircle className="h-4 w-4 text-purple-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-3">
                      {language.rtl ? (
                        <CheckCircle className="h-4 w-4 text-orange-500 mx-auto" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto"></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Translation Testing */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Translation Testing</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Text
              </label>
              <textarea
                value={testTranslation}
                onChange={(e) => setTestTranslation(e.target.value)}
                placeholder="Enter text to test translation services..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                rows={3}
              />
            </div>
            <button
              onClick={handleTestTranslation}
              disabled={!testTranslation.trim()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 mr-2 inline" />
              Test Translation
            </button>
            
            {testResult && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                {testResult.loading && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing translation services...
                  </div>
                )}
                
                {testResult.success && (
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600 mb-3">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Translation test successful
                    </div>
                    {Object.entries(testResult.results).map(([lang, translation]) => (
                      <div key={lang} className="border-l-4 border-teal-500 pl-4">
                        <div className="flex items-center mb-1">
                          <span className="text-lg mr-2">
                            {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.flag}
                          </span>
                          <span className="font-medium text-gray-900">
                            {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.nativeName}
                          </span>
                        </div>
                        <p className="text-gray-700">{translation as string}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {testResult.error && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Error: {testResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Usage Statistics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {serviceStatus.cache?.entries || 0}
              </div>
              <div className="text-sm text-gray-600">Cached Translations</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">11</div>
              <div className="text-sm text-gray-600">Supported Languages</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {(serviceStatus.deepl?.enabled ? 1 : 0) + (serviceStatus.google?.enabled ? 1 : 0)}
              </div>
              <div className="text-sm text-gray-600">Active Services</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">44</div>
              <div className="text-sm text-gray-600">Translation Files</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Guide */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Service Configuration</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">DeepL Configuration</h4>
              <p className="text-sm text-blue-700 mb-3">
                For high-quality medical content translation (recommended for professional content)
              </p>
              <code className="block text-xs bg-blue-100 p-2 rounded">
                VITE_DEEPL_API_KEY=your-deepl-api-key-here
              </code>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Google Translate Configuration</h4>
              <p className="text-sm text-green-700 mb-3">
                For broader language support including Tagalog, Vietnamese, and Armenian
              </p>
              <code className="block text-xs bg-green-100 p-2 rounded">
                VITE_GOOGLE_TRANSLATE_API_KEY=your-google-api-key-here
              </code>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Local Files Fallback</h4>
              <p className="text-sm text-purple-700">
                All languages have complete local JSON files as fallback when API services are unavailable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDashboard;