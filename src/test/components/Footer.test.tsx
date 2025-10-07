import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../utils/testUtils';
import Footer from '../../components/Footer';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>{children}</a>
    )
  };
});

describe('Footer Component', () => {
  it('renders company information', () => {
    render(<Footer />);
    
    expect(screen.getByText('ClearSight')).toBeInTheDocument();
    expect(screen.getByText(/© 2025 ClearSight/)).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<Footer />);
    
    expect(screen.getByText('(844) 211-5462')).toBeInTheDocument();
    expect(screen.getByText('info@clearsightlasik.com')).toBeInTheDocument();
    expect(screen.getByText(/Lakewood Office/)).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    render(<Footer />);
    
    expect(screen.getByText('About Dr. Flowers')).toBeInTheDocument();
    expect(screen.getByText('All Procedures')).toBeInTheDocument();
    expect(screen.getByText('LASIK Surgery')).toBeInTheDocument();
  });

  it('includes social media links', () => {
    render(<Footer />);
    
    // Check for social media icons (they should be present as SVG elements)
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks.length).toBeGreaterThan(5); // Should have multiple social links
  });

  it('displays newsletter signup', () => {
    render(<Footer />);
    
    expect(screen.getByText('Stay Updated')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('shows Pacific mission supporter badge', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Pacific Mission Supporter/)).toBeInTheDocument();
  });
});