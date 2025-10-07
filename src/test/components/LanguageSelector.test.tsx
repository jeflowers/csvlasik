import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import LanguageSelector from '../../components/LanguageSelector';

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn()
  }
}));

describe('LanguageSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current language', () => {
    render(<LanguageSelector />);
    
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
  });

  it('opens language dropdown when clicked', () => {
    render(<LanguageSelector />);
    
    const button = screen.getByLabelText(/selectLanguage/i);
    fireEvent.click(button);
    
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
  });

  it('changes language when option is selected', async () => {
    const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
    
    vi.doMock('react-i18next', () => ({
      useTranslation: () => ({
        i18n: {
          language: 'en',
          changeLanguage: mockChangeLanguage,
          dir: () => 'ltr'
        },
        t: (key: string) => key
      })
    }));

    render(<LanguageSelector />);
    
    const button = screen.getByLabelText(/selectLanguage/i);
    fireEvent.click(button);
    
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);
    
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });
  });

  it('displays RTL languages correctly', () => {
    render(<LanguageSelector />);
    
    const button = screen.getByLabelText(/selectLanguage/i);
    fireEvent.click(button);
    
    // Check for Arabic and Hebrew
    expect(screen.getByText('العربية')).toBeInTheDocument();
    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('shows translation note', () => {
    render(<LanguageSelector />);
    
    const button = screen.getByLabelText(/selectLanguage/i);
    fireEvent.click(button);
    
    expect(screen.getByText(/translationNote/i)).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSelector />);
    
    const button = screen.getByLabelText(/selectLanguage/i);
    fireEvent.click(button);
    
    expect(screen.getByText('Español')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });
});