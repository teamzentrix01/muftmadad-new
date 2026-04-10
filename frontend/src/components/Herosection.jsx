'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/context/languageContext';

const HeroData = {
  en: {
    title: 'With Muft Madaad',
    subtitle: 'Get Your Treatment Free',
    points: [
      'Free OPD (Outpatient Department) services for all patients.',
      '50% discount on all diagnostic tests.',
      'Medicines supplied free of cost at the time of admission.',
      'Free treatment, including all surgical procedures, for patients aged above 70 years.'
    ],
    button: 'Call Now'
  },
  hi: {
    title: 'मुफ्त मदद के साथ',
    subtitle: 'अपना इलाज मुफ्त में करवाएं',
   points: [
  'सभी मरीजों के लिए निःशुल्क ओपीडी (बाह्य रोगी विभाग) सेवाएं।',
  'सभी जांचों पर 50% की छूट।',
  'भर्ती के समय दवाइयाँ निःशुल्क उपलब्ध कराई जाती हैं।',
  '70 वर्ष से अधिक आयु के मरीजों के लिए सभी शल्य क्रियाओं सहित निःशुल्क उपचार।'
],
    button: 'अभी कॉल करें'
  }
};

const HeroContent = () => {
  const { lang } = useLanguage();
  const content = HeroData[lang];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 mt-16 sm:mt-20">
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Left Content */}
        <div className="space-y-4 sm:space-y-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-medium uppercase text-gray-900 leading-tight tracking-widest">
            {content.title}
            <br />
            {content.subtitle}
          </h1>

          <ul className="space-y-2 sm:space-y-3">
            {content.points.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-lg sm:text-xl mt-0.5 shrink-0">▸</span>
                <span className="text-sm sm:text-base md:text-lg text-gray-700">{point}</span>
              </li>
            ))}
          </ul>

          <a href="tel:+917088440387" className="block w-full sm:w-auto sm:inline-block">
            <button className="flex cursor-pointer items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-5 sm:px-7 py-2.5 sm:py-3 rounded-md transition shadow-md text-sm sm:text-base w-full sm:w-auto justify-center">
              <Phone className="w-4 h-4 shrink-0" />
              <span>{content.button}</span>
            </button>
          </a>
        </div>

        {/* Right Image */}
        <div className="mt-4 lg:mt-0">
          <img
            src="/HeroImage.png"
            alt="Happy family"
            className="w-full h-auto rounded-lg shadow-xl"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23e5e7eb" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EFamily Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default HeroContent;