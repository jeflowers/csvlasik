import React, { useEffect, useState } from 'react';
import { Star, ExternalLink, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewSource {
  id: string;
  source_name: string;
  display_name: string;
  profile_url: string;
  logo_url: string | null;
  average_rating: number | null;
  total_reviews: number;
  active: boolean;
}

interface Review {
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
}

const ExternalReviews: React.FC = () => {
  const [reviewSources, setReviewSources] = useState<ReviewSource[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sourcesResult, reviewsResult] = await Promise.all([
        supabase
          .from('review_sources')
          .select('*')
          .eq('active', true)
          .order('total_reviews', { ascending: false }),
        supabase
          .from('testimonials')
          .select('*')
          .eq('approved', true)
          .neq('source', 'internal')
          .order('published_date', { ascending: false })
          .limit(20)
      ]);

      if (sourcesResult.data) setReviewSources(sourcesResult.data);
      if (reviewsResult.data) setReviews(reviewsResult.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSourceBadgeColor = (source: string) => {
    const colors: Record<string, string> = {
      webmd: 'bg-blue-100 text-blue-800 border-blue-200',
      vitals: 'bg-green-100 text-green-800 border-green-200',
      usnews: 'bg-red-100 text-red-800 border-red-200',
      google: 'bg-purple-100 text-purple-800 border-purple-200',
      healthgrades: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[source] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Review Sources Summary */}
      {reviewSources.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-teal-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Verified Reviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviewSources.map((source) => (
              <a
                key={source.id}
                href={source.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{source.display_name}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>

                {source.average_rating && (
                  <div className="mb-2">
                    {renderStars(Math.round(source.average_rating))}
                    <span className="text-sm text-gray-600 ml-2">
                      {source.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  {source.total_reviews} {source.total_reviews === 1 ? 'review' : 'reviews'}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Verified Reviews</h3>

          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      {review.verified && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {review.reviewer_location && (
                        <span>{review.reviewer_location}</span>
                      )}
                      {review.published_date && (
                        <span>
                          {new Date(review.published_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-xs rounded-full border ${getSourceBadgeColor(review.source)}`}>
                    {review.source.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {review.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {review.helpful_count > 0 && (
                    <span className="text-sm text-gray-600">
                      {review.helpful_count} people found this helpful
                    </span>
                  )}

                  {review.source_url && (
                    <a
                      href={review.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                    >
                      View original review
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-teal-900 mb-2">
          Share Your Experience
        </h3>
        <p className="text-teal-700 mb-4">
          Had a positive experience? Help others by leaving a review on these trusted platforms.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {reviewSources.map((source) => (
            <a
              key={source.id}
              href={source.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-teal-600 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
            >
              Review on {source.display_name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExternalReviews;
