import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  User,
  MapPin,
  Calendar,
  Award,
  Shield
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Testimonial {
  id: number;
  patient_name: string;
  patient_initials: string;
  age: number;
  occupation: string;
  location: string;
  procedure_type: string;
  vision_before: string;
  vision_after: string;
  testimonial_text: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  is_pacific_patient: boolean;
  is_military: boolean;
  special_badge: string;
  privacy_level: 'full_name' | 'initials' | 'anonymous';
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
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchTestimonials();
  }, [pagination.page, statusFilter, procedureFilter, searchTerm]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        procedure: procedureFilter !== 'all' ? procedureFilter : undefined,
        search: searchTerm || undefined
      };
      
      const data = await apiService.getTestimonials(params);
      setTestimonials(data.testimonials);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await apiService.updateTestimonialStatus(id, status);
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedTestimonials.map(id => apiService.updateTestimonialStatus(id, status))
      );
      setSelectedTestimonials([]);
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to update bulk status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
    const matchesSearch = testimonial.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.testimonial_text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
              <option value="rejected">Rejected</option>
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
                onClick={() => handleBulkStatusUpdate('approved')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                <Check className="h-3 w-3 mr-1 inline" />
                Approve
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('rejected')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                <X className="h-3 w-3 mr-1 inline" />
                Reject
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
                  Procedure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vision
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
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {testimonial.privacy_level === 'full_name' ? testimonial.patient_name : 
                             testimonial.privacy_level === 'initials' ? testimonial.patient_initials : 
                             'Anonymous Patient'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {testimonial.age && `${testimonial.age} years old`}
                            {testimonial.occupation && ` • ${testimonial.occupation}`}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {testimonial.location}
                          </div>
                          <div className="flex items-center mt-1 space-x-1">
                            {testimonial.is_pacific_patient && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Pacific</span>
                            )}
                            {testimonial.is_military && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Military</span>
                            )}
                            {testimonial.special_badge && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                {testimonial.special_badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 text-sm rounded">
                        {testimonial.procedure_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600 font-medium">{testimonial.vision_before}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-600 font-medium">{testimonial.vision_after}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getRatingStars(testimonial.rating)}
                        <span className="ml-2 text-sm text-gray-600">{testimonial.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(testimonial.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(testimonial.created_at).toLocaleDateString()}
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
                        <button
                          onClick={() => handleStatusUpdate(testimonial.id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                          disabled={testimonial.status === 'approved'}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(testimonial.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                          disabled={testimonial.status === 'rejected'}
                        >
                          <X className="h-4 w-4" />
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

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} testimonials
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
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

// Testimonial Create/Edit Modal Component
const TestimonialModal: React.FC<{
  testimonial?: Testimonial | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ testimonial, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_initials: '',
    age: '',
    occupation: '',
    location: '',
    procedure_type: 'LASIK',
    vision_before: '',
    vision_after: '',
    testimonial_text: '',
    rating: 5,
    privacy_level: 'initials',
    is_pacific_patient: false,
    is_military: false,
    special_badge: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setFormData({
        patient_name: testimonial.patient_name,
        patient_initials: testimonial.patient_initials,
        age: testimonial.age?.toString() || '',
        occupation: testimonial.occupation || '',
        location: testimonial.location,
        procedure_type: testimonial.procedure_type,
        vision_before: testimonial.vision_before,
        vision_after: testimonial.vision_after,
        testimonial_text: testimonial.testimonial_text,
        rating: testimonial.rating,
        privacy_level: testimonial.privacy_level,
        is_pacific_patient: testimonial.is_pacific_patient,
        is_military: testimonial.is_military,
        special_badge: testimonial.special_badge || ''
      });
    }
  }, [testimonial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };

      if (testimonial) {
        // Update existing testimonial
        await apiService.updateTestimonial(testimonial.id, submitData);
      } else {
        // Create new testimonial
        await apiService.createTestimonial(submitData);
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
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
                value={formData.patient_name}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Initials
              </label>
              <input
                type="text"
                value={formData.patient_initials}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_initials: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="J.D."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Los Angeles, CA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedure *
              </label>
              <select
                required
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
                Vision Before *
              </label>
              <input
                type="text"
                required
                value={formData.vision_before}
                onChange={(e) => setFormData(prev => ({ ...prev, vision_before: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="20/400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision After *
              </label>
              <input
                type="text"
                required
                value={formData.vision_after}
                onChange={(e) => setFormData(prev => ({ ...prev, vision_after: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="20/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimonial Text *
            </label>
            <textarea
              required
              rows={4}
              value={formData.testimonial_text}
              onChange={(e) => setFormData(prev => ({ ...prev, testimonial_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Share the patient's experience..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Level</label>
              <select
                value={formData.privacy_level}
                onChange={(e) => setFormData(prev => ({ ...prev, privacy_level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="full_name">Full Name</option>
                <option value="initials">Initials Only</option>
                <option value="anonymous">Anonymous</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_pacific_patient}
                onChange={(e) => setFormData(prev => ({ ...prev, is_pacific_patient: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Pacific Region Patient</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_military}
                onChange={(e) => setFormData(prev => ({ ...prev, is_military: e.target.checked }))}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm text-gray-700">Military Service Member</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Badge</label>
            <input
              type="text"
              value={formData.special_badge}
              onChange={(e) => setFormData(prev => ({ ...prev, special_badge: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., First Patient, Milestone Case"
            />
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