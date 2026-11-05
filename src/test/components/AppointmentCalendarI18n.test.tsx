import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent, cleanup } from '@testing-library/react';
import i18n from '../../i18n';
import RTLProvider from '../../components/RTLProvider';
import arPatientForms from '../../../public/locales/ar/patientForms.json';
import jaPatientForms from '../../../public/locales/ja/patientForms.json';
import hePatientForms from '../../../public/locales/he/patientForms.json';
import enPatientForms from '../../../public/locales/en/patientForms.json';

const patientState = vi.hoisted(() => ({
  user: { id: 'u1', email: 'patient@example.com', firstName: 'Test', lastName: 'Patient' },
  loading: false,
  error: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  pendingConfirmationEmail: null,
  resendConfirmation: () => {},
  clearPendingConfirmation: () => {},
}));

vi.mock('../../hooks/usePatient', () => ({ usePatient: () => patientState }));

vi.mock('i18next-http-backend', () => ({
  default: {
    type: 'backend',
    init() {},
    read(_l: string, _n: string, cb: (err: null, data: object) => void) {
      cb(null, {});
    },
  },
}));

vi.mock('../../services/translationService', () => ({
  translationService: { isAvailable: () => false, translate: async (s: string) => s },
  default: { isAvailable: () => false, translate: async (s: string) => s },
}));

vi.mock('../../lib/supabase', () => {
  const result = {
    data: [
      {
        id: 's1',
        slot_date: '2099-01-15',
        slot_time: '14:30:00',
        duration_minutes: 30,
        appointment_type: 'Consultation',
        location: 'Los Angeles',
        is_available: true,
      },
    ],
    error: null,
  };
  const builder: Record<string, unknown> = {};
  ['select', 'eq'].forEach((m) => (builder[m] = () => builder));
  builder.order = () => Promise.resolve(result);
  return {
    supabase: {
      from: () => builder,
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      },
    },
  };
});

import { AppointmentCalendar } from '../../components/booking/AppointmentCalendar';

const bundles: Record<string, typeof enPatientForms> = {
  ar: arPatientForms,
  ja: jaPatientForms,
  he: hePatientForms,
  en: enPatientForms,
};

const weekdays = (lng: string) =>
  Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + i).toLocaleDateString(lng, { weekday: 'short' })
  );

const switchTo = async (lng: string) => {
  await act(async () => {
    await i18n.changeLanguage(lng);
  });
};

describe('Appointment calendar translations', () => {
  beforeAll(() => {
    i18n.options.saveMissing = false;
    Object.entries(bundles).forEach(([lng, bundle]) => {
      i18n.addResourceBundle(lng, 'patientForms', bundle, true, true);
    });
  });

  afterEach(cleanup);

  afterAll(async () => {
    await switchTo('en');
  });

  it.each(['ar', 'he', 'ja'])('shows translated labels and weekday names in %s', async (lng) => {
    const cal = bundles[lng].calendar;
    await switchTo(lng);
    render(
      <RTLProvider>
        <AppointmentCalendar />
      </RTLProvider>
    );

    await waitFor(() => expect(screen.getByText(cal.selectDate)).toBeTruthy());
    expect(cal.selectDate).not.toBe(enPatientForms.calendar.selectDate);
    expect(screen.getByLabelText(cal.previousMonth)).toBeTruthy();
    expect(screen.getByLabelText(cal.nextMonth)).toBeTruthy();

    const names = weekdays(lng);
    expect(names).not.toEqual(weekdays('en'));
    names.forEach((name) => expect(screen.getAllByText(name).length).toBeGreaterThan(0));

    expect(document.documentElement.dir).toBe(['ar', 'he'].includes(lng) ? 'rtl' : 'ltr');

    const nextMonth = screen.getByLabelText(cal.nextMonth);
    for (let i = 0; i < 2; i++) fireEvent.click(nextMonth);
    const firstDay = screen.getAllByRole('button').find((b) => b.textContent === '1' && !b.hasAttribute('disabled'));
    expect(firstDay).toBeTruthy();
    fireEvent.click(firstDay!);

    await waitFor(() => expect(screen.getByText(cal.availableSlots)).toBeTruthy());
    expect(screen.getByText(cal.backToCalendar)).toBeTruthy();
    const time = new Date(2000, 0, 1, 14, 30).toLocaleTimeString(lng, { hour: 'numeric', minute: '2-digit' });
    expect(screen.getAllByText((t) => t.replace(/\s/g, ' ').includes(time.replace(/\s/g, ' '))).length).toBeGreaterThan(0);
  });
});
