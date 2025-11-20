import React, { useState, useEffect } from 'react';
import { Upload, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { storageService } from '../../services/storageService';

interface BeforeAfterPhoto {
  id: string;
  procedure_type: string;
  before_photo_url: string;
  after_photo_url: string;
  timeframe: string;
  description: string | null;
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
  patient_consent_id: string;
}

export const PhotoGalleryManager: React.FC = () => {
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    procedure_type: 'LASIK',
    timeframe: '3 months',
    description: '',
    patient_email: '',
    patient_name: '',
  });
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('before_after_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeFile || !afterFile) return;

    try {
      setUploading(true);

      const { data: consent, error: consentError } = await supabase
        .from('patient_consents')
        .insert({
          patient_name: uploadData.patient_name,
          patient_email: uploadData.patient_email,
          consent_type: 'photo_usage',
          consent_given: true,
          consent_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (consentError) throw consentError;

      const beforeUrl = await storageService.uploadFile(
        beforeFile,
        'before-after-photos',
        `before-${Date.now()}`
      );

      const afterUrl = await storageService.uploadFile(
        afterFile,
        'before-after-photos',
        `after-${Date.now()}`
      );

      const { error: photoError } = await supabase
        .from('before_after_photos')
        .insert({
          patient_consent_id: consent.id,
          procedure_type: uploadData.procedure_type,
          before_photo_url: beforeUrl,
          after_photo_url: afterUrl,
          timeframe: uploadData.timeframe,
          description: uploadData.description,
          is_published: false,
        });

      if (photoError) throw photoError;

      setShowUploadModal(false);
      setBeforeFile(null);
      setAfterFile(null);
      setUploadData({
        procedure_type: 'LASIK',
        timeframe: '3 months',
        description: '',
        patient_email: '',
        patient_name: '',
      });
      loadPhotos();
    } catch (error) {
      console.error('Failed to upload photos:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const togglePublished = async (photo: BeforeAfterPhoto) => {
    try {
      const { error } = await supabase
        .from('before_after_photos')
        .update({ is_published: !photo.is_published })
        .eq('id', photo.id);

      if (error) throw error;
      loadPhotos();
    } catch (error) {
      console.error('Failed to update photo:', error);
    }
  };

  const toggleFeatured = async (photo: BeforeAfterPhoto) => {
    try {
      const { error } = await supabase
        .from('before_after_photos')
        .update({ is_featured: !photo.is_featured })
        .eq('id', photo.id);

      if (error) throw error;
      loadPhotos();
    } catch (error) {
      console.error('Failed to update photo:', error);
    }
  };

  const deletePhoto = async (photo: BeforeAfterPhoto) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const { error } = await supabase
        .from('before_after_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;
      loadPhotos();
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Before & After Gallery</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Photos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-2 gap-1">
              <img src={photo.before_photo_url} alt="Before" className="w-full h-32 object-cover" />
              <img src={photo.after_photo_url} alt="After" className="w-full h-32 object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{photo.procedure_type}</span>
                <div className="flex items-center space-x-2">
                  {photo.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  {photo.is_published ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-3">{photo.timeframe}</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => togglePublished(photo)}
                  className={`flex-1 px-3 py-1 rounded text-xs ${
                    photo.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {photo.is_published ? 'Published' : 'Draft'}
                </button>
                <button
                  onClick={() => toggleFeatured(photo)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Toggle Featured"
                >
                  <Star className={`w-4 h-4 ${photo.is_featured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={() => deletePhoto(photo)}
                  className="p-1 hover:bg-red-100 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Before & After Photos</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Before Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">After Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Patient Name</label>
                <input
                  type="text"
                  required
                  value={uploadData.patient_name}
                  onChange={(e) => setUploadData({ ...uploadData, patient_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Patient Email</label>
                <input
                  type="email"
                  required
                  value={uploadData.patient_email}
                  onChange={(e) => setUploadData({ ...uploadData, patient_email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Procedure Type</label>
                <select
                  value={uploadData.procedure_type}
                  onChange={(e) => setUploadData({ ...uploadData, procedure_type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="LASIK">LASIK</option>
                  <option value="PRK">PRK</option>
                  <option value="ICL">ICL</option>
                  <option value="Cataract">Cataract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timeframe</label>
                <input
                  type="text"
                  required
                  value={uploadData.timeframe}
                  onChange={(e) => setUploadData({ ...uploadData, timeframe: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 3 months, 6 weeks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
