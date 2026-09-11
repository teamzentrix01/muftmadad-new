'use client'
import React, { useState, useEffect } from 'react';
import { User, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import Link from 'next/link';

const DoctorCard = ({ doctor }) => {
    return (
        <div className="rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Doctor Header */}
            <div className="flex items-center gap-4 mb-4">
                {/* Doctor img */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white/30 shrink-0 bg-white">
                    {doctor.photo ? (
                        <img
                            src={doctor.photo}
                            alt={doctor.name}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <User className="w-8 h-8 text-blue-600" />
                        </div>
                    )}
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium font-serif text-black mb-1 truncate">
                        {doctor.name}
                    </h3>
                    <p className="text-sm text-blue-600 truncate">
                        {/* Show first speciality */}
                        {Array.isArray(doctor.specialities) && doctor.specialities.length > 0
                            ? doctor.specialities[0]
                            : 'General Physician'}
                    </p>
                </div>
            </div>

            {/* Degrees & Experience */}
            <div className="mb-4">
                <p className="text-sm text-black/90">
                    {/* Join degrees array into readable string */}
                    {Array.isArray(doctor.degrees) && doctor.degrees.length > 0
                        ? doctor.degrees.join(', ')
                        : 'N/A'}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                    {doctor.experience_in_years
                        ? `${doctor.experience_in_years} Years Experience Overall`
                        : 'Experience not listed'}
                </p>
            </div>

            {/* City */}
            {doctor.city && (
                <p className="text-xs text-gray-400 mb-4 truncate">
                    📍 {doctor.city}{doctor.state ? `, ${doctor.state}` : ''}
                </p>
            )}

            {/* View Details Button */}
            <Link href={`/allDoctors/${doctor.uuid || doctor.id}`} className="w-full">

                <button className="w-full bg-white cursor-pointer hover:bg-blue-50 text-blue-600 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group border border-blue-100">
                    View Details
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
        </div>
    );
};

// ── Skeleton card shown while loading ──────────────────────────────────────
const SkeletonCard = () => (
    <div className="rounded-2xl p-5 shadow-lg animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl" />
    </div>
);

// ── Main Page Component ─────────────────────────────────────────────────────
export default function DoctorsSection() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 1
    });

    const fetchDoctors = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
           const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/doctors`, {
    params: {
        page,
        limit: 12,
        is_active: true  // only fetch active doctors on public page
    },
    withCredentials: true
});

            if (response.data.success) {
                setDoctors(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError('Failed to load doctors.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors(1);
    }, []);

    const handlePageChange = (newPage) => {
        fetchDoctors(newPage);
        // Scroll back to top of section smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className="pt-22 md:pt-36 bg-linear-to-b from-gray-50 to-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

                {/* Section Header */}
                <div className="mb-10 flex flex-col items-center justify-center w-full">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl text-center uppercase font-medium font-serif bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        Our Expert Doctors
                    </h2>
                    <p className="text-md md:text-xl text-gray-600 text-center">
                        Connect with experienced medical professionals
                    </p>
                    {/* Total count */}
                    {!loading && !error && (
                        <p className="text-sm text-gray-400 mt-2">
                            Showing {doctors.length} of {pagination.total} doctors
                        </p>
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex items-center justify-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                        <button
                            onClick={() => fetchDoctors(pagination.page)}
                            className="ml-auto text-sm underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {loading
                        ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                        : doctors.map((doctor) => (
                            <DoctorCard key={doctor.uuid} doctor={doctor} />
                        ))
                    }
                </div>

                {/* Empty State */}
                {!loading && !error && doctors.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <User className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg font-medium">No doctors found</p>
                        <p className="text-sm mt-1">Check back later or contact support.</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${pageNum === pagination.page
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </section>
    );
}
