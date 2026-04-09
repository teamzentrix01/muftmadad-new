'use client';
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
    <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <div key={i} className="w-4 h-4 bg-gray-200 rounded-full" />)}</div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-4/6" />
    </div>
    <div className="flex justify-between pt-3 border-t border-gray-100">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  </div>
);

const TestimonialCard = ({ review }) => {
  const displayDate = review.date
    ? new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{review.name}</h3>
            {review.treatment && (
              <p className="text-xs text-emerald-600 font-medium">Treatment: {review.treatment}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1 mb-4">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
          "{review.description}"
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        {review.city && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />{review.city}
          </div>
        )}
        {displayDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />{displayDate}
          </div>
        )}
      </div>
    </div>
  );
};

const CARDS_PER_PAGE = 4;

// ✅ Accepts optional `city` prop — filters reviews by city if provided
export default function DynamicTestimonialSection({ city = '' }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Use city filter endpoint if city provided, else fetch all
        const url = city
          ? `${API}/users/reviews/${encodeURIComponent(city)}`
          : `${API}/users/reviews`;
        const res = await axios.get(url, { withCredentials: true });
        const data = res.data?.data || res.data || [];
        setReviews(Array.isArray(data) ? data : []);
        setCurrentPage(0); // reset page when city changes
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [city]);

  const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
  const displayed = reviews.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {city ? `What Patients in ${city} Say` : 'What Our Patients Say'}
          </h2>
          <p className="text-gray-600">Real experiences from real people</p>
          <div className="h-1 w-20 bg-blue-600 rounded-full mx-auto mt-4"></div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(CARDS_PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && reviews.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No reviews found{city ? ` for ${city}` : ''} yet.
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && reviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {displayed.map((review, i) => (
                <TestimonialCard key={review.id || review.uuid || i} review={review} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i)}
                      className={`h-2 rounded-full transition-all duration-200 ${i === currentPage ? 'bg-blue-600 w-8' : 'w-2 bg-gray-300 hover:bg-gray-400'}`} />
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl font-bold text-blue-600 mb-2">5000+</p>
            <p className="text-gray-600">Happy Patients</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl font-bold text-green-600 mb-2">4.8/5</p>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl font-bold text-purple-600 mb-2">50+</p>
            <p className="text-gray-600">Cities Covered</p>
          </div>
        </div>
      </div>
    </section>
  );
}