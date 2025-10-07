import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../utils/testUtils';
import Home from '../../pages/Home';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>{children}</a>
    )
  };
});

describe('Home Page', () => {
  it('renders hero section with main heading', () => {
    render(<Home />);
    
    expect(screen.getByText(/Revolutionary/)).toBeInTheDocument();
    expect(screen.getByText(/Vision Care/)).toBeInTheDocument();
  });

  it('displays procedure counter animation', async () => {
    render(<Home />);
    
    // Should start at 0 and animate to 30,000
    await waitFor(() => {
      const counter = screen.getByText(/30,000\+/);
      expect(counter).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows statistics cards', () => {
    render(<Home />);
    
    expect(screen.getByText('Lives Transformed')).toBeInTheDocument();
    expect(screen.getByText('Pacific Islands')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Years Experience')).toBeInTheDocument();
  });

  it('displays call-to-action buttons', () => {
    render(<Home />);
    
    expect(screen.getByText('SCHEDULE CONSULTATION')).toBeInTheDocument();
    expect(screen.getByText('(844) 211-5462')).toBeInTheDocument();
  });

  it('cycles through hero images', async () => {
    render(<Home />);
    
    // Should have image carousel indicators
    const indicators = screen.getAllByRole('button', { name: /Go to image/i });
    expect(indicators).toHaveLength(5);
  });

  it('includes Pacific story link', () => {
    render(<Home />);
    
    expect(screen.getByText('THE PACIFIC STORY')).toBeInTheDocument();
  });

  it('shows contact phone number as clickable link', () => {
    render(<Home />);
    
    const phoneLink = screen.getByRole('link', { name: /\(844\) 211-5462/ });
    expect(phoneLink).toHaveAttribute('href', 'tel:+18442115462');
  });
});