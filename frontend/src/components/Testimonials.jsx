"use client";
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, User } from 'lucide-react';
import { useLanguage } from '@/context/languageContext';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

/* ── Skeleton Card ────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white/90 border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-md animate-pulse">
    <div className="flex justify-center gap-1 mb-3">
      {[...Array(5)].map((_, i) => <div key={i} className="w-4 h-4 bg-gray-200 rounded-full" />)}
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto" />
      <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto" />
    </div>
    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-2 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-2 bg-gray-100 rounded w-16" />
        <div className="h-2 bg-gray-100 rounded w-12" />
      </div>
    </div>
  </div>
);

/* ── Testimonial Card ─────────────────────────────────────────────────── */
const TestimonialCard = ({ name, treatment, description, city, date, rating, lang }) => {
  const displayDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div className="group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3 sm:mb-4 justify-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            i < (rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          }`} />
        ))}
      </div>

      {/* Review */}
      <blockquote className="text-gray-800 text-sm sm:text-base leading-relaxed italic mb-4 sm:mb-5 text-center relative z-10 line-clamp-4">
        &ldquo;{description}&rdquo;
      </blockquote>

      {/* Patient Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-base text-gray-900">{name}</h4>
            {treatment && (
              <p className="text-xs text-emerald-600 font-semibold">
                {lang === 'en' ? 'Treatment:' : 'उपचार:'} {treatment}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{city}
            </div>
          )}
          {displayDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />{displayDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────────────────── */
export default function PatientTestimonials() {
  const { lang } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/users/reviews`, { withCredentials: true });
        // Response shape: { count: N, data: [...] }
        const data = res.data?.data || res.data || [];
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const sectionTitle = lang === 'en' ? 'Our Patients Love Us' : 'हमारे मरीज हमें पसंद करते हैं';

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-yellow-50/50 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Title */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif uppercase font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            {sectionTitle}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {lang === 'en'
              ? `${reviews.length > 0 ? `${reviews.length}+` : '500+'} Happy Patients • 100% Success Rate`
              : `${reviews.length > 0 ? `${reviews.length}+` : '500+'} खुश मरीज • 100% सफलता दर`}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error — fallback to empty gracefully */}
        {!loading && error && (
          <div className="text-center py-10 text-gray-400 text-sm">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            {lang === 'en' ? 'No reviews yet. Be the first to share!' : 'अभी कोई समीक्षा नहीं है।'}
          </div>
        )}

        {/* Reviews Grid — show max 6 on homepage */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {reviews.slice(0, 6).map((review, index) => (
              <TestimonialCard
                key={review.id || review.uuid || index}
                {...review}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}