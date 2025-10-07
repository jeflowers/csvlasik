import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import translationService from '../services/translationService';

interface UseTranslationServiceOptions {
  preferredService?: 'deepl' | 'google' | 'auto';
  useCache?: boolean;
  namespace?: string;
}

export const useTranslationService = (options: UseTranslationServiceOptions = {}) => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<any>({});

  useEffect(() => {
    setServiceStatus(translationService.getServiceStatus());
  }, []);

  const translateText = async (
    text: string,
    targetLang?: string,
    key?: string
  ): Promise<string> => {
    const target = targetLang || i18n.language;
    
    if (target === 'en') {
      return text;
    }

    setIsTranslating(true);
    try {
      const result = await translationService.translate(text, target, 'en', {
        ...options,
        key
      });
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  const batchTranslate = async (
    items: Array<{ text: string; key?: string }>,
    targetLanguages?: string[]
  ) => {
    const targets = targetLanguages || [i18n.language];
    
    setIsTranslating(true);
    try {
      const results = await translationService.batchTranslate(
        items.map(item => ({ ...item, namespace: options.namespace })),
        targets,
        { preferredService: options.preferredService }
      );
      return results;
    } catch (error) {
      console.error('Batch translation failed:', error);
      return {};
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translateText,
    batchTranslate,
    isTranslating,
    serviceStatus,
    clearCache: translationService.clearCache
  };
};

// Hook for dynamic content translation
export const useDynamicTranslation = (
  content: string,
  key?: string,
  namespace?: string
) => {
  const { i18n } = useTranslation();
  const [translatedContent, setTranslatedContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateContent = async () => {
      if (i18n.language === 'en') {
        setTranslatedContent(content);
        return;
      }

      setIsLoading(true);
      try {
        const result = await translationService.translate(content, i18n.language, 'en', {
          key,
          namespace
        });
        setTranslatedContent(result);
      } catch (error) {
        console.error('Dynamic translation failed:', error);
        setTranslatedContent(content);
      } finally {
        setIsLoading(false);
      }
    };

    translateContent();
  }, [content, i18n.language, key, namespace]);

  return { translatedContent, isLoading };
};