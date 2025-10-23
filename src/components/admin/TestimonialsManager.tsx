import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Check,
  X,
  Edit,
  Star,
  Calendar
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Testimonial {
  id: number;
  name: string;
  email?: string;
  content: string;
  rating?: number;
  procedure_type?: string;
  procedure_date?: string;
  image_url?: string;
  video_url?: string;
  video_type?: 'youtube' | 'vimeo' | 'uploaded';
  video_thumbnail?: string;
  approved: boolean;
  created_at: string;
}

const TestimonialsManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [procedureFilter, setProcedureFilter] = useState('all');
  const [selectedTestimonials, setSelectedTestimonials] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [statusFilter, procedureFilter, searchTerm]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (procedureFilter !== 'all') {
        params.procedure = procedureFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const data = await apiService.getTestimonials(params);
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, approved: boolean) => {
    try {
      await apiService.updateTestimonial(id, { approved });
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(
        selectedTestimonials.map(id => apiService.updateTestimonial(id, { approved: true }))
      );
      setSelectedTestimonials([]);
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to update bulk status:', error);
    }
  };

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (statusFilter === 'pending' && testimonial.approved) return false;
    if (statusFilter === 'approved' && !testimonial.approved) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return testimonial.name.toLowerCase().includes(searchLower) ||
             testimonial.content.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600">Manage patient testimonials and success stories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-2 inline" />
          Add Testimonial
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search testimonials..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Procedure</label>
            <select
              value={procedureFilter}
              onChange={(e) => setProcedureFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Procedures</option>
              <option value="LASIK">LASIK</option>
              <option value="PRK">PRK</option>
              <option value="ICL">ICL</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setProcedureFilter('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTestimonials.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-teal-900">
              {selectedTestimonials.length} testimonial(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                <Check className="h-3 w-3 mr-1 inline" />
                Approve Selected
              </button>
              <button
                onClick={() => setSelectedTestimonials([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTestimonials.length === filteredTestimonials.length && filteredTestimonials.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTestimonials(filteredTestimonials.map(t => t.id));
                      } else {
                        setSelectedTestimonials([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Testimonial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTestimonials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No testimonials found
                  </td>
                </tr>
              ) : (
                filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTestimonials.includes(testimonial.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTestimonials([...selectedTestimonials, testimonial.id]);
                          } else {
                            setSelectedTestimonials(selectedTestimonials.filter(id => id !== testimonial.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                      {testimonial.email && (
                        <div className="text-xs text-gray-500">{testimonial.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                        {testimonial.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                        {testimonial.procedure_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getRatingStars(testimonial.rating || 5)}
                        <span className="ml-2 text-xs text-gray-600">{testimonial.rating || 5}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        testimonial.approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {testimonial.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(testimonial.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingTestimonial(testimonial)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!testimonial.approved && (
                          <button
                            onClick={() => handleStatusUpdate(testimonial.id, true)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {testimonial.approved && (
                          <button
                            onClick={() => handleStatusUpdate(testimonial.id, false)}
                            className="text-red-600 hover:text-red-900"
                            title="Unapprove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTestimonial) && (
        <TestimonialModal
          testimonial={editingTestimonial}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTestimonial(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingTestimonial(null);
            fetchTestimonials();
          }}
        />
      )}
    </div>
  );
};

const TestimonialModal: React.FC<{
  testimonial?: Testimonial | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ testimonial, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
    procedure_type: 'LASIK',
    procedure_date: '',
    rating: 5,
    image_url: '',
    video_url: '',
    video_type: 'youtube' as 'youtube' | 'vimeo' | 'uploaded',
    video_thumbnail: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        email: testimonial.email || '',
        content: testimonial.content,
        procedure_type: testimonial.procedure_type || 'LASIK',
        procedure_date: testimonial.procedure_date || '',
        rating: testimonial.rating || 5,
        image_url: testimonial.image_url || '',
        video_url: testimonial.video_url || '',
        video_type: testimonial.video_type || 'youtube',
        video_thumbnail: testimonial.video_thumbnail || ''
      });
    }
  }, [testimonial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (testimonial) {
        await apiService.updateTestimonial(testimonial.id, formData);
      } else {
        await apiService.createTestimonial({ ...formData, approved: false });
      }

      onSave();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      alert('Failed to save testimonial. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="patient@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedure
              </label>
              <select
                value={formData.procedure_type}
                onChange={(e) => setFormData(prev => ({ ...prev, procedure_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="LASIK">LASIK</option>
                <option value="PRK">PRK</option>
                <option value="ICL">ICL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedure Date
              </label>
              <input
                type="date"
                value={formData.procedure_date}
                onChange={(e) => setFormData(prev => ({ ...prev, procedure_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimonial *
            </label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Share the patient's experience..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value={5}>5 Stars - Excellent</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Good</option>
              <option value={2}>2 Stars - Fair</option>
              <option value={1}>1 Star - Poor</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Media (Optional)</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Photo / Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="https://example.com/patient-photo.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">Upload images in Media Library and paste URL here</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL / ID
                  </label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="YouTube ID or video URL"
                  />
                  <p className="mt-1 text-xs text-gray-500">YouTube ID: dQw4w9WgXcQ or full URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Type
                  </label>
                  <select
                    value={formData.video_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_type: e.target.value as 'youtube' | 'vimeo' | 'uploaded' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="uploaded">Uploaded File</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.video_thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_thumbnail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="https://example.com/video-thumbnail.jpg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
              {saving ? 'Saving...' : testimonial ? 'Update Testimonial' : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialsManager;
