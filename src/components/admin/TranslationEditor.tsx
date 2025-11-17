import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Save,
  X,
  Search,
  Download,
  Upload,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SUPPORTED_LANGUAGES } from '../../i18n';

interface TranslationEntry {
  key: string;
  namespace: string;
  translations: { [lang: string]: string };
}

interface TranslationFile {
  namespace: string;
  language: string;
  content: { [key: string]: any };
}

const TranslationEditor: React.FC = () => {
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingTranslations, setEditingTranslations] = useState<{ [lang: string]: string }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newTranslations, setNewTranslations] = useState<{ [lang: string]: string }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const namespaces = [
    'common',
    'navigation',
    'home',
    'about',
    'procedures',
    'technology',
    'financing',
    'contact',
    'media',
    'testimonials',
    'forms',
    'medical',
    'footer',
    'privacy',
    'terms',
    'cookies',
    'pacific'
  ];

  const languages = Object.keys(SUPPORTED_LANGUAGES);

  useEffect(() => {
    loadTranslations();
  }, [selectedNamespace]);

  const loadTranslations = async () => {
    setLoading(true);
    try {
      const translationFiles: TranslationFile[] = [];

      for (const lang of languages) {
        try {
          const response = await fetch(`/locales/${lang}/${selectedNamespace}.json`);
          if (response.ok) {
            const content = await response.json();
            translationFiles.push({
              namespace: selectedNamespace,
              language: lang,
              content
            });
          }
        } catch (error) {
          console.warn(`Failed to load ${lang}/${selectedNamespace}:`, error);
        }
      }

      const entriesMap: { [key: string]: TranslationEntry } = {};

      translationFiles.forEach(file => {
        const flattenedKeys = flattenObject(file.content);
        Object.entries(flattenedKeys).forEach(([key, value]) => {
          if (!entriesMap[key]) {
            entriesMap[key] = {
              key,
              namespace: selectedNamespace,
              translations: {}
            };
          }
          entriesMap[key].translations[file.language] = value as string;
        });
      });

      setEntries(Object.values(entriesMap));
    } catch (error) {
      console.error('Failed to load translations:', error);
      setErrorMessage('Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  const flattenObject = (obj: any, prefix = ''): { [key: string]: any } => {
    return Object.keys(obj).reduce((acc: any, k: string) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const unflattenObject = (obj: { [key: string]: any }): any => {
    const result: any = {};
    for (const key in obj) {
      const keys = key.split('.');
      keys.reduce((acc, k, i) => {
        if (i === keys.length - 1) {
          acc[k] = obj[key];
        } else {
          acc[k] = acc[k] || {};
        }
        return acc[k];
      }, result);
    }
    return result;
  };

  const handleEdit = (entry: TranslationEntry) => {
    setEditingKey(entry.key);
    setEditingTranslations({ ...entry.translations });
  };

  const handleSave = async () => {
    if (!editingKey) return;

    setSaveStatus('saving');
    setErrorMessage('');

    try {
      await saveToDatabase(editingKey, editingTranslations);

      setEntries(prev =>
        prev.map(entry =>
          entry.key === editingKey
            ? { ...entry, translations: editingTranslations }
            : entry
        )
      );

      setEditingKey(null);
      setEditingTranslations({});
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save translation:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save');
      setSaveStatus('error');
    }
  };

  const handleAdd = async () => {
    if (!newKey.trim()) return;

    setSaveStatus('saving');
    setErrorMessage('');

    try {
      await saveToDatabase(newKey, newTranslations);

      setEntries(prev => [
        ...prev,
        {
          key: newKey,
          namespace: selectedNamespace,
          translations: newTranslations
        }
      ]);

      setShowAddModal(false);
      setNewKey('');
      setNewTranslations({});
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to add translation:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add');
      setSaveStatus('error');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete translation key "${key}"?`)) return;

    try {
      await deleteFromDatabase(key);
      setEntries(prev => prev.filter(e => e.key !== key));
    } catch (error) {
      console.error('Failed to delete translation:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  const saveToDatabase = async (key: string, translations: { [lang: string]: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    for (const [lang, text] of Object.entries(translations)) {
      if (!text) continue;

      const { error } = await supabase
        .from('translation_cache')
        .upsert({
          source_text: key,
          target_language: lang,
          translated_text: text,
          source_language: 'en',
          namespace: selectedNamespace,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'source_text,target_language,namespace'
        });

      if (error) throw error;
    }
  };

  const deleteFromDatabase = async (key: string) => {
    const { error } = await supabase
      .from('translation_cache')
      .delete()
      .eq('source_text', key)
      .eq('namespace', selectedNamespace);

    if (error) throw error;
  };

  const exportTranslations = () => {
    const data: { [lang: string]: any } = {};

    languages.forEach(lang => {
      const langData: { [key: string]: string } = {};
      entries.forEach(entry => {
        if (entry.translations[lang]) {
          langData[entry.key] = entry.translations[lang];
        }
      });
      data[lang] = unflattenObject(langData);
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${selectedNamespace}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredEntries = entries.filter(entry =>
    entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.values(entry.translations).some(t =>
      t.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getCompletionPercentage = (translations: { [lang: string]: string }) => {
    const total = languages.length;
    const completed = languages.filter(lang => translations[lang]?.trim()).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Translation Editor</h1>
          <p className="text-gray-600">Add and update translations across all languages</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportTranslations}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Translation
          </button>
        </div>
      </div>

      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-800">Translation saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Namespace
              </label>
              <select
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search translations..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map(entry => (
                <div key={entry.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {entry.key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(entry.key)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${getCompletionPercentage(entry.translations)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {getCompletionPercentage(entry.translations)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.key)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {editingKey === entry.key ? (
                    <div className="space-y-3">
                      {languages.map(lang => (
                        <div key={lang} className="flex items-start gap-3">
                          <div className="w-24 pt-2">
                            <span className="text-lg mr-2">
                              {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.flag}
                            </span>
                            <span className="text-sm text-gray-600">{lang}</span>
                          </div>
                          <textarea
                            value={editingTranslations[lang] || ''}
                            onChange={(e) =>
                              setEditingTranslations(prev => ({
                                ...prev,
                                [lang]: e.target.value
                              }))
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            rows={2}
                          />
                        </div>
                      ))}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingKey(null);
                            setEditingTranslations({});
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <X className="h-4 w-4 mr-2 inline" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saveStatus === 'saving'}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4 mr-2 inline" />
                          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {languages.map(lang => (
                        <div key={lang} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">
                              {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.flag}
                            </span>
                            <span className="font-medium text-gray-700">{lang}</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">
                            {entry.translations[lang] || (
                              <span className="text-gray-400 italic">Not translated</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredEntries.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No translations found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Translation</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewKey('');
                  setNewTranslations({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translation Key
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., welcome.title or buttons.submit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use dot notation for nested keys (e.g., section.subsection.key)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translations
                </label>
                <div className="space-y-3">
                  {languages.map(lang => (
                    <div key={lang} className="flex items-start gap-3">
                      <div className="w-32 pt-2">
                        <span className="text-lg mr-2">
                          {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.flag}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES]?.name}
                        </span>
                      </div>
                      <textarea
                        value={newTranslations[lang] || ''}
                        onChange={(e) =>
                          setNewTranslations(prev => ({
                            ...prev,
                            [lang]: e.target.value
                          }))
                        }
                        placeholder={`Enter ${lang} translation...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewKey('');
                  setNewTranslations({});
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newKey.trim() || saveStatus === 'saving'}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {saveStatus === 'saving' ? 'Adding...' : 'Add Translation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationEditor;
