import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import LanguageSelector from '../../components/LanguageSelector';
import i18n, { SUPPORTED_LANGUAGES } from '../../i18n';

const openMenu = () => fireEvent.click(screen.getByLabelText(/selectLanguage/i));

describe('LanguageSelector', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the current language code on the trigger', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByLabelText(/selectLanguage/i);
    expect(trigger.textContent ?? '').toMatch(/[A-Z]{2}(-[A-Z]{2})?/);
  });

  it('lists all supported languages', () => {
    render(<LanguageSelector />);
    openMenu();
    const langs = Object.values(SUPPORTED_LANGUAGES);
    expect(screen.getAllByRole('menuitem')).toHaveLength(langs.length);
    langs.forEach((lang) => {
      expect(screen.getAllByText(lang.nativeName).length).toBeGreaterThan(0);
    });
  });

  it('changes language when an option is selected', async () => {
    const spy = vi.spyOn(i18n, 'changeLanguage').mockResolvedValue(i18n.t);
    render(<LanguageSelector />);
    openMenu();
    fireEvent.click(screen.getByText('Español (Latinoamérica)'));
    await waitFor(() => expect(spy).toHaveBeenCalledWith('es-MX'));
  });

  it('includes right-to-left languages', () => {
    render(<LanguageSelector />);
    openMenu();
    expect(screen.getByText('العربية')).toBeInTheDocument();
    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('shows the translation note', () => {
    render(<LanguageSelector />);
    openMenu();
    expect(screen.getByText(/translationNote/i)).toBeInTheDocument();
  });

  it('closes when Escape is pressed', async () => {
    render(<LanguageSelector />);
    openMenu();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});
