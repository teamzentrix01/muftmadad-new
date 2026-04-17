'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/context/languageContext';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HospitalsSection from '@/components/hospitals';
import MedicalTreatmentsPage from '@/components/Treatments';
import DoctorsSection from '@/components/doctors';
import MuftMadadBlogs from '@/components/Blogs';
import DynamicTestimonialSection from '@/components/dynamicTestimonials';
import Footer from '@/components/Footer';

// ✅ Hindi city name → English mapping
const cityTranslation = {
  "मुरादाबाद": "Moradabad",
  "चंदौसी":    "Chandausi",
  "अमरोहा":    "Amroha",
  "बिलारी":    "Bilari",
};

const HeroContent = () => {
  const { lang } = useLanguage();
  const params = useParams();

  // Decode URL param — could be Hindi or English
  const cityFromUrl = params?.city
    ? decodeURIComponent(params.city)
    : "मुरादाबाद";

  const [selectedCity] = useState(cityFromUrl);

  // ✅ Always get English city name for API calls
  const englishCity = cityTranslation[selectedCity] || selectedCity;

  // ✅ Display name based on language
  const displayCity = lang === 'en'
    ? (cityTranslation[selectedCity] || selectedCity)
    : selectedCity;

  const HeroData = {
    en: {
      title: `Ayushman Bharat with Muft Madad`,
      subtitle: `Get Yourself Treated in ${englishCity} For Free`,
      points: [
      'Free OPD (Outpatient Department) services for all patients.',
      '50% discount on all diagnostic tests.',
      'Free treatment, including all surgical procedures, for patients aged above 70 years.'
    ],
      button: 'Call Now'
    },
    hi: {
      title: 'मुफ्त मदद के साथ अयुष्मान भारत',
      subtitle: `${displayCity} में अपना इलाज मुफ्त में करवाएं`,
       points: [
  'सभी मरीजों के लिए निःशुल्क ओपीडी (बाह्य रोगी विभाग) सेवाएं।',
  'सभी जांचों पर 50% की छूट।',
  'भर्ती के समय दवाइयाँ निःशुल्क उपलब्ध कराई जाती हैं।',
  '70 वर्ष से अधिक आयु के मरीजों के लिए सभी शल्य क्रियाओं सहित निःशुल्क उपचार।'
],
      button: 'अभी कॉल करें'
    }
  };

  const content = HeroData[lang] || HeroData['hi'];

  return (
    <div>
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-20 lg:mt-26">
      <Navbar />

      {/* ── Hero ── */}
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8">
          <h1 className="text-4xl font-serif font-medium uppercase text-gray-900 leading-tight tracking-widest">
            {content.title}
            <br />
            <span className="text-red-600">{displayCity}</span>
            {' '}{lang === 'en' ? 'For Free' : 'में मुफ्त इलाज'}
          </h1>
          <ul className="space-y-3 sm:space-y-4">
            {content.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl mt-1">▸</span>
                <span className="text-base sm:text-lg md:text-xl text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
          <a href="tel:+917088440387" className="w-full sm:w-auto">
            <button className="flex cursor-pointer items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-md transition shadow-md text-base sm:text-lg w-full sm:w-auto justify-center">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{content.button}</span>
            </button>
          </a>
        </div>
        <div className="relative mt-8 lg:mt-0">
          <img src="/HeroImage.png" alt="Happy family"
            className="w-full h-auto rounded-lg shadow-xl"
            onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23e5e7eb" width="800" height="600"/%3E%3C/svg%3E'; }} />
        </div>
      </div>

      {/* ── About Section ── */}
      <section className="bg-slate-700 text-white py-12 px-6 mt-12 rounded-2xl">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-left">{englishCity}</h2>
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-gray-100">
              {lang === 'en'
                ? `${englishCity} is one of the key cities where Muft Madad provides free healthcare services under Ayushman Bharat.`
                : `${displayCity} उन प्रमुख शहरों में से एक है जहाँ मुफ्त मदद आयुष्मान भारत के अंतर्गत मुफ्त स्वास्थ्य सेवाएं प्रदान करता है।`}
            </p>
            <p className="text-gray-100">
              {lang === 'en'
                ? `We connect patients in ${englishCity} with verified hospitals, experienced doctors, and free treatments.`
                : `हम ${displayCity} के मरीजों को सत्यापित अस्पतालों, अनुभवी डॉक्टरों और मुफ्त उपचार से जोड़ते हैं।`}
            </p>
          </div>
        </div>
      </section>

      {/* ✅ All sections now receive city in English for API filtering */}

      {/* Hospitals — filtered by englishCity */}
      <HospitalsSection city={englishCity} />

      {/* Treatments — same for all cities (specialty based) */}
      <MedicalTreatmentsPage />

      {/* Doctors — filtered by englishCity */}
      <DoctorsSection city={englishCity} />

      {/* Blogs — same for all */}
      <MuftMadadBlogs />

      {/* Testimonials — filtered by englishCity */}
      <DynamicTestimonialSection city={englishCity} />
      
    </main>
    <Footer/>
    </div>
    
  );
};

export default HeroContent;