'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, AlertCircle, Star, MapPin, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;
const PREVIEW_COUNT = 4;

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-5">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="bg-gray-100 rounded-xl p-3 mb-5 grid grid-cols-2 gap-4">
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-100 rounded-lg" />
        <div className="h-6 w-20 bg-gray-100 rounded-lg" />
      </div>
    </div>
  </div>
);

const DoctorCard = ({ doctor }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
            {doctor.photo && !imgError ? (
              <img src={doctor.photo} alt={doctor.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                👨‍⚕️
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-base font-bold text-gray-900 truncate">{doctor.name}</h3>
              {doctor.is_verified && (
                <span className="shrink-0 w-4 h-4 text-green-500">✓</span>
              )}
            </div>
            {doctor.specialities?.length > 0 && (
              <p className="text-xs text-blue-600 truncate">{doctor.specialities.join(', ')}</p>
            )}
            {doctor.degrees?.length > 0 && (
              <p className="text-xs text-gray-500 truncate">{doctor.degrees.join(', ')}</p>
            )}
            {doctor.city && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{doctor.city}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5 bg-gray-50 rounded-xl p-3">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{doctor.experience_in_years ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">yrs experience</p>
          </div>
          <div className="text-center border-l border-gray-200">
            <p className="text-xl font-bold text-gray-900">{doctor.total_patients_treated > 0 ? `${doctor.total_patients_treated}+` : '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">patients treated</p>
          </div>
        </div>

        {doctor.average_rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(doctor.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{doctor.average_rating}/5</span>
          </div>
        )}

        {doctor.consultation_fee && (
          <p className="text-xs text-green-600 font-semibold mb-3">₹{doctor.consultation_fee} consultation</p>
        )}

        {doctor.specialities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {doctor.specialities.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-100">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Accepts optional `city` prop — filters doctors by city if provided
export default function DoctorsSection({ city = '' }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const url = city
        ? `${API}/doctors?city=${encodeURIComponent(city)}`
        : `${API}/doctors`;
      const res = await axios.get(url, { withCredentials: true });
      const data = res.data?.data || res.data || [];
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, [city]);

  const displayedDoctors = showAll ? doctors : doctors.slice(0, PREVIEW_COUNT);
  const displayCity = city || 'Your Area';

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium uppercase text-gray-900 mb-4">
            {loading ? 'Doctors Near You' : `Doctors In ${displayCity}`}
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Connect with experienced healthcare professionals
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
            {[...Array(PREVIEW_COUNT)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-gray-600 text-sm">{error}</p>
            <button onClick={fetchDoctors}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && doctors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Stethoscope className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 text-sm">No doctors found in {displayCity}.</p>
          </div>
        )}

        {!loading && !error && doctors.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
              {displayedDoctors.map(doc => <DoctorCard key={doc.uuid || doc.id} doctor={doc} />)}
            </div>
            {!showAll && doctors.length > PREVIEW_COUNT && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-white border-2 border-blue-600 text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                  View All {doctors.length} Doctors
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