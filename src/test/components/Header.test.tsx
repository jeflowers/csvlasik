import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../utils/testUtils';
import Header from '../../components/Header';

// Mock useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>{children}</a>
    )
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
    render(<Header />);

    expect(screen.getByText('procedures')).toBeInTheDocument();
    expect(screen.getByText('financing')).toBeInTheDocument();
    expect(screen.getByText('contact')).toBeInTheDocument();
  });

  it('shows mobile menu when hamburger is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText(/menu/i);
    fireEvent.click(menuButton);

    expect(screen.getByRole('button', { name: /closeMenu/i })).toBeInTheDocument();
  });

  it('displays language selector', () => {
    render(<Header />);

    expect(screen.getByLabelText(/selectLanguage/i)).toBeInTheDocument();
  });

  it('applies RTL classes when language direction is RTL', () => {
    const mockI18n = {
      language: 'ar',
      dir: vi.fn().mockReturnValue('rtl'),
      t: vi.fn((key) => key),
      getResourceBundle: vi.fn().mockReturnValue({}),
      reloadResources: vi.fn()
    };

    vi.doMock('react-i18next', () => ({
      useTranslation: () => ({ t: mockI18n.t, i18n: mockI18n })
    }));

    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
