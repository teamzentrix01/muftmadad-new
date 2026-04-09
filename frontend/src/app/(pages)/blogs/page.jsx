"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/languageContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

/* ── Skeleton ─────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="flex gap-4">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
    </div>
);

/* ── Blog Card ────────────────────────────────────────────────────────── */
const BlogCard = ({ blog, lang, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
        <div className="relative">
            <img
                src={blog.bg_image || 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80'}
                alt={blog.title}
                className="w-full h-48 object-cover"
                loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900 to-purple-900 text-white text-center py-2 text-sm font-semibold">
                {lang === 'en' ? '#Just One Call 88569-88569' : '#बसएककॉल 88569-88569'}
            </div>
            {blog.tag && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {blog.tag}
                </div>
            )}
        </div>
        <div className="p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{blog.title}</h3>
            {blog.subtitle && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{blog.subtitle}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                {blog.read_time && (
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{blog.read_time}</span>
                    </div>
                )}
                {blog.author && (
                    <span className="text-xs text-gray-400">by {blog.author}</span>
                )}
            </div>
            {blog.publish_date && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <Calendar size={14} />
                    <span>{blog.publish_date}</span>
                </div>
            )}
            <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1 text-sm">
                {lang === 'en' ? 'Read More' : 'और पढ़ें'}
                <ArrowRight size={14} />
            </button>
        </div>
    </div>
);

/* ── Main Component ───────────────────────────────────────────────────── */
export default function MuftMadadBlogs() {
    const { lang } = useLanguage();
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${API}/blogs`);
                const data = res.data?.data || [];
                setBlogs(Array.isArray(data) ? data : []);
            } catch {
                setError('Failed to load blogs.');
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const titleText  = lang === 'en' ? 'Latest Blogs'    : 'ब्लॉग्स';
    const buttonText = lang === 'en' ? 'See More Blogs'  : 'और ब्लॉग देखें';

    // Show max 4 on homepage
    const visibleBlogs = blogs.slice(0, 4);

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl lg:text-5xl uppercase font-medium font-serif text-gray-900 mb-12 text-center">
                    {titleText}
                </h1>

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="text-center py-10 text-gray-400 text-sm">{error}</div>
                )}

                {/* Empty */}
                {!loading && !error && blogs.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        {lang === 'en' ? 'No blogs published yet.' : 'अभी कोई ब्लॉग प्रकाशित नहीं है।'}
                    </div>
                )}

                {/* Blogs Grid */}
                {!loading && !error && visibleBlogs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {visibleBlogs.map((blog) => (
                            <BlogCard
                                key={blog.id || blog.uuid}
                                blog={blog}
                                lang={lang}
                                onClick={() => router.push(`/blogs/${blog.slug}`)}
                            />
                        ))}
                    </div>
                )}

                {/* See More */}
                {/* {!loading && blogs.length > 4 && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => router.push('/blogs')}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
                            {buttonText}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )} */}
            </div>
        </div>
    );
}