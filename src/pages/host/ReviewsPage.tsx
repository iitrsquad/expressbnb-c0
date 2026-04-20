import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, MessageSquare, User } from 'lucide-react';

export default function ReviewsPage() {
  const { host } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    if (host?.id) {
      loadReviews();
    }
  }, [host?.id]);

  const loadReviews = async () => {
    if (!host?.id) return;

    try {
      const { data, error } = await supabase
        .from('external_reviews')
        .select('*')
        .eq('host_id', host.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewsData = data || [];
      setReviews(reviewsData);

      if (reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, r) => acc + Number(r.rating || 0), 0);
        const avgRating = sum / total;

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach((r: any) => {
          const rating = Math.round(r.rating);
          if (rating >= 1 && rating <= 5) {
            breakdown[rating as keyof typeof breakdown]++;
          }
        });

        setStats({ avgRating, totalReviews: total, ratingBreakdown: breakdown });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[#cc2b5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-2">Guest feedback and ratings</p>
      </div>

      {stats.totalReviews > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {renderStars(Math.round(stats.avgRating))}
              </div>
              <p className="text-sm text-gray-600 mt-2">{stats.totalReviews} reviews</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Rating Breakdown</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-12">{rating} star</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Reviews from external platforms will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.reviewer_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(review.rating))}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-700 mt-2">{review.review_text}</p>
                    )}
                    {review.platform && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        From {review.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
