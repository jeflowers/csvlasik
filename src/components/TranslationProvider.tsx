import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import translationService from '../services/translationService';

interface TranslationContextType {
  translateText: (text: string, key?: string, namespace?: string) => Promise<string>;
  isServiceAvailable: boolean;
  serviceStatus: any;
  clearCache: () => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: React.ReactNode;
  preferredService?: 'deepl' | 'google' | 'auto';
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  preferredService = 'auto' 
}) => {
  const { i18n } = useTranslation();
  const [serviceStatus, setServiceStatus] = useState<any>({});
  const [isServiceAvailable, setIsServiceAvailable] = useState(false);

  useEffect(() => {
    const status = translationService.getServiceStatus();
    setServiceStatus(status);
    setIsServiceAvailable(status.deepl.enabled || status.google.enabled);
  }, []);

  const translateText = async (text: string, key?: string, namespace?: string): Promise<string> => {
    try {
      return await translationService.translate(text, i18n.language, 'en', {
        preferredService,
        key,
        namespace
      });
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const clearCache = () => {
    translationService.clearCache();
    setServiceStatus(translationService.getServiceStatus());
  };

  const value: TranslationContextType = {
    translateText,
    isServiceAvailable,
    serviceStatus,
    clearCache
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};