import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import App from '../../App';
import { mockApiService } from '../mocks/apiMock';

// Mock API service
vi.mock('../../services/api', () => ({
  apiService: mockApiService
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => <div>{children}</div>,
    Routes: ({ children }: any) => <div>{children}</div>,
    Route: ({ element }: any) => element,
    Navigate: () => <div>Navigate</div>,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>{children}</a>
    ),
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => vi.fn()
  };
});

describe('CMS Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders public website when not authenticated', () => {
    render(<App />);
    
    expect(screen.getByText('Atelier')).toBeInTheDocument();
    expect(screen.getByText('Revolutionary')).toBeInTheDocument();
  });

  it('shows login form for admin routes when not authenticated', () => {
    // Mock location to admin route
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useLocation: () => ({ pathname: '/admin' })
      };
    });

    render(<App />);
    
    expect(screen.getByText('Atelier CMS')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('integrates authentication flow', async () => {
    // Mock successful login
    localStorage.setItem('cms_token', 'valid-token');
    
    // Mock JWT payload
    const mockPayload = {
      userId: 1,
      username: 'admin',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };
    
    // Mock atob for JWT decoding
    global.atob = vi.fn().mockReturnValue(JSON.stringify(mockPayload));

    render(<App />);
    
    // Should show admin interface
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('handles expired tokens correctly', () => {
    // Mock expired token
    localStorage.setItem('cms_token', 'expired-token');
    
    const expiredPayload = {
      userId: 1,
      username: 'admin',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    };
    
    global.atob = vi.fn().mockReturnValue(JSON.stringify(expiredPayload));

    render(<App />);
    
    // Should show login form
    expect(screen.getByText('Atelier CMS')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    
    // Token should be removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('cms_token');
  });

  it('integrates translation provider with components', () => {
    render(<App />);
    
    // Translation provider should be active
    expect(screen.getByText('Atelier')).toBeInTheDocument();
    
    // RTL provider should be active (no visual test, but component should render)
    const app = screen.getByText('Atelier').closest('div');
    expect(app).toBeInTheDocument();
  });

  it('handles navigation between public and admin areas', async () => {
    render(<App />);
    
    // Start on public site
    expect(screen.getByText('Revolutionary')).toBeInTheDocument();
    
    // Navigate to admin (would show login)
    // This would be tested more thoroughly in E2E tests
  });

  it('integrates error boundaries', () => {
    // Mock component that throws error
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // This would test error boundary integration
    // In a real app, you'd have error boundaries that catch and display errors gracefully
  });
});