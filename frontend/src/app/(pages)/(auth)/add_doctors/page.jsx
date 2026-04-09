'use client';

import React, { Fragment, useState } from 'react';
import {
    Save,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    User,
    Briefcase,
    MapPin,
    FileText,
    BarChart3,
    Globe,
    Shield
} from 'lucide-react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ImageUploadField = ({ label, value, onChange, placeholder = "https://..." }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      
      {/* URL Input */}
      <input
        type="text"
        value={value.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm mb-2"
      />

      {/* File Upload */}
      <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-gray-100 hover:bg-blue-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-all text-sm text-gray-600 hover:text-blue-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Upload From Device
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>

      {/* Preview */}
      {value && (
        <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 group">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  );
};

const AdminDoctorForm = () => {
    const [formData, setFormData] = useState({
        uuid: uuidv4(),
        name: '',
        email: '',
        photo: '',
        phone: '',
        degrees: [],
        specialities: [],
        currently_serving: '',
        experience_in_years: '',
        registration_number: '',
        city: '',
        state: '',
        country: '',
        address: '',
        location: null,
        overview: '',
        serving_in_hospitals: [],
        is_active: true,
        is_verified: false,
        availability_schedule: [],
        consultation_fee: '',
        languages_spoken: [],
        awards_and_recognitions: [],
        publications: [],
        average_rating: 0,
        total_reviews: 0,
        total_patients_treated: 0,
        meta_title: '',
        meta_description: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
    });

    // ✅ Separate local state for array input display strings
    const [localArrayInputs, setLocalArrayInputs] = useState({
        degrees: '',
        specialities: '',
        languages_spoken: '',
        serving_in_hospitals: '',
        awards_and_recognitions: '',
        publications: ''
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // ✅ For typing — just updates the display string, no splitting
    const handleArrayInputChange = (e, field) => {
        setLocalArrayInputs(prev => ({ ...prev, [field]: e.target.value }));
    };

    // ✅ For blur — splits and saves to formData only when user leaves the field
    const handleArrayInputBlur = (field) => {
        const array = localArrayInputs[field]
            .split(',')
            .map(item => item.trim())
            .filter(item => item);
        setFormData(prev => ({ ...prev, [field]: array }));
    };

    const handleNumberChange = (e, field) => {
        const value = e.target.value === '' ? '' : parseFloat(e.target.value);
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/doctors`, formData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            setMessage({ type: 'success', text: 'Doctor profile created successfully!' });

            setTimeout(() => {
                setFormData({
                    uuid: uuidv4(),
                    name: '',
                    email: '',
                    photo: '',
                    phone: '',
                    degrees: [],
                    specialities: [],
                    currently_serving: '',
                    experience_in_years: '',
                    registration_number: '',
                    city: '',
                    state: '',
                    country: '',
                    address: '',
                    location: null,
                    overview: '',
                    serving_in_hospitals: [],
                    is_active: true,
                    is_verified: false,
                    availability_schedule: [],
                    consultation_fee: '',
                    languages_spoken: [],
                    awards_and_recognitions: [],
                    publications: [],
                    average_rating: 0,
                    total_reviews: 0,
                    total_patients_treated: 0,
                    meta_title: '',
                    meta_description: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null
                });
                // ✅ Also reset local array inputs on form reset
                setLocalArrayInputs({
                    degrees: '',
                    specialities: '',
                    languages_spoken: '',
                    serving_in_hospitals: '',
                    awards_and_recognitions: '',
                    publications: ''
                });
                setCurrentStep(1);
                setMessage({ type: '', text: '' });
            }, 2000);

        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to create doctor profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Basic Info', icon: User, color: 'text-blue-600' },
        { id: 2, title: 'Professional', icon: Briefcase, color: 'text-orange-600' },
        { id: 3, title: 'Location', icon: MapPin, color: 'text-blue-600' },
        { id: 4, title: 'Additional', icon: FileText, color: 'text-orange-600' },
        { id: 5, title: 'Statistics', icon: BarChart3, color: 'text-blue-600' },
        { id: 6, title: 'SEO & Status', icon: Globe, color: 'text-orange-600' }
    ];

    return (
        <Fragment>
            <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8 ">
                <Navbar />
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center bg-white rounded-xl shadow-md p-8 border-t-4 mb-4 border-blue-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Doctor</h1>
                        <p className="text-lg text-gray-600">Fill in all the required information across multiple sections</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8 overflow-x-auto">
                        <div className="flex gap-2 min-w-max px-4">
                            {steps.map((step) => {
                                const StepIcon = step.icon;
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setCurrentStep(step.id)}
                                        type="button"
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all border-2 ${currentStep === step.id
                                                ? 'bg-white border-blue-500 shadow-md'
                                                : 'bg-white border-gray-200 hover:border-orange-400'
                                            }`}
                                    >
                                        <StepIcon className={`w-5 h-5 ${currentStep === step.id ? step.color : 'text-gray-400'}`} />
                                        <span className={`text-sm font-medium ${currentStep === step.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {step.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message Alert */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-50 border-2 border-green-500 text-green-800'
                                : 'bg-red-50 border-2 border-red-500 text-red-800'
                            }`}>
                            {message.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                        className="bg-white rounded-xl shadow-md p-8 border-l-4 border-orange-500"
                    >
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">UUID (Auto-generated)</label>
                                    <input
                                        type="text"
                                        value={formData.uuid}
                                        readOnly
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-600 cursor-not-allowed font-mono text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            maxLength={100}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            maxLength={255}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength={20}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Phone"
                                        />
                                    </div>

                                   <div className="md:col-span-2">
  <ImageUploadField
    label="Photo"
    value={formData.photo}
    onChange={(val) => setFormData(prev => ({ ...prev, photo: val }))}
    placeholder="https://example.com/doctor-photo.jpg"
  />
</div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Professional Information */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Briefcase className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Degrees (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={localArrayInputs.degrees}
                                            onChange={(e) => handleArrayInputChange(e, 'degrees')}
                                            onBlur={() => handleArrayInputBlur('degrees')}
                                            placeholder="MBBS, MD, DM"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">specialities (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={localArrayInputs.specialities}
                                            onChange={(e) => handleArrayInputChange(e, 'specialities')}
                                            onBlur={() => handleArrayInputBlur('specialities')}
                                            placeholder="Cardiology, Internal Medicine"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Currently Serving</label>
                                        <input
                                            type="text"
                                            name="currently_serving"
                                            value={formData.currently_serving}
                                            onChange={handleChange}
                                            placeholder="Hospital Name"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years)</label>
                                        <input
                                            type="number"
                                            name="experience_in_years"
                                            value={formData.experience_in_years}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
                                        <input
                                            type="text"
                                            name="registration_number"
                                            value={formData.registration_number}
                                            onChange={handleChange}
                                            maxLength={50}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Registration Number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.consultation_fee}
                                            onChange={(e) => handleNumberChange(e, 'consultation_fee')}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="200"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">languages_spoken (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={localArrayInputs.languages_spoken}
                                            onChange={(e) => handleArrayInputChange(e, 'languages_spoken')}
                                            onBlur={() => handleArrayInputBlur('languages_spoken')}
                                            placeholder="English, Hindi, Bengali"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Location Information */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MapPin className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Location Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            maxLength={100}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            maxLength={100}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="State"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            maxLength={100}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Country"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Current Address"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Additional Information */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <FileText className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Overview</label>
                                        <textarea
                                            name="overview"
                                            value={formData.overview}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Bio, Description, Profile..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Serving in Hospitals (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={localArrayInputs.serving_in_hospitals}
                                            onChange={(e) => handleArrayInputChange(e, 'serving_in_hospitals')}
                                            onBlur={() => handleArrayInputBlur('serving_in_hospitals')}
                                            placeholder="Apollo Hospital, Max Healthcare"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Awards and Recognitions (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={localArrayInputs.awards_and_recognitions}
                                            onChange={(e) => handleArrayInputChange(e, 'awards_and_recognitions')}
                                            onBlur={() => handleArrayInputBlur('awards_and_recognitions')}
                                            placeholder="Best Doctor Award 2023, Excellence in Healthcare"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Publications (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={localArrayInputs.publications}
                                            onChange={(e) => handleArrayInputChange(e, 'publications')}
                                            onBlur={() => handleArrayInputBlur('publications')}
                                            placeholder="Journal of Medicine 2023, Cardiology Today"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Statistics */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Average Rating</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={formData.average_rating}
                                            onChange={(e) => handleNumberChange(e, 'average_rating')}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="4.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Reviews</label>
                                        <input
                                            type="number"
                                            name="total_reviews"
                                            value={formData.total_reviews}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="150"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Patients Treated</label>
                                        <input
                                            type="number"
                                            name="total_patients_treated"
                                            value={formData.total_patients_treated}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 6: SEO & Status */}
                        {currentStep === 6 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Globe className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">SEO & Status</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title</label>
                                        <input
                                            type="text"
                                            name="meta_title"
                                            value={formData.meta_title}
                                            onChange={handleChange}
                                            maxLength={200}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="SEO Meta Title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
                                        <textarea
                                            name="meta_description"
                                            value={formData.meta_description}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="SEO Meta Description"
                                        />
                                    </div>

                                    <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-orange-600" />
                                            Account Status
                                        </h3>
                                        <div className="flex gap-8">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    checked={formData.is_active}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <label className="ml-3 text-sm font-semibold text-gray-700">Is Active</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="is_verified"
                                                    checked={formData.is_verified}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                                />
                                                <label className="ml-3 text-sm font-semibold text-gray-700">Is Verified</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-end pt-6 border-t-2 border-gray-200 mt-8">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                disabled={currentStep === 1}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Previous
                            </button>

                            {currentStep < steps.length ? (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                        Next: {steps[currentStep].title}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? 'Creating...' : 'Create Doctor Profile'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
};

export default AdminDoctorForm;