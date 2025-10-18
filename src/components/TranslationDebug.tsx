import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationDebug: React.FC = () => {
  const { t, i18n } = useTranslation(['home', 'navigation', 'common']);

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50 text-sm">
      <h3 className="font-bold mb-2">Translation Debug Info</h3>
      <div className="space-y-1 text-xs">
        <p><strong>Current Language:</strong> {i18n.language}</p>
        <p><strong>Resolved Language:</strong> {i18n.resolvedLanguage}</p>
        <p><strong>Languages:</strong> {i18n.languages.join(', ')}</p>
        <p><strong>Loaded Namespaces:</strong> {Object.keys(i18n.store.data[i18n.language] || {}).join(', ')}</p>

        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="font-semibold mb-1">Sample Translations:</p>
          <p><strong>hero.title:</strong> {t('hero.title', { ns: 'home' })}</p>
          <p><strong>home:</strong> {t('home', { ns: 'navigation' })}</p>
          <p><strong>brandName:</strong> {t('brandName', { ns: 'common' })}</p>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="font-semibold mb-1">Backend Config:</p>
          <p><strong>Load Path:</strong> {i18n.options.backend?.loadPath}</p>
        </div>
      </div>

      <button
        onClick={() => {
          const langs = ['en', 'es-MX', 'ja', 'ko', 'zh'];
          const currentIndex = langs.indexOf(i18n.language);
          const nextLang = langs[(currentIndex + 1) % langs.length];
          i18n.changeLanguage(nextLang);
        }}
        className="mt-3 px-3 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700"
      >
        Cycle Languages
      </button>
    </div>
  );
};

export default TranslationDebug;
