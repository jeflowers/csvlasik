import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export const CONSENT_COOKIE = 'gdpr_consent';
export const CONSENT_EVENT = 'consent-updated';

export function readConsent(): ConsentPreferences | null {
  const raw = Cookies.get(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConsentPreferences;
  } catch {
    return null;
  }
}

export function writeConsent(consent: ConsentPreferences) {
  Cookies.set(CONSENT_COOKIE, JSON.stringify(consent), {
    expires: 365,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict'
  });
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

// Third-party embeds (maps, video players) set their own cookies, so they need marketing consent to auto-load.
export function useThirdPartyEmbedConsent(): boolean {
  const [allowed, setAllowed] = useState(() => readConsent()?.marketing === true);

  useEffect(() => {
    const update = () => setAllowed(readConsent()?.marketing === true);
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);

  return allowed;
}
