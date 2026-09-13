"use client";
import React from 'react';
import { Phone, MapPin, ChevronDown, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/languageContext';
import { useCities } from '@/context/cityContext';
import Link from 'next/link';

const SELECTED_CITY_KEY = 'muftMadad_selectedCity';

const Navbar = () => {
    const [isCityDropdownOpen, setIsCityDropdownOpen] = React.useState(false);
    const [selectedCity, setSelectedCity] = React.useState(null);
    const dropdownRef = React.useRef(null);
    const router = useRouter();
    const { lang } = useLanguage();
    const { cities, loading } = useCities();

    // On mount: restore selectedCity from localStorage
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem(SELECTED_CITY_KEY);
            if (stored) {
                setSelectedCity(JSON.parse(stored));
            }
        } catch (e) {
            // ignore parse errors
        }
    }, []);

    // When cities load, reconcile stored city with fresh city data
    React.useEffect(() => {
        if (cities.length === 0) return;
        try {
            const stored = localStorage.getItem(SELECTED_CITY_KEY);
            if (stored) {
                const parsedCity = JSON.parse(stored);
                // Find the matching city from the freshly loaded list (by id or slug)
                const matched = cities.find(
                    (c) => c.id === parsedCity.id || c.slug === parsedCity.slug
                );
                if (matched) {
                    setSelectedCity(matched);
                } else {
                    // City no longer exists in list — clear it
                    setSelectedCity(null);
                    localStorage.removeItem(SELECTED_CITY_KEY);
                }
            }
        } catch (e) {
            // ignore
        }
    }, [cities]);

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setIsCityDropdownOpen(false);
        try {
            localStorage.setItem(SELECTED_CITY_KEY, JSON.stringify(city));
        } catch (e) {
            // ignore storage errors
        }
        router.push(`/cities/${encodeURIComponent(city.slug || city.name_en.toLowerCase())}`);
    };

    const handleClearCity = () => {
        setSelectedCity(null);
        setIsCityDropdownOpen(false);
        try {
            localStorage.removeItem(SELECTED_CITY_KEY);
        } catch (e) {
            // ignore
        }
    };

    const getCityDisplayName = () => {
        if (!selectedCity) {
            return lang === 'en' ? 'Select City' : 'शहर चुनें';
        }
        return lang === 'en' ? selectedCity.name_en : (selectedCity.name_hi || selectedCity.name_en);
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsCityDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const callText = lang === 'en' ? 'Call Now' : 'कॉल करें';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-3 sm:px-6 py-1.5 sm:py-2.5 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-0">
                {/* Logo */}
                <div className="flex items-center shrink-0">
                    <Link href='/'>
                        <img
                            src="/logo.png"
                            alt="Muft Madad Logo"
                            className="h-9 sm:h-11 md:h-12 w-12 object-contain scale-125 md:scale-195"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    </Link>
                    <div
                        className="hidden items-center justify-center bg-teal-600 text-white font-bold text-lg sm:text-xl px-3 py-1 rounded"
                        style={{ display: 'none' }}
                    >
                        {lang === 'en' ? 'Muft Madad' : 'मुफ्त मदद'}
                    </div>
                </div>

                {/* Right side buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0 min-w-0">
                    {/* Call Button */}
                    <a href="tel:+917088440387">
                        <button className="flex items-center gap-1 px-2 py-1 cursor-pointer border border-gray-300 rounded hover:bg-gray-50 transition text-xs sm:text-sm">
                            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                            <span>{callText}</span>
                        </button>
                    </a>

                    <Link href="/care" className="rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-2 text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Find Care</Link>
                    <Link href="/labs" className="rounded-lg border border-blue-200 px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 whitespace-nowrap">Lab Tests</Link>

                    {/* Select City */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => cities.length > 0 && setIsCityDropdownOpen(!isCityDropdownOpen)}
                            disabled={loading}
                            className="flex items-center gap-1 cursor-pointer px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-wait"
                        >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-red-600 shrink-0" />
                            <span className="font-semibold hidden md:inline truncate max-w-[7rem]">
                                {loading ? 'Loading...' : getCityDisplayName()}
                            </span>
                            {/* On small screens: show selected city name if chosen, else generic label */}
                            <span className="font-semibold md:hidden truncate max-w-[5rem]">
                                {loading
                                    ? '...'
                                    : selectedCity
                                        ? (lang === 'en' ? selectedCity.name_en : (selectedCity.name_hi || selectedCity.name_en))
                                        : (lang === 'en' ? 'City' : 'शहर')
                                }
                            </span>
                            {cities.length > 0 && (
                                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {isCityDropdownOpen && cities.length > 0 && (
                            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto">
                                {/* Clear selection option */}
                                <button
                                    onClick={handleClearCity}
                                    className={`w-full cursor-pointer text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition border-b border-gray-100 ${
                                        !selectedCity ? 'bg-gray-50 text-gray-700 font-medium' : ''
                                    }`}
                                >
                                    {lang === 'en' ? 'Select City' : 'शहर चुनें'}
                                </button>
                                {cities.map((city) => (
                                    <button
                                        key={city.id || city.slug}
                                        onClick={() => handleCitySelect(city)}
                                        className={`w-full cursor-pointer text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition border-b border-gray-100 last:border-b-0 ${
                                            selectedCity?.id === city.id ? 'bg-red-50 text-red-600 font-semibold border-l-4 border-red-500' : ''
                                        }`}
                                    >
                                        {lang === 'en' ? city.name_en : (city.name_hi || city.name_en)}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Show message when no cities */}
                        {isCityDropdownOpen && cities.length === 0 && !loading && (
                            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    {lang === 'en' ? 'No cities available' : 'कोई शहर उपलब्ध नहीं है'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sign In / Up Button */}
                    <Link
                        href="/signup"
                        className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all font-semibold text-xs sm:text-sm whitespace-nowrap shadow-xs hover:shadow active:scale-95"
                    >
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span>Sign In / Up</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
