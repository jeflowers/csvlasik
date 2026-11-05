import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, act, waitFor } from '../utils/testUtils';
import i18n from '../../i18n';
import RTLProvider from '../../components/RTLProvider';
import { BookingAuthGate } from '../../components/booking/BookingAuthGate';
import arPatientForms from '../../../public/locales/ar/patientForms.json';
import hePatientForms from '../../../public/locales/he/patientForms.json';
import enPatientForms from '../../../public/locales/en/patientForms.json';

const bundles: Record<string, object> = {
  ar: arPatientForms,
  he: hePatientForms,
  en: enPatientForms,
};

const preload = () => {
  const namespaces = (i18n.options.ns as string[]) || ['patientForms'];
  Object.entries(bundles).forEach(([lng, patientForms]) => {
    namespaces.forEach((ns) => {
      if (!i18n.hasResourceBundle(lng, ns)) {
        i18n.addResourceBundle(lng, ns, ns === 'patientForms' ? patientForms : {}, true, true);
      }
    });
    i18n.addResourceBundle(lng, 'patientForms', patientForms, true, true);
  });
};

const renderGate = () =>
  render(
    <RTLProvider>
      <BookingAuthGate
        login={vi.fn().mockResolvedValue(true)}
        register={vi.fn().mockResolvedValue(true)}
        error={null}
        resendConfirmation={vi.fn().mockResolvedValue(true)}
        clearPendingConfirmation={vi.fn()}
      />
    </RTLProvider>
  );

const switchTo = async (lng: string) => {
  await act(async () => {
    await i18n.changeLanguage(lng);
  });
};

describe('Booking sign-in screen right-to-left support', () => {
  beforeAll(() => {
    preload();
  });

  afterAll(async () => {
    await i18n.changeLanguage('en');
  });

  it.each([
    ['ar', /[\u0600-\u06FF]/],
    ['he', /[\u0590-\u05FF]/],
  ])('flips the page to right-to-left in %s', async (lng, script) => {
    renderGate();
    await switchTo(lng);

    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
    });
    expect(document.documentElement.lang).toBe(lng);
    expect(document.body.classList.contains('rtl')).toBe(true);
    expect(document.querySelector('meta[name="direction"]')?.getAttribute('content')).toBe('rtl');
    expect(document.getElementById('rtl-fonts')).not.toBeNull();

    await waitFor(() => {
      expect(script.test(document.body.textContent || '')).toBe(true);
    });

    const email = document.querySelector('input[type="email"]');
    const password = document.querySelector('input[type="password"]');
    expect(email?.getAttribute('dir')).toBe('ltr');
    expect(password?.getAttribute('dir')).toBe('ltr');
  });

  it('returns to left-to-right when switching back to English', async () => {
    renderGate();
    await switchTo('ar');
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));

    await switchTo('en');
    await waitFor(() => expect(document.documentElement.dir).toBe('ltr'));
    expect(document.body.classList.contains('rtl')).toBe(false);
    expect(document.getElementById('rtl-fonts')).toBeNull();
    expect(screen.queryAllByRole('textbox').length).toBeGreaterThan(0);
  });
});
