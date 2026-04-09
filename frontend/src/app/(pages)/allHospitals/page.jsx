'use client';
import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, CheckCircle, Star, Stethoscope, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-28 bg-gray-100" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-7 bg-gray-200 rounded-lg" />
      <div className="h-3 bg-gray-100 rounded w-full" />
    </div>
  </div>
);

const HospitalCard = ({ hospital }) => {
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  return (
    <div
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 flex flex-col h-full hover:-translate-y-0.5 cursor-pointer"
      onClick={() => router.push(`/allHospitals/${hospital.id}`)}
    >
      {/* Image — shorter on desktop */}
      <div className="relative h-32 sm:h-28 w-full overflow-hidden bg-gray-100 shrink-0">
        {hospital.photo && !imgError ? (
          <img
            src={hospital.photo}
            alt={hospital.name}
            className="object-cover group-hover:scale-105 transition-transform duration-500 h-full w-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
            <Stethoscope className="w-8 h-8 text-blue-200" />
          </div>
        )}
        {hospital.is_verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <CheckCircle className="w-3 h-3" /> Verified
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Name + Rating */}
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <h3 className="text-xs font-semibold text-gray-900 leading-tight flex-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
            {hospital.name}
          </h3>
          {hospital.rating > 0 && (
            <div className="flex items-center gap-0.5 shrink-0 bg-yellow-50 border border-yellow-100 rounded px-1.5 py-0.5">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-semibold text-yellow-700">
                {parseFloat(hospital.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap gap-1 mb-2 min-h-[18px]">
          {Array.isArray(hospital.certifications) && hospital.certifications.length > 0
            ? hospital.certifications.slice(0, 3).map((cert, i) => (
              <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                {cert}
              </span>
            ))
            : null}
        </div>

        {/* Call Button */}
        {hospital.phone && (
          <button
            onClick={e => { e.stopPropagation(); window.location.href = `tel:${hospital.phone}`; }}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors mb-2"
          >
            <Phone className="w-3 h-3" />
            {hospital.phone}
          </button>
        )}

        {/* Address */}
        {hospital.address && (
          <div className="flex items-start gap-1 text-gray-600 mb-1.5">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-500 line-clamp-1 leading-tight">
              {[hospital.address, hospital.city, hospital.state, hospital.pincode].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        {/* Timings */}
        {hospital.timing_display && (
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            <p className="text-[11px]">{hospital.timing_display}</p>
          </div>
        )}

        {/* Stats */}
        {(hospital.total_doctors > 0 || hospital.total_specialities > 0) && (
          <div className="flex gap-1.5 mb-2 mt-auto">
            {hospital.total_doctors > 0 && (
              <div className="text-center bg-blue-50 rounded-lg px-2 py-1 flex-1">
                <p className="text-xs font-bold text-blue-700">{hospital.total_doctors}</p>
                <p className="text-[9px] text-blue-400">Doctors</p>
              </div>
            )}
            {hospital.total_specialities > 0 && (
              <div className="text-center bg-purple-50 rounded-lg px-2 py-1 flex-1">
                <p className="text-xs font-bold text-purple-700">{hospital.total_specialities}</p>
                <p className="text-[9px] text-purple-400">Specialities</p>
              </div>
            )}
            {hospital.total_reviews > 0 && (
              <div className="text-center bg-yellow-50 rounded-lg px-2 py-1 flex-1">
                <p className="text-xs font-bold text-yellow-700">{hospital.total_reviews}</p>
                <p className="text-[9px] text-yellow-400">Reviews</p>
              </div>
            )}
          </div>
        )}

        {/* About */}
        {hospital.about && (
          <div className="border-t border-gray-100 pt-2 mt-auto">
            <p className="text-[11px] text-gray-400 line-clamp-1 leading-relaxed">{hospital.about}</p>
          </div>
        )}

        <div className="mt-2 text-[11px] font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
          View Details →
        </div>
      </div>
    </div>
  );
};

export default function AllHospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
     const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/hospitals`, { 
    withCredentials: true 
});
      const data = res.data?.data || res.data || [];
      setHospitals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, []);

  const cityName = hospitals[0]?.city || 'Your Area';

  return (
    <div className="min-h-screen bg-[#f8f8f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-20 pb-20">

        {/* Header */}
        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
            <h2
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-3xl sm:text-4xl font-normal text-gray-900 mb-2"
            >
              {loading ? 'Hospitals Near You' : `Hospitals in ${cityName}`}
            </h2>
            <div className="h-0.5 w-16 bg-green-500 rounded-full" />
          </div>
          {!loading && hospitals.length > 0 && (
            <span className="text-sm text-gray-400">
              {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-gray-500 text-sm max-w-xs">{error}</p>
            <button
              onClick={fetchHospitals}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && hospitals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Stethoscope className="w-12 h-12 text-gray-200" />
            <p className="text-gray-400 text-sm">No hospitals found at the moment.</p>
          </div>
        )}

        {/* Grid — 4 columns on desktop for compact look */}
        {!loading && !error && hospitals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {hospitals.map(h => (
              <HospitalCard key={h.id || h.uuid} hospital={h} />
            ))}
          </div>
        )}

      </section>

      <Footer />
    </div>
  );
}