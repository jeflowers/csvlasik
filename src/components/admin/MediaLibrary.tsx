import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Trash2,
  Edit,
  Download,
  Eye,
  Grid,
  List,
  FolderOpen
} from 'lucide-react';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storageService';

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video' | 'document';
  category: string;
  alt_text: string;
  caption: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

const MediaLibrary: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0 });

  const categories = ['Medical', 'Educational', 'Testimonial', 'Team', 'Facility', 'Other'];

  useEffect(() => {
    fetchMediaFiles();
  }, [pagination.page, typeFilter, categoryFilter, searchTerm]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined
      };
      
      const data = await apiService.getMedia(params);
      setMediaFiles(data.media);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error('Failed to fetch media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const category = categoryFilter !== 'all' ? categoryFilter.toLowerCase() : 'general';
          const result = await storageService.uploadMediaFile(file, category);

          await apiService.uploadMedia(file, {
            category: categoryFilter !== 'all' ? categoryFilter : 'Other',
            alt_text: '',
            caption: '',
            file_path: result.publicUrl
          });

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      fetchMediaFiles();

      if (errorCount > 0) {
        alert(`Upload completed:\n${successCount} succeeded, ${errorCount} failed\n\nErrors:\n${errors.join('\n')}`);
      } else {
        alert(`Successfully uploaded ${successCount} file(s)`);
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }, [categoryFilter]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await apiService.deleteMedia(id);
        alert('File deleted successfully');
        fetchMediaFiles();
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
      try {
        await apiService.bulkDeleteMedia(selectedFiles);
        alert(`Successfully deleted ${selectedFiles.length} file(s)`);
        setSelectedFiles([]);
        fetchMediaFiles();
      } catch (error) {
        console.error('Failed to delete files:', error);
        alert(`Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mediaType: string, mimeType: string) => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Upload and manage images, videos, and documents</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <label className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4 mr-2 inline" />
            Upload Files
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors"
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Drop files here to upload</p>
        <p className="text-gray-500">or click the Upload Files button above</p>
        <p className="text-xs text-gray-400 mt-2">
          Supported: Images (JPG, PNG, WebP), Videos (MP4, MOV), Documents (PDF, DOC, DOCX)
        </p>
        {uploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-sm text-teal-600 mt-2">Uploading files...</p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-teal-900">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1 inline" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedFiles([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

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
                placeholder="Search files..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {loading ? (
                [...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))
              ) : filteredFiles.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  No files found
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div key={file.id} className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square flex items-center justify-center">
                      {file.media_type === 'image' ? (
                        <img
                          src={file.file_path}
                          alt={file.alt_text || file.original_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          {getFileIcon(file.media_type, file.mime_type)}
                          <span className="text-xs text-gray-600 mt-2 text-center px-2">
                            {file.original_name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingFile(file)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(file.file_path, '_blank')}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* File Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                      <p className="text-white text-xs truncate">{file.original_name}</p>
                      <p className="text-white text-xs opacity-75">{formatFileSize(file.file_size)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(filteredFiles.map(f => f.id));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No files found
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles([...selectedFiles, file.id]);
                            } else {
                              setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {file.media_type === 'image' ? (
                              <img
                                src={file.file_path}
                                alt={file.alt_text || file.original_name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                {getFileIcon(file.media_type, file.mime_type)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.original_name}</div>
                            <div className="text-sm text-gray-500">{file.filename}</div>
                            {file.alt_text && (
                              <div className="text-xs text-gray-400 mt-1">Alt: {file.alt_text}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getFileIcon(file.media_type, file.mime_type)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{file.media_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {file.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{new Date(file.created_at).toLocaleDateString()}</div>
                        <div className="text-xs">by {file.uploaded_by_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingFile(file)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => window.open(file.file_path, '_blank')}
                            className="text-green-600 hover:text-green-900"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={file.file_path}
                            download={file.original_name}
                            className="text-purple-600 hover:text-purple-900"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-900"
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
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} files
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

      {/* Edit File Modal */}
      {editingFile && (
        <FileEditModal
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={() => {
            setEditingFile(null);
            fetchMediaFiles();
          }}
        />
      )}
    </div>
  );
};

// File Edit Modal Component
const FileEditModal: React.FC<{
  file: MediaFile;
  onClose: () => void;
  onSave: () => void;
}> = ({ file, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: file.category || '',
    alt_text: file.alt_text || '',
    caption: file.caption || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiService.updateMedia(file.id, formData);
      onSave();
    } catch (error) {
      console.error('Failed to update file:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Edit File Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4">
            {file.media_type === 'image' ? (
              <img
                src={file.file_path}
                alt={file.alt_text || file.original_name}
                className="w-24 h-24 object-cover rounded"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                {getFileIcon(file.media_type, file.mime_type)}
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900">{file.original_name}</h4>
              <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
              <p className="text-xs text-gray-400">{file.mime_type}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Category</option>
              {['Medical', 'Educational', 'Testimonial', 'Team', 'Facility', 'Other'].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {file.media_type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text (for accessibility)
              </label>
              <input
                type="text"
                value={formData.alt_text}
                onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe the image for screen readers..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
            <textarea
              rows={3}
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Optional caption or description..."
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
              {saving ? 'Saving...' : 'Update File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaLibrary;