"use client";
import React from 'react';
import { Shield, UserCheck, Handshake } from 'lucide-react';
import { useLanguage } from '@/context/languageContext';

export default function WhyChooseMuftMadad() {
  const { lang } = useLanguage();

  const features = lang === 'en' ? [
    {
      icon: Shield,
      title: "100% Free Surgery Guarantee",
      subtitle: "Complete financial coverage for approved surgeries"
    },
    {
      icon: UserCheck,
      title: "Experienced Doctors",
      subtitle: "Board-certified specialists with 10+ years experience"
    },
    {
      icon: Handshake,
      title: "Complete Treatment Support",
      subtitle: "End-to-end assistance from consultation to recovery"
    }
  ] : [
    {
      icon: Shield,
      title: "100% मुफ्त सर्जरी की गारंटी",
      subtitle: "स्वीकृत सर्जरी पर पूर्ण वित्तीय कवरेज"
    },
    {
      icon: UserCheck,
      title: "अनुभवी डॉक्टर",
      subtitle: "10+ वर्ष अनुभव वाले बोर्ड प्रमाणित विशेषज्ञ"
    },
    {
      icon: Handshake,
      title: "सम्पूर्ण उपचार सहायता",
      subtitle: "परामर्श से रिकवरी तक पूर्ण सहायता"
    }
  ];

  const sectionTitle = lang === 'en' ? 'Why Choose Muft Madad?' : 'मुफ़्त मदद क्यों चुनें?';

  return (
    <section className="relative w-full py-8 lg:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-linear(circle_at_20%_80%,rgba(34,197,94,0.1),transparent)] opacity-50"></div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif  uppercase font-medium bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            {sectionTitle}
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            {lang === 'en' ? 'Trusted by 500+ patients for free treatment' : '500+ मरीजों का विश्वास निःशुल्क इलाज के लिए'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
              className={`group flex flex-col items-center text-center bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl border border-white/50 hover:border-emerald-300/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden ${index === 2 ? 'hidden md:flex' : ''}`}
              >
                {/* Icon */}
                <div className="relative mb-4 sm:mb-5 w-16 h-16 sm:w-20 sm:h-20 mx-auto p-4 bg-linear-to-br rounded-2xl shadow-lg group-hover:shadow-emerald-500/25 transition-all">
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 group-hover:text-emerald-700 group-hover:scale-110 transition-all duration-300 mx-auto" />
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-linear-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto">
                    {feature.subtitle}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all blur-xl scale-150"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
