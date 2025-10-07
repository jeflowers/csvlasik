import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/testUtils';
import LoginForm from '../../../components/admin/LoginForm';
import { mockApiService } from '../../mocks/apiMock';

// Mock API service
vi.mock('../../../services/api', () => ({
  apiService: mockApiService
}));

describe('Admin LoginForm', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnLogin.mockClear();
  });

  it('renders login form elements', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    expect(screen.getByText('ClearSight CMS')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows default credentials hint', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    expect(screen.getByText('Default credentials: admin / admin123')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'admin123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    await waitFor(() => {
      expect(mockApiService.login).toHaveBeenCalledWith('admin', 'admin123');
    });
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser'
      }));
    });
  });

  it('displays error on failed login', async () => {
    mockApiService.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(<LoginForm onLogin={mockOnLogin} />);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows loading state during login', async () => {
    // Mock delayed login
    mockApiService.login.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ user: {} }), 100))
    );
    
    render(<LoginForm onLogin={mockOnLogin} />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'admin123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });

  it('validates required fields', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(usernameInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('clears error when user starts typing', async () => {
    mockApiService.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(<LoginForm onLogin={mockOnLogin} />);
    
    // Trigger error
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument();
    });
    
    // Start typing in username field
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'a' }
    });
    
    // Error should clear when user starts typing again
    expect(screen.queryByText(/Invalid credentials/)).not.toBeInTheDocument();
  });
});