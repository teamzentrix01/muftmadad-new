
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [accountType, setAccountType] = useState('patient');
  const [staffRole, setStaffRole] = useState('laboratory');

  // Configure axios to send cookies with requests
  axios.defaults.withCredentials = true;

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test((email || '').trim());
  };

  const validatePhone = (phone) => {
    const clean = (phone || '').replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(clean);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateName = (name) => {
    const trimmed = (name || '').trim();
    return /^[a-zA-Z\s]{2,50}$/.test(trimmed);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'name') {
      // Limitation: Name should only accept alphabets and spaces
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phone') {
      // Limitation: Phone should only accept digits, max 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      formattedValue = digitsOnly;

      if (digitsOnly.length > 0 && !/^[6-9]/.test(digitsOnly)) {
        setFieldErrors(prev => ({
          ...prev,
          phone: 'Invalid number: Mobile number must start with 6, 7, 8, or 9'
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          phone: ''
        }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear field error when user types (for non-phone fields)
    if (name !== 'phone' && fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setError('');
  };

  // Handle input blur for real-time validation
  const handleBlur = (field) => {
    const errors = {};

    switch (field) {
      case 'name':
        if (!formData.name || !formData.name.trim()) {
          errors.name = 'Please enter your full name';
        } else if (!validateName(formData.name)) {
          errors.name = 'Name must contain only alphabets (at least 2 characters)';
        }
        break;
      case 'email':
        if (formData.email && formData.email.trim()) {
          if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email format (e.g. name@example.com)';
          }
        }
        break;
      case 'phone':
        if (!formData.phone) {
          errors.phone = 'Please enter your 10-digit mobile number';
        } else if (!/^[6-9]/.test(formData.phone)) {
          errors.phone = 'Invalid Number: Fill the valid number';
        } else if (formData.phone.length !== 10) {
          errors.phone = 'Mobile number must be exactly 10 digits';
        }
        break;
      case 'password':
        if (formData.password && !validatePassword(formData.password)) {
          errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
        }
        break;
      case 'confirmPassword':
        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
      default:
        break;
    }

    setFieldErrors(prev => ({ ...prev, ...errors }));
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};

    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Please enter your full name';
    } else if (!validateName(formData.name)) {
      errors.name = 'Name must contain only alphabets (at least 2 characters)';
    }

    // Email is optional, but if entered, must be in valid format
    if (formData.email && formData.email.trim()) {
      if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email format (e.g. name@example.com)';
      }
    }

    if (!formData.phone) {
      errors.phone = 'Please enter your 10-digit mobile number';
    } else if (!/^[6-9]/.test(formData.phone)) {
      errors.phone = 'Invalid Number: Fill the valid number';
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Mobile number must be exactly 10 digits';
    }

    if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email?.trim() ? formData.email.toLowerCase().trim() : undefined,
        phone: formData.phone.replace(/\s/g, ''),
        password: formData.password,
        account_type: accountType,
        role: accountType,
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        timeout: 10000,
      });

      const user = response.data?.user;
      const isStaffUser = Boolean(user?.is_staff || accountType === 'staff');
      // Handle successful signup
      setSuccess(isStaffUser ? 'Staff account created! You have been added to the Staff Directory (Post will be assigned by Administrator).' : 'Account created successfully! Opening portal...');

      if (response.data.token) localStorage.setItem('authToken', response.data.token);
      // Store user data if provided (token will be in cookie)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      setAcceptTerms(false);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        const next = new URLSearchParams(window.location.search).get('next');
        const safeNext = next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : null;
        if (isStaffUser) {
          window.location.href = (safeNext && safeNext !== '/dashboard') ? safeNext : '/labs/workspace';
        } else {
          window.location.href = (safeNext && safeNext !== '/dashboard') ? safeNext : '/labs';
        }
      }, 1500);

    } catch (err) {
      console.error('Signup error:', err);
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Registration failed';
        if (err.response.data?.field) {
          setFieldErrors(prev => ({
            ...prev,
            [err.response.data.field]: err.response.data.message
          }));
        }
        setError(errorMessage);
      } else if (err.request) {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-medium uppercase bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Create Account
          </h1>
          <p className="text-gray-600 text-lg">Join us today and get started</p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start animate-fade-in">
                <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start animate-shake">
                <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Account Type Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('patient')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${accountType === 'patient'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <span>👤</span> Patient / Individual
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('staff')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${accountType === 'staff'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <span>🩺</span> Healthcare Staff
                </button>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <span className="text-xs text-gray-400 font-medium">Alphabets only</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  className={`block w-full pl-12 pr-4 py-3 border ${fieldErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400`}
                  placeholder="Enter your full name (e.g. Rahul Sharma)"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Field (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <span className="text-xs text-gray-400 font-medium">Optional</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={`block w-full pl-12 pr-4 py-3 border ${fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400`}
                  placeholder="name@example.com (optional)"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Mobile Number Field with +91 Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Mobile Number
                </label>
                <span className="text-xs text-gray-400 font-medium"></span>
              </div>
              <div className={`flex rounded-xl overflow-hidden border ${fieldErrors.phone ? 'border-red-300 ring-1 ring-red-400' : 'border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500'
                } bg-white/50 backdrop-blur-sm transition-all duration-200`}>
                <div className="inline-flex items-center px-3.5 bg-gray-100/90 border-r border-gray-200 text-gray-700 font-semibold text-sm select-none gap-1.5 flex-shrink-0">
                  <span className="text-base leading-none">🇮🇳</span>
                  <span className="tracking-tight text-gray-800 font-bold">+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  className="block w-full py-3 px-3.5 text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none font-mono tracking-wider text-sm"
                  placeholder="9876543210"
                />
                <div className="pr-3.5 flex items-center text-xs text-gray-400 select-none font-medium flex-shrink-0">
                  {formData.phone.length}/10
                </div>
              </div>
              {fieldErrors.phone ? (
                <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.phone}
                </p>
              ) : (
                <p className="text-xs text-gray-500 ml-1">
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={`block w-full pl-12 pr-12 py-3 border ${fieldErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Use 8+ characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`block w-full pl-12 pr-12 py-3 border ${fieldErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Sign In Option for existing users (Patient & Staff) */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="text-center mb-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100/80 px-3 py-1 rounded-full border border-gray-200">
                  Already have an account? (Patient or Staff)
                </span>
              </div>
              <Link
                href="/login"
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl border-2 border-indigo-500/40 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 group"
              >
                <svg className="w-4 h-4 mr-2 text-indigo-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In with Email or Mobile Number →
              </Link>
              <p className="text-center text-xs text-gray-500 mt-2">
                Patients and Healthcare Staff can log in directly with their registered Email or Phone number &amp; Password.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}