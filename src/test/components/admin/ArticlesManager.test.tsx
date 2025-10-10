import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticlesManager from '../../../components/admin/ArticlesManager';
import { apiService } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  apiService: {
    getArticles: vi.fn(),
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
    deleteArticle: vi.fn(),
  },
}));

global.confirm = vi.fn(() => true);

describe('ArticlesManager', () => {
  const mockArticles = [
    {
      id: 1,
      title: 'Understanding LASIK Surgery',
      content: 'LASIK is a popular vision correction procedure...',
      author_id: 'user-1',
      category: 'Procedures',
      tags: ['LASIK', 'vision', 'surgery'],
      meta_description: 'Learn about LASIK surgery and its benefits',
      status: 'published' as const,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      title: 'PRK vs LASIK: Which is Right for You?',
      content: 'Comparing two popular vision correction procedures...',
      author_id: 'user-1',
      category: 'Technology',
      tags: ['PRK', 'LASIK', 'comparison'],
      meta_description: 'Compare PRK and LASIK procedures',
      status: 'draft' as const,
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getArticles).mockResolvedValue({
      articles: mockArticles,
      total: 2,
    });
  });

  it('should render articles manager with header', async () => {
    render(<ArticlesManager />);

    expect(screen.getByText('Articles Management')).toBeInTheDocument();
    expect(screen.getByText('Create and manage educational content and blog posts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Article/i })).toBeInTheDocument();
  });

  it('should fetch and display articles on mount', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(apiService.getArticles).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        status: undefined,
        category: undefined,
        search: undefined,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
      expect(screen.getByText('PRK vs LASIK: Which is Right for You?')).toBeInTheDocument();
    });
  });

  it('should show loading spinner while fetching', () => {
    vi.mocked(apiService.getArticles).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ArticlesManager />);

    expect(screen.getByRole('cell', { name: '' })).toBeInTheDocument();
  });

  it('should display empty state when no articles', async () => {
    vi.mocked(apiService.getArticles).mockResolvedValue({
      articles: [],
      total: 0,
    });

    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });
  });

  it('should filter articles by status', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const statusFilter = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(statusFilter, 'published');

    await waitFor(() => {
      expect(apiService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' })
      );
    });
  });

  it('should filter articles by category', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const categoryFilter = screen.getAllByRole('combobox')[1];
    await userEvent.selectOptions(categoryFilter, 'Technology');

    await waitFor(() => {
      expect(apiService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Technology' })
      );
    });
  });

  it('should search articles', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search articles...');
    await userEvent.type(searchInput, 'LASIK');

    await waitFor(() => {
      expect(apiService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'LASIK' })
      );
    });
  });

  it('should clear all filters', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const statusFilter = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(statusFilter, 'published');

    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(apiService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined,
          category: undefined,
          search: undefined,
        })
      );
    });
  });

  it('should display status badges correctly', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      const publishedBadges = screen.getAllByText('Published');
      const draftBadges = screen.getAllByText('Draft');
      expect(publishedBadges.length).toBeGreaterThan(0);
      expect(draftBadges.length).toBeGreaterThan(0);
    });
  });

  it('should display category badges correctly', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Procedures')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('should display article tags', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText(/LASIK, vision, surgery/)).toBeInTheDocument();
      expect(screen.getByText(/PRK, LASIK, comparison/)).toBeInTheDocument();
    });
  });

  it('should delete article with confirmation', async () => {
    vi.mocked(apiService.deleteArticle).mockResolvedValue({ success: true });

    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    await userEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this article?');

    await waitFor(() => {
      expect(apiService.deleteArticle).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete article if not confirmed', async () => {
    vi.mocked(global.confirm).mockReturnValue(false);

    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    await userEvent.click(deleteButtons[0]);

    expect(apiService.deleteArticle).not.toHaveBeenCalled();
  });

  it('should handle pagination next', async () => {
    vi.mocked(apiService.getArticles).mockResolvedValue({
      articles: mockArticles,
      total: 50,
    });

    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Next/i });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(apiService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('should handle pagination previous', async () => {
    vi.mocked(apiService.getArticles).mockResolvedValue({
      articles: mockArticles,
      total: 50,
    });

    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Next/i });
    await userEvent.click(nextButton);

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /Previous/i });
      expect(prevButton).not.toBeDisabled();
      await userEvent.click(prevButton);
    });

    await waitFor(() => {
      expect(apiService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });
  });

  it('should disable previous button on first page', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /Previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should open create modal', async () => {
    render(<ArticlesManager />);

    const newButton = screen.getByRole('button', { name: /New Article/i });
    await userEvent.click(newButton);

    expect(screen.getByText('Create New Article')).toBeInTheDocument();
  });

  it('should open edit modal', async () => {
    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit');
    await userEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Article')).toBeInTheDocument();
  });

  it('should create new article', async () => {
    vi.mocked(apiService.createArticle).mockResolvedValue({
      id: 3,
      title: 'New Article',
    } as any);

    render(<ArticlesManager />);

    const newButton = screen.getByRole('button', { name: /New Article/i });
    await userEvent.click(newButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Article')).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/Enter article title/i);
    const contentInput = screen.getByPlaceholderText(/Write your article/i);

    await userEvent.type(titleInput, 'New Article Title');
    await userEvent.type(contentInput, 'New article content');

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(apiService.createArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Article Title',
          content: 'New article content',
        })
      );
    });
  });

  it('should update existing article', async () => {
    vi.mocked(apiService.updateArticle).mockResolvedValue({
      id: 1,
      title: 'Updated Article',
    } as any);

    render(<ArticlesManager />);

    await waitFor(() => {
      expect(screen.getByText('Understanding LASIK Surgery')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit');
    await userEvent.click(editButtons[0]);

    const titleInput = screen.getByDisplayValue('Understanding LASIK Surgery');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated LASIK Article');

    const submitButton = screen.getByRole('button', { name: /Update Article/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(apiService.updateArticle).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Updated LASIK Article',
        })
      );
    });
  });

  it('should switch between modal tabs', async () => {
    render(<ArticlesManager />);

    const newButton = screen.getByRole('button', { name: /New Article/i });
    await userEvent.click(newButton);

    expect(screen.getByText('Create New Article')).toBeInTheDocument();

    const seoTab = screen.getByRole('button', { name: /SEO/i });
    await userEvent.click(seoTab);

    expect(screen.getByText('Meta Description')).toBeInTheDocument();

    const settingsTab = screen.getByRole('button', { name: /Settings/i });
    await userEvent.click(settingsTab);

    expect(screen.getAllByText('Category')[0]).toBeInTheDocument();
  });

  it('should handle tags as comma-separated values', async () => {
    vi.mocked(apiService.createArticle).mockResolvedValue({
      id: 3,
      title: 'New Article',
    } as any);

    render(<ArticlesManager />);

    const newButton = screen.getByRole('button', { name: /New Article/i });
    await userEvent.click(newButton);

    const titleInput = screen.getByPlaceholderText(/Enter article title/i);
    const contentInput = screen.getByPlaceholderText(/Write your article/i);

    await userEvent.type(titleInput, 'New Article');
    await userEvent.type(contentInput, 'Content');

    const seoTab = screen.getByRole('button', { name: /SEO/i });
    await userEvent.click(seoTab);

    const tagsInput = screen.getByPlaceholderText(/LASIK, vision correction, eye surgery/i);
    await userEvent.type(tagsInput, 'tag1, tag2, tag3');

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(apiService.createArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'],
        })
      );
    });
  });

  it('should close modal on cancel', async () => {
    render(<ArticlesManager />);

    const newButton = screen.getByRole('button', { name: /New Article/i });
    await userEvent.click(newButton);

    expect(screen.getByText('Create New Article')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(screen.queryByText('Create New Article')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(apiService.getArticles).mockRejectedValue(new Error('API Error'));

    render(<ArticlesManager />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch articles:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
