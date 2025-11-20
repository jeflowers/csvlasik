import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BeforeAfterPhoto {
  id: string;
  procedure_type: string;
  before_photo_url: string;
  after_photo_url: string;
  timeframe: string;
  description: string | null;
  is_featured: boolean;
  views_count: number;
}

export const BeforeAfterGallery: React.FC = () => {
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<BeforeAfterPhoto | null>(null);
  const [filterProcedure, setFilterProcedure] = useState<string>('all');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('before_after_photos')
        .select('*')
        .eq('is_published', true)
        .order('display_order')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = async (photo: BeforeAfterPhoto) => {
    setSelectedPhoto(photo);

    try {
      await supabase
        .from('before_after_photos')
        .update({ views_count: photo.views_count + 1 })
        .eq('id', photo.id);
    } catch (error) {
      console.error('Failed to update view count:', error);
    }
  };

  const filteredPhotos = filterProcedure === 'all'
    ? photos
    : photos.filter(p => p.procedure_type === filterProcedure);

  const procedures = Array.from(new Set(photos.map(p => p.procedure_type)));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Before & After Gallery</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See the incredible results our patients have achieved with their vision correction procedures.
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-300 p-1">
          <button
            onClick={() => setFilterProcedure('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterProcedure === 'all'
                ? 'bg-teal-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Procedures
          </button>
          {procedures.map((procedure) => (
            <button
              key={procedure}
              onClick={() => setFilterProcedure(procedure)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterProcedure === procedure
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {procedure}
            </button>
          ))}
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No photos available for this procedure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="relative">
                  <img
                    src={photo.before_photo_url}
                    alt="Before"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                    BEFORE
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={photo.after_photo_url}
                    alt="After"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    AFTER
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {photo.procedure_type}
                  </span>
                  {photo.is_featured && (
                    <span className="text-yellow-500 text-sm">★ Featured</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{photo.timeframe}</p>
                {photo.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">{photo.description}</p>
                )}
                <div className="flex items-center text-xs text-gray-500 mt-3">
                  <Eye className="w-4 h-4 mr-1" />
                  {photo.views_count} views
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-6xl w-full bg-white rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative bg-gray-100">
                <img
                  src={selectedPhoto.before_photo_url}
                  alt="Before"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded text-sm font-semibold">
                  BEFORE
                </div>
              </div>
              <div className="relative bg-gray-100">
                <img
                  src={selectedPhoto.after_photo_url}
                  alt="After"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 bg-teal-600 text-white px-4 py-2 rounded text-sm font-semibold">
                  AFTER
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedPhoto.procedure_type}
                </h3>
                <span className="text-gray-600">{selectedPhoto.timeframe}</span>
              </div>
              {selectedPhoto.description && (
                <p className="text-gray-700">{selectedPhoto.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
