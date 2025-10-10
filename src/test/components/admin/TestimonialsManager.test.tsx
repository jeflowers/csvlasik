import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestimonialsManager from '../../../components/admin/TestimonialsManager';
import { apiService } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  apiService: {
    getTestimonials: vi.fn(),
    createTestimonial: vi.fn(),
    updateTestimonial: vi.fn(),
    deleteTestimonial: vi.fn(),
  },
}));

describe('TestimonialsManager', () => {
  const mockTestimonials = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      content: 'Great experience with LASIK surgery!',
      rating: 5,
      procedure_type: 'LASIK',
      procedure_date: '2024-01-15',
      approved: true,
      created_at: '2024-01-16T10:00:00Z',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      content: 'PRK procedure went smoothly.',
      rating: 4,
      procedure_type: 'PRK',
      procedure_date: '2024-02-01',
      approved: false,
      created_at: '2024-02-02T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getTestimonials).mockResolvedValue({
      testimonials: mockTestimonials,
      total: 2,
    });
  });

  it('should render testimonials manager with header', async () => {
    render(<TestimonialsManager />);

    expect(screen.getByText('Testimonials Management')).toBeInTheDocument();
    expect(screen.getByText('Manage patient testimonials and success stories')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Testimonial/i })).toBeInTheDocument();
  });

  it('should fetch and display testimonials on mount', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(apiService.getTestimonials).toHaveBeenCalledWith({});
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should show loading spinner while fetching', () => {
    vi.mocked(apiService.getTestimonials).mockImplementation(
      () => new Promise(() => {})
    );

    render(<TestimonialsManager />);

    expect(screen.getByRole('cell', { name: '' })).toBeInTheDocument();
  });

  it('should display empty state when no testimonials', async () => {
    vi.mocked(apiService.getTestimonials).mockResolvedValue({
      testimonials: [],
      total: 0,
    });

    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('No testimonials found')).toBeInTheDocument();
    });
  });

  it('should filter testimonials by status', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const statusFilter = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(statusFilter, 'pending');

    await waitFor(() => {
      expect(apiService.getTestimonials).toHaveBeenCalledWith({ status: 'pending' });
    });
  });

  it('should filter testimonials by procedure', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const procedureFilter = screen.getAllByRole('combobox')[1];
    await userEvent.selectOptions(procedureFilter, 'LASIK');

    await waitFor(() => {
      expect(apiService.getTestimonials).toHaveBeenCalledWith({ procedure: 'LASIK' });
    });
  });

  it('should search testimonials', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search testimonials...');
    await userEvent.type(searchInput, 'John');

    await waitFor(() => {
      expect(apiService.getTestimonials).toHaveBeenCalledWith({ search: 'John' });
    });
  });

  it('should clear all filters', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const statusFilter = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(statusFilter, 'pending');

    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(apiService.getTestimonials).toHaveBeenCalledWith({});
    });
  });

  it('should display rating stars correctly', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('5/5')).toBeInTheDocument();
      expect(screen.getByText('4/5')).toBeInTheDocument();
    });
  });

  it('should show approved status badge', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('should approve testimonial', async () => {
    vi.mocked(apiService.updateTestimonial).mockResolvedValue({
      id: 2,
      approved: true,
    } as any);

    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByTitle('Approve');
    await userEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(apiService.updateTestimonial).toHaveBeenCalledWith(2, { approved: true });
    });
  });

  it('should unapprove testimonial', async () => {
    vi.mocked(apiService.updateTestimonial).mockResolvedValue({
      id: 1,
      approved: false,
    } as any);

    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const unapproveButton = screen.getByTitle('Unapprove');
    await userEvent.click(unapproveButton);

    await waitFor(() => {
      expect(apiService.updateTestimonial).toHaveBeenCalledWith(1, { approved: false });
    });
  });

  it('should select individual testimonials', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);

    expect(screen.getByText('1 testimonial(s) selected')).toBeInTheDocument();
  });

  it('should select all testimonials', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);

    expect(screen.getByText('2 testimonial(s) selected')).toBeInTheDocument();
  });

  it('should bulk approve testimonials', async () => {
    vi.mocked(apiService.updateTestimonial).mockResolvedValue({ approved: true } as any);

    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await userEvent.click(checkboxes[2]);

    const bulkApproveButton = screen.getByRole('button', { name: /Approve Selected/i });
    await userEvent.click(bulkApproveButton);

    await waitFor(() => {
      expect(apiService.updateTestimonial).toHaveBeenCalledTimes(2);
    });
  });

  it('should clear selection', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);

    expect(screen.getByText('1 testimonial(s) selected')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /Clear Selection/i });
    await userEvent.click(clearButton);

    expect(screen.queryByText('1 testimonial(s) selected')).not.toBeInTheDocument();
  });

  it('should open create modal', async () => {
    render(<TestimonialsManager />);

    const addButton = screen.getByRole('button', { name: /Add Testimonial/i });
    await userEvent.click(addButton);

    expect(screen.getByText('Add New Testimonial')).toBeInTheDocument();
  });

  it('should open edit modal', async () => {
    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getAllByTitle('Edit')[0];
    await userEvent.click(editButton);

    expect(screen.getByText('Edit Testimonial')).toBeInTheDocument();
  });

  it('should create new testimonial', async () => {
    vi.mocked(apiService.createTestimonial).mockResolvedValue({
      id: 3,
      name: 'New Patient',
      content: 'New testimonial',
    } as any);

    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Testimonial/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Testimonial')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs[0];
    const contentInput = inputs[2];

    await userEvent.type(nameInput, 'New Patient');
    await userEvent.type(contentInput, 'Great service');

    const submitButton = screen.getByRole('button', { name: /Create Testimonial/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(apiService.createTestimonial).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('should update existing testimonial', async () => {
    vi.mocked(apiService.updateTestimonial).mockResolvedValue({
      id: 1,
      name: 'John Doe Updated',
    } as any);

    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getAllByTitle('Edit')[0];
    await userEvent.click(editButton);

    const nameInput = screen.getByDisplayValue('John Doe');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'John Doe Updated');

    const submitButton = screen.getByRole('button', { name: /Update Testimonial/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(apiService.updateTestimonial).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'John Doe Updated',
        })
      );
    });
  });

  it('should close modal on cancel', async () => {
    render(<TestimonialsManager />);

    const addButton = screen.getByRole('button', { name: /Add Testimonial/i });
    await userEvent.click(addButton);

    expect(screen.getByText('Add New Testimonial')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(screen.queryByText('Add New Testimonial')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(apiService.getTestimonials).mockRejectedValue(new Error('API Error'));

    render(<TestimonialsManager />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch testimonials:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
