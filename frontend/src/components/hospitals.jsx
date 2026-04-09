'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, MapPin, Clock, CheckCircle, Star, Stethoscope, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;
const PREVIEW_COUNT = 4;
const AUTO_SLIDE_INTERVAL = 3000;

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse w-full">
    <div className="h-36 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-9 bg-gray-200 rounded-lg" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
    </div>
  </div>
);

const HospitalCard = ({ hospital, fullWidth = false }) => {
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  return (
    <div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 flex flex-col cursor-pointer ${fullWidth ? 'w-full' : 'flex-shrink-0 w-72 md:w-80'}`}
      onClick={() => router.push(`/allHospitals/${hospital.id}`)}
    >
      <div className="relative h-36 w-full overflow-hidden bg-gray-100 shrink-0">
        {hospital.photo && !imgError ? (
          <img src={hospital.photo} alt={hospital.name}
            className="object-cover group-hover:scale-105 transition-transform duration-500 h-full w-full"
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
            <Stethoscope className="w-10 h-10 text-blue-200" />
          </div>
        )}
        {hospital.is_verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <CheckCircle className="w-3 h-3" /> Verified
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight flex-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
            {hospital.name}
          </h3>
          {hospital.rating > 0 && (
            <div className="flex items-center gap-0.5 shrink-0 bg-yellow-50 border border-yellow-100 rounded px-1.5 py-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] font-semibold text-yellow-700">{parseFloat(hospital.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[22px]">
          {Array.isArray(hospital.certifications) && hospital.certifications.length > 0
            ? hospital.certifications.slice(0, 3).map((cert, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">{cert}</span>
            )) : null}
        </div>
        {hospital.phone && (
          <button onClick={e => { e.stopPropagation(); window.location.href = `tel:${hospital.phone}`; }}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors mb-3">
            <Phone className="w-3.5 h-3.5" />{hospital.phone}
          </button>
        )}
        {hospital.address && (
          <div className="flex items-start gap-1.5 text-gray-600 mb-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
              {[hospital.address, hospital.city, hospital.state, hospital.pincode].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
        {hospital.timing_display && (
          <div className="flex items-center gap-1.5 text-gray-600 mb-3">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-xs">{hospital.timing_display}</p>
          </div>
        )}
        {(hospital.total_doctors > 0 || hospital.total_specialities > 0) && (
          <div className="flex gap-2 mb-3 mt-auto">
            {(hospital.real_doctor_count ?? hospital.total_doctors) > 0 && (
              <div className="text-center bg-blue-50 rounded-lg px-2 py-1.5 flex-1">
                <p className="text-xs font-bold text-blue-700">{hospital.real_doctor_count ?? hospital.total_doctors}</p>
                <p className="text-[10px] text-blue-400">Doctors</p>
              </div>
            )}
            {(hospital.real_speciality_count ?? hospital.total_specialities) > 0 && (
              <div className="text-center bg-purple-50 rounded-lg px-2 py-1.5 flex-1">
                <p className="text-xs font-bold text-purple-700">{hospital.real_speciality_count ?? hospital.total_specialities}</p>
                <p className="text-[10px] text-purple-400">Specialities</p>
              </div>
            )}
            {hospital.total_reviews > 0 && (
              <div className="text-center bg-yellow-50 rounded-lg px-2 py-1.5 flex-1">
                <p className="text-xs font-bold text-yellow-700">{hospital.total_reviews}</p>
                <p className="text-[10px] text-yellow-400">Reviews</p>
              </div>
            )}
          </div>
        )}
        {hospital.about && (
          <div className="border-t border-gray-100 pt-3 mt-auto">
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{hospital.about}</p>
          </div>
        )}
        <div className="mt-3 text-xs font-semibold text-blue-600 group-hover:text-blue-800 transition-colors flex items-center gap-1">
          View Details →
        </div>
      </div>
    </div>
  );
};

export default function HospitalsSection({ city = '' }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideRef = useRef(null);
  const router = useRouter();

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const url = city ? `${API}/hospitals?city=${encodeURIComponent(city)}` : `${API}/hospitals`;
      const res = await axios.get(url, { withCredentials: true });
      const data = res.data?.data || res.data || [];
      setHospitals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load hospitals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, [city]);

  const visibleHospitals = hospitals.slice(0, PREVIEW_COUNT);
  const total = visibleHospitals.length;
  const hasMore = hospitals.length > PREVIEW_COUNT;
  const displayCity = city || hospitals[0]?.city || 'Your Area';

  const slideNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    autoSlideRef.current = setInterval(slideNext, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(autoSlideRef.current);
  }, [slideNext, total, isPaused]);

  return (
    <section className="py-8 sm:py-10 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
            {loading ? 'Hospitals Near You' : `Hospitals In ${displayCity}`}
          </h2>
          <div className="h-1 w-14 bg-green-600 rounded-full" />
        </div>

        {/* Skeleton */}
        {loading && (
          <>
            <div className="md:hidden">
              <SkeletonCard />
            </div>
            <div className="hidden md:flex gap-4 overflow-hidden">
              {[...Array(PREVIEW_COUNT)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 md:w-80">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-gray-600 text-sm max-w-sm">{error}</p>
            <button onClick={fetchHospitals}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && hospitals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <Stethoscope className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No hospitals found in {displayCity}.</p>
          </div>
        )}

        {!loading && !error && visibleHospitals.length > 0 && (
          <>
            {/* ── MOBILE: one card at a time, auto-slide ── */}
            <div
              className="md:hidden"
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setTimeout(() => setIsPaused(false), 4000)}
            >
              <div className="relative overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {visibleHospitals.map(h => (
                    <div key={h.id || h.uuid} className="w-full flex-shrink-0">
                      <HospitalCard hospital={h} fullWidth />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dot indicators */}
              {total > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {visibleHospitals.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveIndex(i); setIsPaused(true); setTimeout(() => setIsPaused(false), 6000); }}
                      className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'w-5 h-2 bg-green-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── DESKTOP: original horizontal scroll ── */}
            <div
              className="hidden md:flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {visibleHospitals.map(h => (
                <HospitalCard key={h.id || h.uuid} hospital={h} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => router.push('/allHospitals')}
                  className="group inline-flex items-center gap-2 px-7 py-3 bg-white border-2 border-green-600 text-green-700 font-semibold text-sm rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                  View All {hospitals.length} Hospitals
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}