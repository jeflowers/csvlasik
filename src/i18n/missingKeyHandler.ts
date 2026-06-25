import translationService from '../services/translationService';
import type { i18n as I18nInstance } from 'i18next';

const pendingTranslations = new Set<string>();

/**
 * i18next missing key handler that falls through to DeepL/Google Translate.
 * Strategy: JSON files (primary) -> DeepL (most languages) -> Google (tl/vi/hy) -> show key
 *
 * When a key is missing from static JSON, this handler:
 * 1. Looks up the English value as source text
 * 2. Sends it through the translation service (DeepL -> Google -> original)
 * 3. Adds the result back to the i18next resource store
 */
export function createMissingKeyHandler(i18nInstance: I18nInstance) {
  return (
    lngs: readonly string[],
    ns: string,
    key: string,
    fallbackValue: string
  ) => {
    if (!translationService.isAvailable()) return;

    for (const lng of lngs) {
      if (lng === 'en' || lng === 'dev') continue;

      const trackingKey = `${lng}:${ns}:${key}`;
      if (pendingTranslations.has(trackingKey)) continue;
      pendingTranslations.add(trackingKey);

      // Get English source text for this key
      const sourceText = i18nInstance.getResource('en', ns, key) as string | undefined;
      if (!sourceText || typeof sourceText !== 'string') {
        pendingTranslations.delete(trackingKey);
        continue;
      }

      translationService
        .translate(sourceText, lng, 'en')
        .then((translated) => {
          if (translated && translated !== sourceText) {
            i18nInstance.addResource(lng, ns, key, translated);
          }
        })
        .catch(() => {
          // Silently fail - the fallback value from i18next is already displayed
        })
        .finally(() => {
          pendingTranslations.delete(trackingKey);
        });
    }
  };
}
