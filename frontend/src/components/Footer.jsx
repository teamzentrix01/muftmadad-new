"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ShieldCheck,
  ArrowUp,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useLanguage } from "@/context/languageContext";

export default function Footer() {
  const { lang } = useLanguage();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isHi = lang === "hi";

  const data = isHi
    ? {
        tagline: "हर परिवार के लिए पारदर्शी उपचार, उचित पैकेज और विश्वसनीय लैब टेस्ट।",
        helpline: "24x7 हेल्पलाइन: 70884-40387",
        servicesTitle: "स्वास्थ्य सेवाएं",
        services: [
          { name: "अस्पताल पैकेज एवं सर्जरी", href: "/care" },
          { name: "घर पर लैब टेस्ट (NABL)", href: "/labs" },
          { name: "विशेषज्ञ डॉक्टर खोजें", href: "/allDoctors" },
          { name: "मान्यता प्राप्त अस्पताल", href: "/allHospitals" },
          { name: "उपचार एवं प्रक्रियाएं", href: "/treatments" },
        ],
        specialitiesTitle: "विशेषताएं",
        specialities: [
          { name: "नेत्र रोग (Eye & Cataract)", href: "/speciality/eye" },
          { name: "हड्डी व जोड़ (Orthopedics)", href: "/speciality/orthopedics" },
          { name: "मूत्र एवं गुर्दा (Urology)", href: "/speciality/urology" },
          { name: "हृदय रोग (Cardiology)", href: "/speciality/cardiology" },
          { name: "स्त्री रोग (Gynecology)", href: "/speciality/uterus" },
        ],
        portalsTitle: "अकाउंट एवं पोर्टल्स",
        signInText: "साइन इन (Sign In)",
        signUpText: "नया अकाउंट बनाएं",
        labWorkspaceText: "लैब ऑपरेटर वर्कस्पेस",
        patientReviewsText: "मरीजों की राय (Reviews)",
        cities: ["मुरादाबाद", "चंदौसी", "अमरोहा", "बिलारी", "संभल", "रामपुर"],
        rights: "© 2026 मुफ्त मदद (Muft Madad Healthcare). सर्वाधिकार सुरक्षित।",
      }
    : {
        tagline: "Transparent hospital packages, verified specialists & home diagnostic care.",
        helpline: "24x7 Helpline: 70884-40387",
        servicesTitle: "Patient Services",
        services: [
          { name: "Hospital Surgery Packages", href: "/care" },
          { name: "Home Lab Tests (NABL)", href: "/labs" },
          { name: "Find Specialist Doctors", href: "/allDoctors" },
          { name: "Verified Partner Hospitals", href: "/allHospitals" },
          { name: "Treatments & Surgeries", href: "/treatments" },
        ],
        specialitiesTitle: "Key Specialties",
        specialities: [
          { name: "Eye Care & Cataract", href: "/speciality/eye" },
          { name: "Orthopedics & Joints", href: "/speciality/orthopedics" },
          { name: "Urology & Kidney Care", href: "/speciality/urology" },
          { name: "Cardiology & Heart", href: "/speciality/cardiology" },
          { name: "Gynecology & Maternity", href: "/speciality/uterus" },
        ],
        portalsTitle: "Account & Portals",
        signInText: "Sign In",
        signUpText: "Create Account",
        labWorkspaceText: "Lab Partner Workspace",
        patientReviewsText: "Patient Reviews",
        cities: ["Moradabad", "Chandausi", "Amroha", "Bilari", "Sambhal", "Rampur"],
        rights: "© 2026 Muft Madad Healthcare Technologies. All rights reserved.",
      };

  const socialLinks = [
    {
      label: "WhatsApp",
      href: "https://wa.me/917088440387",
      color: "#25D366",
      icon: (
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      ),
    },
    {
      label: "Facebook",
      href: "#",
      color: "#1877F2",
      icon: (
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      ),
    },
    {
      label: "Instagram",
      href: "#",
      color: "#E4405F",
      icon: (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      ),
    },
    {
      label: "Twitter",
      href: "#",
      color: "#1DA1F2",
      icon: (
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      ),
    },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#0b162c] via-[#070e1c] to-[#040810] text-slate-200 overflow-hidden">
      {/* ── TOP ACCENT LINE (Matching Logo Colors: #4893cd Blue & #ed9f3d Orange) ── */}
      <div className="h-1 lg:h-1.5 w-full bg-gradient-to-r from-[#4893cd] via-[#ed9f3d] to-[#4893cd]" />

      {/* Ambient Logo Colors Glow (Subtle Blue & Amber) */}
      <div className="absolute top-0 left-1/4 w-80 lg:w-96 h-32 lg:h-44 bg-[#4893cd]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 lg:w-96 h-32 lg:h-44 bg-[#ed9f3d]/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── RESPONSIVE CONTAINER (Mobile: sleek compact, Desktop: spacious with larger typography) ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8 lg:py-11">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">
          {/* Col 1: Logo & Helpline (4 cols) */}
          <div className="lg:col-span-4 space-y-3 lg:space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="bg-white px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl shadow-md border border-[#4893cd]/30 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Muft Madad"
                  className="h-8 sm:h-9 lg:h-11 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-black tracking-tight leading-none text-white">
                  <span>Muft </span>
                  <span className="text-[#ed9f3d]">Madad</span>
                </div>
                <span className="block text-[10px] lg:text-xs font-bold text-[#4893cd] uppercase tracking-wider mt-1">
                  Healthcare &amp; Diagnostics
                </span>
              </div>
            </Link>

            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-sm lg:max-w-md">
              {data.tagline}
            </p>

            {/* Direct Helpline Badge & Mail */}
            <div className="pt-1 flex flex-col gap-2.5">
              <a
                href="tel:+917088440387"
                className="inline-flex items-center gap-2.5 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl bg-gradient-to-r from-[#4893cd] to-[#1e5c8e] hover:from-[#57a1d9] hover:to-[#226aa3] text-white text-xs lg:text-sm font-bold shadow-md shadow-blue-950/60 transition-all w-fit group"
              >
                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#ed9f3d]" />
                </div>
                <span>{data.helpline}</span>
              </a>

              <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-400">
                <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#ed9f3d]" />
                <a
                  href="mailto:care@muftmadad.com"
                  className="hover:text-[#4893cd] transition-colors"
                >
                  care@muftmadad.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Services (3 cols) */}
          <div className="lg:col-span-3 space-y-2 lg:space-y-3">
            <h4 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4893cd]" />
              {data.servicesTitle}
            </h4>
            <ul className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm">
              {data.services.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-[#4893cd] transition-colors block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Specialties (2 cols) */}
          <div className="lg:col-span-2 space-y-2 lg:space-y-3">
            <h4 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ed9f3d]" />
              {data.specialitiesTitle}
            </h4>
            <ul className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm">
              {data.specialities.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-[#ed9f3d] transition-colors block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Prominent Sign In & Create Account, Portals, Cities (3 cols) */}
          <div className="lg:col-span-3 space-y-3 lg:space-y-3.5">
            <h4 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#4893cd] to-[#ed9f3d]" />
              {data.portalsTitle}
            </h4>

            {/* 🔥 PROMINENT SIGN IN & CREATE ACCOUNT BUTTONS 🔥 */}
            <div className="flex items-center gap-2 lg:gap-2.5">
              {/* Sign In Button (Logo Blue Accent) */}
              <Link
                href="/login"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-[#4893cd]/60 hover:border-[#4893cd] text-white hover:text-[#4893cd] text-xs lg:text-sm font-bold shadow-sm transition-all group"
              >
                <LogIn className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#4893cd] group-hover:scale-110 transition-transform flex-shrink-0" />
                <span>{data.signInText}</span>
              </Link>

              {/* Create Account Button (Logo Amber/Orange Accent) */}
              <Link
                href="/signup"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl bg-gradient-to-r from-[#ed9f3d] to-[#d98220] hover:from-[#f5aa4d] hover:to-[#e08925] text-slate-950 font-extrabold text-xs lg:text-sm shadow-md shadow-amber-950/40 transition-all hover:scale-[1.02] flex-shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-950" />
                <span>{data.signUpText}</span>
              </Link>
            </div>

            {/* Other Portal Links */}
            <div className="flex flex-wrap gap-1.5 text-xs lg:text-sm pt-0.5">
              <Link
                href="/labs/workspace"
                className="inline-flex items-center gap-1 px-2.5 py-1 lg:px-3 lg:py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs lg:text-xs"
              >
                <span>{data.labWorkspaceText}</span>
                <span className="text-[9px] lg:text-[10px] px-1 py-0.2 rounded bg-[#4893cd]/20 text-[#4893cd] font-bold">
                  Staff
                </span>
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1 px-2.5 py-1 lg:px-3 lg:py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs lg:text-xs"
              >
                <span>{data.patientReviewsText}</span>
              </Link>
            </div>

            {/* Covered Cities Chips */}
            <div>
              <span className="text-[10px] lg:text-xs uppercase font-bold text-[#ed9f3d] tracking-wider block mb-1.5">
                Cities Covered
              </span>
              <div className="flex flex-wrap gap-1 lg:gap-1.5 text-[11px] lg:text-xs">
                {data.cities.map((city, idx) => (
                  <Link
                    key={idx}
                    href={`/cities/${encodeURIComponent(city.toLowerCase())}`}
                    className="px-2 py-0.5 lg:px-2.5 lg:py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-[#4893cd]/60 transition-colors"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-0.5">
              {socialLinks.map(({ label, href, color, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-[#4893cd]/60 flex items-center justify-center hover:scale-105 transition-all"
                >
                  <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color }} fill="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR WITH DIRECT SIGN IN / SIGN UP SHORTCUTS ── */}
        <div className="border-t border-slate-800/80 mt-6 lg:mt-8 pt-4 lg:pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] lg:text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#4893cd] shrink-0" />
            <span>{data.rights}</span>
          </div>

          <div className="flex items-center gap-3.5 lg:gap-5 text-[11px] lg:text-xs flex-wrap justify-center">
            {/* Quick auth links in bottom bar */}
            <Link href="/login" className="text-[#4893cd] hover:underline font-semibold">
              Sign In
            </Link>
            <span>•</span>
            <Link href="/signup" className="text-[#ed9f3d] hover:underline font-semibold">
              Create Account
            </Link>
            <span>•</span>
            <Link href="/care" className="hover:text-[#4893cd] transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/care" className="hover:text-[#4893cd] transition-colors">
              Terms
            </Link>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#4893cd] hover:text-[#72aee0] font-semibold cursor-pointer ml-1"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
