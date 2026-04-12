"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Save, ArrowLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AddCityForm() {
    const router = useRouter();
    const [form, setForm] = useState({
        name_en: '',
        name_hi: '',
        slug: '',
        display_order: 1,
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!form.name_en.trim()) newErrors.name_en = 'English name is required';
        if (!form.name_hi.trim()) newErrors.name_hi = 'Hindi name is required';
        if (!form.slug.trim()) newErrors.slug = 'Slug is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateSlug = (name) => {
        return name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleNameChange = (e, field) => {
        const value = e.target.value;
        setForm(prev => ({ ...prev, [field]: value }));
        
        if (field === 'name_en') {
            setForm(prev => ({ ...prev, slug: generateSlug(value) }));
        }
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API}/admin/cities`, 
                form, 
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setToast({ msg: 'City added successfully!', type: 'success' });
            
            setTimeout(() => {
                router.push('/dashboard?page=list-cities');
            }, 1500);
            
        } catch (error) {
            console.error('Error adding city:', error);
            setToast({ 
                msg: error.response?.data?.message || 'Failed to add city', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {toast && (
                <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)} className="ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/dashboard?page=list-cities')}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Add New City</h1>
                        <p className="text-gray-600 text-sm mt-1">Add a new city to the platform</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City Name (English) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.name_en}
                                onChange={(e) => handleNameChange(e, 'name_en')}
                                placeholder="e.g., Moradabad"
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name_en ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name_en && (
                                <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City Name (Hindi) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.name_hi}
                                onChange={(e) => handleNameChange(e, 'name_hi')}
                                placeholder="e.g., मुरादाबाद"
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name_hi ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name_hi && (
                                <p className="text-red-500 text-sm mt-1">{errors.name_hi}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => handleNameChange(e, 'slug')}
                                placeholder="e.g., moradabad"
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.slug ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.slug && (
                                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                                Used in URLs. Auto-generated from English name.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Display Order
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.display_order}
                                onChange={(e) => setForm({...form, display_order: parseInt(e.target.value) || 1})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-semibold text-gray-700">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Add City
                                    </>
                                )}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard?page=list-cities')}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}