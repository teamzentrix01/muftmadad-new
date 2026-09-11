"use client";
import { databaseImageSrc } from "@/lib/image-source.mjs";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/languageContext';
import axios from 'axios';

export default function OurSpecialities() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        setLoading(true);
       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/specialities`, {
    withCredentials: true,
});
        setSpecialities(res.data.data || []);
      } catch (err) {
        setError('Failed to load specialities');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialities();
  }, []);

  const handleSpecialityClick = (speciality) => {
    router.push(`/speciality/${speciality.id}?lang=${lang}`);
  };

  const pageTitle = lang === 'en' ? 'Our Medical Specialties' : 'हमारी चिकित्सा विशेषताएँ';

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500">{error}</div>
  );

  return (
    <div className="pb-10 pt-0 lg:pt-10 px-4 sm:px-6 lg:px-8">
      <div className="h-20 sm:h-24 md:h-28 lg:hidden"></div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl uppercase font-medium font-serif bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {pageTitle}
          </h1>
          <p className="text-md md:text-xl text-gray-600 max-w-3xl mx-auto">
            {lang === 'en'
              ? 'Expert care in 10+ medical specialties with free consultations & up to 80% surgery discounts'
              : '10+ चिकित्सा विशेषताओं में विशेषज्ञ देखभाल, निःशुल्क परामर्श व 80% तक सर्जरी छूट'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
  {specialities.map((speciality) => (
    <div
      key={speciality.id}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="w-full h-28 sm:h-32 overflow-hidden shrink-0">
        <img
          src={databaseImageSrc(speciality.image)}
          alt={lang === 'en' ? speciality.name_en : speciality.name_hi}
          className="w-full h-full object-cover"
        />
      </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">

                {/* Title - centered and bold */}
                <h3 className="text-sm sm:text-base font-bold text-gray-900 text-left mb-1.5">
                  {lang === 'en' ? speciality.name_en : speciality.name_hi}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-3">
                  {lang === 'en' ? speciality.description_en : speciality.description_hi}
                </p>

                {/* Know more link */}
                <button
  onClick={() => handleSpecialityClick(speciality)}
  className="text-xs text-blue-600 text-left hover:text-blue-800 underline font-medium cursor-pointer bg-transparent border-none p-0 mt-auto"
>
                  {lang === 'en' ? 'know more➜' : 'विस्तार से जानें'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}