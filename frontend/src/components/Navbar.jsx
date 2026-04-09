"use client";
import React from 'react';
import { Phone, MapPin, ChevronDown, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/languageContext';
import Link from 'next/link';

const Navbar = () => {
    const [isCityDropdownOpen, setIsCityDropdownOpen] = React.useState(false);
    // const [isLangDropdownOpen, setIsLangDropdownOpen] = React.useState(false);
    const [selectedCity, setSelectedCity] = React.useState('शहर चुनें');
    const dropdownRef = React.useRef(null);
    const langDropdownRef = React.useRef(null);
    const router = useRouter();
    const { lang, toggleLang } = useLanguage();

    const cities = ['मुरादाबाद', 'चंदौसी', 'अमरोहा', 'बिलारी'];

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setIsCityDropdownOpen(false);
        router.push(`/cities/${encodeURIComponent(city)}`);
    };

    // const handleLangSelect = (newLang) => {
    //     toggleLang();
    //     setIsLangDropdownOpen(false);
    // };

    const getCityDisplayName = () => {
        const cityMap = {
            'मुरादाबाद': lang === 'en' ? 'Moradabad' : 'मुरादाबाद',
            'चंदौसी': lang === 'en' ? 'Chandausi' : 'चंदौसी',
            'अमरोहा': lang === 'en' ? 'Amroha' : 'अमरोहा',
            'बिलारी': lang === 'en' ? 'Bilari' : 'बिलारी'
        };
        return cityMap[selectedCity] || (lang === 'en' ? 'Select City' : 'शहर चुनें');
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsCityDropdownOpen(false);
            }
            // if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
            //     setIsLangDropdownOpen(false);
            // }
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
                    {/* Language Selector */}
                    <div className="relative" ref={langDropdownRef}>
                        {/* <button
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                            className="flex items-center gap-1 px-2 py-1 border border-green-500 text-green-600 rounded hover:bg-green-50 transition text-xs sm:text-sm"
                        >
                            {lang === 'en' ? (
                                <>
                                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                    <span className="hidden sm:inline">English</span>
                                    <span className="sm:hidden">EN</span>
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">हिंदी</span>
                                    <span className="sm:hidden">HI</span>
                                    <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                </>
                            )}
                        </button> */}

                        {/* {isLangDropdownOpen && (
                            <div className="absolute right-0 mt-1.5 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                <button
                                    onClick={() => handleLangSelect('hi')}
                                    className={`block w-full cursor-pointer text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 transition ${lang === 'hi' ? 'bg-green-50 text-green-600 font-semibold border-l-4 border-green-500' : ''}`}
                                >
                                    हिंदी
                                </button>
                                <button
                                    onClick={() => handleLangSelect('en')}
                                    className={`block w-full cursor-pointer text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 transition ${lang === 'en' ? 'bg-green-50 text-green-600 font-semibold border-l-4 border-green-500' : ''}`}
                                >
                                    English
                                </button>
                            </div>
                        )} */}
                    </div>

                    {/* Call Button */}
                    <a href="tel:+917088440387">
                        <button className="flex items-center gap-1 px-2 py-1 cursor-pointer border border-gray-300 rounded hover:bg-gray-50 transition text-xs sm:text-sm">
                            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                            <span>{callText}</span>
                        </button>
                    </a>

                    {/* Select City */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                            className="flex items-center gap-1 cursor-pointer px-2 py-1 text-red-600 hover:bg-red-50 rounded transition text-xs sm:text-sm"
                        >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-red-600 shrink-0" />
                            <span className="font-semibold hidden md:inline truncate max-w-[7rem]">
                                {getCityDisplayName()}
                            </span>
                            <span className="font-semibold md:hidden">
                                {lang === 'en' ? 'City' : 'शहर'}
                            </span>
                            <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCityDropdownOpen && (
                            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                {cities.map((city, index) => (
                                    <button
                                        key={city}
                                        onClick={() => handleCitySelect(city)}
                                        className={`block w-full cursor-pointer text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition ${index !== cities.length - 1 ? 'border-b border-gray-100' : ''} ${selectedCity === city ? 'bg-red-50 text-red-600 font-semibold border-l-4 border-red-500' : ''}`}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;