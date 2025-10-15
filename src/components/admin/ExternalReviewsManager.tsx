import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReviewSource {
  id: string;
  source_name: string;
  display_name: string;
  profile_url: string;
  average_rating: number | null;
  total_reviews: number;
  last_synced_at: string | null;
  active: boolean;
}

interface ExternalReview {
  id: number;
  name: string;
  content: string;
  rating: number;
  source: string;
  source_url: string | null;
  verified: boolean;
  reviewer_location: string | null;
  published_date: string | null;
  helpful_count: number;
  approved: boolean;
}

const ExternalReviewsManager: React.FC = () => {
  const [sources, setSources] = useState<ReviewSource[]>([]);
  const [reviews, setReviews] = useState<ExternalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sourcesResult, reviewsResult] = await Promise.all([
        supabase.from('review_sources').select('*').order('source_name'),
        supabase
          .from('testimonials')
          .select('*')
          .neq('source', 'internal')
          .order('created_at', { ascending: false })
      ]);

      if (sourcesResult.data) setSources(sourcesResult.data);
      if (reviewsResult.data) setReviews(reviewsResult.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (sourceId: string, currentActive: boolean) => {
    try {
      await supabase
        .from('review_sources')
        .update({ active: !currentActive, updated_at: new Date().toISOString() })
        .eq('id', sourceId);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle source:', error);
    }
  };

  const handleApproveReview = async (reviewId: number, currentApproved: boolean) => {
    try {
      await supabase
        .from('testimonials')
        .update({ approved: !currentApproved })
        .eq('id', reviewId);
      fetchData();
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await supabase.from('testimonials').delete().eq('id', reviewId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">External Reviews</h1>
          <p className="text-gray-600">Manage reviews from trusted medical platforms</p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Import Reviews
        </button>
      </div>

      {/* Review Sources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Platforms</h2>
        <div className="space-y-4">
          {sources.map((source) => (
            <div
              key={source.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{source.display_name}</h3>
                  {source.active ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <a
                    href={source.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 flex items-center"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>

                  {source.average_rating && (
                    <span>Rating: {source.average_rating.toFixed(1)}/5</span>
                  )}

                  <span>{source.total_reviews} reviews</span>

                  {source.last_synced_at && (
                    <span>
                      Last synced: {new Date(source.last_synced_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedSource(source.source_name);
                    setShowImportModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                  title="Import Reviews"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleActive(source.id, source.active)}
                  className="text-gray-600 hover:text-gray-700"
                  title={source.active ? 'Deactivate' : 'Activate'}
                >
                  <Shield className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Imported Reviews */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Imported Reviews ({reviews.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No imported reviews yet. Click "Import Reviews" to get started.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{review.name}</div>
                        {review.reviewer_location && (
                          <div className="text-sm text-gray-500">{review.reviewer_location}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {review.source.toUpperCase()}
                        </span>
                        {review.verified && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-medium">{review.rating}</span>
                        <span className="text-gray-400 ml-1">/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {review.published_date
                        ? new Date(review.published_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {review.approved ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApproveReview(review.id, review.approved)}
                          className={review.approved ? 'text-yellow-600' : 'text-green-600'}
                          title={review.approved ? 'Unapprove' : 'Approve'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        {review.source_url && (
                          <a
                            href={review.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                            title="View Original"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportReviewsModal
          sources={sources}
          selectedSource={selectedSource}
          onClose={() => {
            setShowImportModal(false);
            setSelectedSource('');
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const ImportReviewsModal: React.FC<{
  sources: ReviewSource[];
  selectedSource: string;
  onClose: () => void;
}> = ({ sources, selectedSource, onClose }) => {
  const [formData, setFormData] = useState({
    source: selectedSource || 'webmd',
    name: '',
    content: '',
    rating: 5,
    reviewer_location: '',
    published_date: '',
    source_url: '',
    helpful_count: 0
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await supabase.from('testimonials').insert({
        ...formData,
        verified: true,
        approved: false,
        published_date: formData.published_date || null
      });

      await supabase
        .from('review_sources')
        .update({
          total_reviews: supabase.sql`total_reviews + 1`,
          last_synced_at: new Date().toISOString()
        })
        .eq('source_name', formData.source);

      onClose();
    } catch (error) {
      console.error('Failed to import review:', error);
      alert('Failed to import review. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Import External Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Source *
            </label>
            <select
              required
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {sources.map((source) => (
                <option key={source.id} value={source.source_name}>
                  {source.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reviewer Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="John D."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Content *
            </label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter the review text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <select
                required
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Date
              </label>
              <input
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reviewer Location
            </label>
            <input
              type="text"
              value={formData.reviewer_location}
              onChange={(e) => setFormData({ ...formData, reviewer_location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source URL
            </label>
            <input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Importing...' : 'Import Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExternalReviewsManager;
