'use client';

import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    Upload,
    Image as ImageIcon,
    ClipboardList,
    FileText,
    Users,
    Microscope,
    Activity,
    Stethoscope,
    Pill,
    DollarSign,
    Building2,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import axios from 'axios';

export default function TreatmentAdminForm() {
    const [formData, setFormData] = useState({
        // Basic Information
        name: '',
        slug: '',
        specialty_id: '',
        treatment_image: '',
        png_logo: '',

        // Overview
        overview_description: '',
        key_benefits: [''],

        // Who Gets
        who_gets_description: '',
        ideal_candidates: [''],
        not_suitable_for: [''],

        // Causes
        causes_description: '',
        causes_list: [{ title: '', description: '' }],

        // Symptoms
        symptoms_description: '',
        symptoms_list: [{ symptom: '', details: '' }],

        // Diagnosis
        diagnosis_description: '',
        diagnosis_steps: [{ title: '', description: '', icon: '' }],

        // Treatment Procedure
        treatment_procedure_description: '',
        pre_operative_steps: [''],
        surgical_procedure_steps: [''],
        post_operative_steps: [''],

        // Cost
        cost_description: '',
        cost_ranges: [{ hospital_type: '', min_cost: '', max_cost: '', includes: '' }],
        cost_factors: [''],

        // Ayushman
        ayushman_covered: false,
        ayushman_description: '',
        ayushman_benefits: [''],
        ayushman_eligibility: [''],
        ayushman_claim_steps: [''],

        // Quick Info
        surgery_duration: '',
        hospital_stay: '',
        recovery_time: '',
        success_rate: '',
        comes_in: '',

        // FAQs
        faqs: [{ question: '', answer: '' }]
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Helper function to add item to array
    const addArrayItem = (field, defaultValue = '') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    };

    // Helper function to remove item from array
    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Helper function to update array item
    const updateArrayItem = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    // Helper function to update object in array
    const updateObjectInArray = (field, index, key, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) =>
                i === index ? { ...item, [key]: value } : item
            )
        }));
    };

    // Auto-generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Handle name change and auto-generate slug
    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    // Handle form submission with axios
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep !== 10) return; // safety guard only
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
       try {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/create`, formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
    });
            setMessage({ type: 'success', text: 'Treatment added successfully!' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to add treatment. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, title: 'Basic Info', icon: ClipboardList, color: 'text-blue-600' },
        { id: 2, title: 'Overview', icon: FileText, color: 'text-orange-600' },
        { id: 3, title: 'Who Gets', icon: Users, color: 'text-blue-600' },
        { id: 4, title: 'Causes', icon: Microscope, color: 'text-orange-600' },
        { id: 5, title: 'Symptoms', icon: Activity, color: 'text-blue-600' },
        { id: 6, title: 'Diagnosis', icon: Stethoscope, color: 'text-orange-600' },
        { id: 7, title: 'Treatment', icon: Pill, color: 'text-blue-600' },
        { id: 8, title: 'Cost', icon: DollarSign, color: 'text-orange-600' },
        { id: 9, title: 'Ayushman', icon: Building2, color: 'text-blue-600' },
        { id: 10, title: 'FAQs', icon: HelpCircle, color: 'text-orange-600' }
    ];

    return (
        <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 bg-white rounded-xl shadow-md p-8 border-t-4 border-blue-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <ClipboardList className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Add New Treatment
                    </h1>
                    <p className="text-lg text-gray-600">
                        Fill in the treatment details across multiple sections
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex gap-2 min-w-max px-4">
                        {steps.map((step) => {
                            const StepIcon = step.icon;
                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => setCurrentStep(step.id)}
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

                {/* Message Display */}
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
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ClipboardList className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Treatment Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., Total Knee Replacement (TKR)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    URL Slug (Auto-generated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 outline-none"
                                    placeholder="total-knee-replacement-tkr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Specialty ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.specialty_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, specialty_id: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Treatment Image URL <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={formData.treatment_image}
                                        onChange={(e) => setFormData(prev => ({ ...prev, treatment_image: e.target.value }))}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button type="button" className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    PNG Logo URL <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={formData.png_logo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, png_logo: e.target.value }))}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="https://example.com/logo.png"
                                    />
                                    <button type="button" className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category Of the Treatment <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.comes_in}
                                    onChange={(e) => setFormData(prev => ({ ...prev, comes_in: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., Surgery, Kidney Store, etc."
                                />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Surgery Duration</label>
                                        <input
                                            type="text"
                                            value={formData.surgery_duration}
                                            onChange={(e) => setFormData(prev => ({ ...prev, surgery_duration: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., 1-2 hours"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Stay</label>
                                        <input
                                            type="text"
                                            value={formData.hospital_stay}
                                            onChange={(e) => setFormData(prev => ({ ...prev, hospital_stay: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., 3-5 days"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Recovery Time</label>
                                        <input
                                            type="text"
                                            value={formData.recovery_time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, recovery_time: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., 3-6 months"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Success Rate</label>
                                        <input
                                            type="text"
                                            value={formData.success_rate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, success_rate: e.target.value }))}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., 95%+"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Overview */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Overview Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    value={formData.overview_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, overview_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    placeholder="Describe the treatment in detail..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Key Benefits</label>
                                {formData.key_benefits.map((benefit, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={benefit}
                                            onChange={(e) => updateArrayItem('key_benefits', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder={`Benefit ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('key_benefits', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('key_benefits', '')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Benefit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Who Gets */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Who Gets This Treatment</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.who_gets_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, who_gets_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Describe who is suitable for this treatment..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ideal Candidates</label>
                                {formData.ideal_candidates.map((candidate, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={candidate}
                                            onChange={(e) => updateArrayItem('ideal_candidates', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Candidate criteria ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('ideal_candidates', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('ideal_candidates', '')} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Candidate
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Not Suitable For</label>
                                {formData.not_suitable_for.map((condition, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={condition}
                                            onChange={(e) => updateArrayItem('not_suitable_for', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Condition ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('not_suitable_for', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('not_suitable_for', '')} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Condition
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Causes */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Microscope className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Causes</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.causes_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, causes_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    placeholder="Describe the causes..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Causes List</label>
                                {formData.causes_list.map((cause, index) => (
                                    <div key={index} className="bg-orange-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-900">Cause {index + 1}</h4>
                                            <button type="button" onClick={() => removeArrayItem('causes_list', index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={cause.title}
                                            onChange={(e) => updateObjectInArray('causes_list', index, 'title', e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Title"
                                        />
                                        <textarea
                                            rows={2}
                                            value={cause.description}
                                            onChange={(e) => updateObjectInArray('causes_list', index, 'description', e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Description"
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('causes_list', { title: '', description: '' })} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Cause
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Symptoms */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Symptoms</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.symptoms_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, symptoms_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Describe the symptoms..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms List</label>
                                {formData.symptoms_list.map((symptom, index) => (
                                    <div key={index} className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-900">Symptom {index + 1}</h4>
                                            <button type="button" onClick={() => removeArrayItem('symptoms_list', index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={symptom.symptom}
                                            onChange={(e) => updateObjectInArray('symptoms_list', index, 'symptom', e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Symptom name"
                                        />
                                        <textarea
                                            rows={2}
                                            value={symptom.details}
                                            onChange={(e) => updateObjectInArray('symptoms_list', index, 'details', e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Details"
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('symptoms_list', { symptom: '', details: '' })} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Symptom
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Diagnosis */}
                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Stethoscope className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Diagnosis</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.diagnosis_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    placeholder="Describe the diagnosis process..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis Steps</label>
                                {formData.diagnosis_steps.map((step, index) => (
                                    <div key={index} className="bg-orange-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-900">Step {index + 1}</h4>
                                            <button type="button" onClick={() => removeArrayItem('diagnosis_steps', index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={step.icon}
                                            onChange={(e) => updateObjectInArray('diagnosis_steps', index, 'icon', e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Icon (emoji)"
                                        />
                                        <input
                                            type="text"
                                            value={step.title}
                                            onChange={(e) => updateObjectInArray('diagnosis_steps', index, 'title', e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Title"
                                        />
                                        <textarea
                                            rows={2}
                                            value={step.description}
                                            onChange={(e) => updateObjectInArray('diagnosis_steps', index, 'description', e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Description"
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('diagnosis_steps', { title: '', description: '', icon: '' })} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Treatment */}
                    {currentStep === 7 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Pill className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Treatment Procedure</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Procedure Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.treatment_procedure_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, treatment_procedure_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Describe the treatment procedure..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pre-Operative Steps</label>
                                {formData.pre_operative_steps.map((step, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => updateArrayItem('pre_operative_steps', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Step ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('pre_operative_steps', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('pre_operative_steps', '')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Step
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Surgical Procedure Steps</label>
                                {formData.surgical_procedure_steps.map((step, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => updateArrayItem('surgical_procedure_steps', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Step ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('surgical_procedure_steps', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('surgical_procedure_steps', '')} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Step
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Post-Operative Steps</label>
                                {formData.post_operative_steps.map((step, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => updateArrayItem('post_operative_steps', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Step ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('post_operative_steps', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('post_operative_steps', '')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 8: Cost */}
                    {currentStep === 8 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Cost Information</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.cost_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cost_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    placeholder="Describe the cost structure..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Ranges</label>
                                {formData.cost_ranges.map((range, index) => (
                                    <div key={index} className="bg-orange-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-900">Range {index + 1}</h4>
                                            <button type="button" onClick={() => removeArrayItem('cost_ranges', index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={range.hospital_type}
                                            onChange={(e) => updateObjectInArray('cost_ranges', index, 'hospital_type', e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Hospital Type (e.g., Government Hospital)"
                                        />
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <input
                                                type="number"
                                                value={range.min_cost}
                                                onChange={(e) => updateObjectInArray('cost_ranges', index, 'min_cost', e.target.value)}
                                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                placeholder="Min Cost"
                                            />
                                            <input
                                                type="number"
                                                value={range.max_cost}
                                                onChange={(e) => updateObjectInArray('cost_ranges', index, 'max_cost', e.target.value)}
                                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                                placeholder="Max Cost"
                                            />
                                        </div>
                                        <textarea
                                            rows={2}
                                            value={range.includes}
                                            onChange={(e) => updateObjectInArray('cost_ranges', index, 'includes', e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="What's included"
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('cost_ranges', { hospital_type: '', min_cost: '', max_cost: '', includes: '' })} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Range
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Factors</label>
                                {formData.cost_factors.map((factor, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={factor}
                                            onChange={(e) => updateArrayItem('cost_factors', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder={`Factor ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('cost_factors', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('cost_factors', '')} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Factor
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 9: Ayushman */}
                    {currentStep === 9 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Ayushman Bharat Coverage</h2>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <input
                                    type="checkbox"
                                    id="ayushman_covered"
                                    checked={formData.ayushman_covered}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ayushman_covered: e.target.checked }))}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="ayushman_covered" className="text-sm font-semibold text-gray-700">
                                    Covered under Ayushman Bharat
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Coverage Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.ayushman_description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ayushman_description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Describe Ayushman coverage..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Benefits</label>
                                {formData.ayushman_benefits.map((benefit, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={benefit}
                                            onChange={(e) => updateArrayItem('ayushman_benefits', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Benefit ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('ayushman_benefits', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('ayushman_benefits', '')} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Benefit
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Eligibility Criteria</label>
                                {formData.ayushman_eligibility.map((criteria, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={criteria}
                                            onChange={(e) => updateArrayItem('ayushman_eligibility', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Criteria ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('ayushman_eligibility', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('ayushman_eligibility', '')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Criteria
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">How to Claim</label>
                                {formData.ayushman_claim_steps.map((step, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => updateArrayItem('ayushman_claim_steps', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder={`Step ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeArrayItem('ayushman_claim_steps', index)} className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('ayushman_claim_steps', '')} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 10: FAQs */}
                    {currentStep === 10 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <HelpCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            </div>

                            <div>
                                {formData.faqs.map((faq, index) => (
                                    <div key={index} className="bg-orange-50 p-4 rounded-lg mb-4 border-2 border-orange-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-900">FAQ {index + 1}</h4>
                                            <button type="button" onClick={() => removeArrayItem('faqs', index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={faq.question}
                                            onChange={(e) => updateObjectInArray('faqs', index, 'question', e.target.value)}
                                            className="w-full px-4 py-2 mb-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Question"
                                        />
                                        <textarea
                                            rows={3}
                                            value={faq.answer}
                                            onChange={(e) => updateObjectInArray('faqs', index, 'answer', e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Answer"
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('faqs', { question: '', answer: '' })} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add FAQ
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ✅ Navigation Buttons — NO step counter, Next label shows upcoming section */}
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
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                {isSubmitting ? 'Submitting...' : 'Submit Treatment'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}