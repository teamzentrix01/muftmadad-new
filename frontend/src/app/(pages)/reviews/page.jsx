'use client';

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Sparkles, Award, Heart, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const ReviewsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [treatments, setTreatments] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    successRate: 100
  });

  // Fetch reviews from API
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/reviews`, {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

      // ✅ FIX: Backend returns { count, data: [...] }, not { reviews: [...] }
      const reviewsData = response.data.data || [];
      setReviews(reviewsData);

      const uniqueTreatments = ['all', ...new Set(reviewsData.map(r => r.treatment).filter(Boolean))];
      setTreatments(uniqueTreatments);

      calculateStats(reviewsData);

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.response?.data?.message || 'Failed to load reviews. Please try again later.');
      // ✅ FIX: No more sample data — show empty state on error
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();
  const handleNavigation = () => {
    router.push('/add_user_reviews');
  };


  const calculateStats = (reviewsData) => {
    if (reviewsData.length === 0) {
      setStats({ averageRating: 0, totalReviews: 0, successRate: 100 });
      return;
    }

    const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
    const avgRating = (totalRating / reviewsData.length).toFixed(1);

    setStats({
      averageRating: avgRating,
      totalReviews: reviewsData.length,
      successRate: 100
    });
  };

  const filteredReviews = activeFilter === 'all'
    ? reviews
    : reviews.filter(r => r.treatment === activeFilter);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Unknown') return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
                ? 'fill-amber-200 text-amber-400'
                : 'fill-gray-200 text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-14 md:py-22">
      <Navbar />

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-1">Notice</h3>
              <p className="text-yellow-800">{error}</p>
              <p className="text-sm text-yellow-700 mt-2">Showing sample data for demonstration.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-blue-400 py-16 px-4">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-semibold">Trusted by 10,000+ Patients</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-orange-500 mb-6 tracking-tight leading-tight">
                Real Stories,<br />
                <span className="text-blue-900">Real Results</span>
              </h1>

              <p className="text-lg md:text-xl mb-8 leading-relaxed text-white">
                Discover how Muftmadad has transformed thousands of lives with compassionate care and expert treatment. Your journey to better health starts here.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                  <div className="text-3xl font-bold text-blue-600">{stats.averageRating}★</div>
                  <div className="text-sm text-gray-600 mt-1">Patient Rating</div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalReviews}+</div>
                  <div className="text-sm text-gray-600 mt-1">Success Stories</div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                  <div className="text-3xl font-bold text-blue-600">{stats.successRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">Free Care</div>
                </div>
              </div>
            </div>

            {/* Right Decorative Element */}
            <div className="hidden md:block relative">
              <div className="relative w-full h-80">
                {/* Floating Cards Animation */}
                <div className="absolute top-0 right-0 bg-white rounded-2xl shadow-2xl p-6 w-64 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-orange-500 font-bold text-lg">
                      R
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">Ramesh Kumar</div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-blue-400 text-blue-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">"Life-changing treatment!"</p>
                </div>

                <div className="absolute bottom-0 left-0 bg-white rounded-2xl shadow-2xl p-6 w-64 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-orange-500 font-bold text-lg">
                      P
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">Priya Singh</div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-blue-400 text-blue-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">"Best care ever received!"</p>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full w-32 h-32 flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-16 h-16 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium uppercase text-gray-900">Filter by Treatment</h3>
            <button
              onClick={fetchReviews}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {treatments.map((treatment) => (
              <button
                key={treatment}
                onClick={() => setActiveFilter(treatment)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${activeFilter === treatment
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {treatment === 'all' ? `All Reviews (${reviews.length})` : treatment}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <p className="text-gray-600 font-medium">
          Showing <span className="font-bold text-blue-600">{filteredReviews.length}</span> {filteredReviews.length === 1 ? 'review' : 'reviews'}
          {activeFilter !== 'all' && ` for ${activeFilter}`}
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-300 transform hover:-translate-y-2"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full"></div>

              {/* Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Verified
                </div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                    {review.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {review.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-sm font-semibold text-gray-600">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Treatment Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg mb-4">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">
                    {review.treatment}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-4">
                  "{review.description}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{review.city || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(review.date)}</span>
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600 mb-6">Try selecting a different treatment category</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Reviews
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-400 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white mb-8">
            Join thousands of satisfied patients who trusted Muftmadad for their treatment
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => handleNavigation()}>
            Book Free Consultation
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewsPage;