import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/testUtils';
import Dashboard from '../../../components/admin/Dashboard';
import { mockApiService } from '../../mocks/apiMock';

// Mock API service
vi.mock('../../../services/api', () => ({
  apiService: mockApiService
}));

describe('Admin Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    render(<Dashboard />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays dashboard overview after loading', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Welcome to ClearSight CMS')).toBeInTheDocument();
  });

  it('shows statistics cards', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Testimonials')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
    expect(screen.getByText('Published Articles')).toBeInTheDocument();
    expect(screen.getByText('Media Files')).toBeInTheDocument();
  });

  it('displays recent activity', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('shows quick action buttons', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Testimonial')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Write Article')).toBeInTheDocument();
    expect(screen.getByText('Upload Media')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockApiService.getDashboardOverview.mockRejectedValueOnce(new Error('API Error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Should still render the dashboard structure even with API errors
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays correct statistics values', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // total_testimonials
    });
    
    expect(screen.getByText('5')).toBeInTheDocument(); // pending_testimonials
    expect(screen.getByText('20')).toBeInTheDocument(); // published_articles
  });
});