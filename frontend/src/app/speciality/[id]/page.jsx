"use client";

import { databaseImageSrc } from "@/lib/image-source.mjs";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/languageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MuftMadadBlogs from "@/components/Blogs";
import DynamicTestimonialSection from "@/components/dynamicTestimonials";
import { ArrowLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SpecialityPage({ params }) {
  const { id } = use(params);
  const { lang } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("treatments");
  const [speciality, setSpeciality] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const specRes = await axios.get(`${API}/specialities/${id}`, {
          withCredentials: true,
        });
        const spec = specRes.data.data;
        setSpeciality(spec);
        const specialityNameEn = spec?.name_en || "";

        const [treatRes, hospRes, docRes] = await Promise.allSettled([
          axios.get(`${API}/admin/getBySpecialty/${id}`, {
            withCredentials: true,
          }),
          axios.get(
            `${API}/hospitals?specialty=${encodeURIComponent(specialityNameEn)}`,
            { withCredentials: true },
          ),
          axios.get(
            `${API}/doctors?specialty=${encodeURIComponent(specialityNameEn)}`,
            { withCredentials: true },
          ),
        ]);

        if (treatRes.status === "fulfilled") {
          const d = treatRes.value.data;
          const list = Array.isArray(d)
            ? d
            : Array.isArray(d?.data)
              ? d.data
              : [];
          setTreatments(list);
          console.log("treatments loaded:", list.length, list); // remove after confirming
        }
        if (hospRes.status === "fulfilled") {
          const d = hospRes.value.data;
          setHospitals(Array.isArray(d) ? d : d?.data || []);
        }
        if (docRes.status === "fulfilled") {
          const d = docRes.value.data;
          setDoctors(Array.isArray(d) ? d : d?.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load speciality");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const tabs = [
    {
      id: "treatments",
      label: lang === "en" ? "Treatments" : "उपचार",
      count: treatments.length,
    },
    {
      id: "hospitals",
      label: lang === "en" ? "Hospitals" : "अस्पताल",
      count: hospitals.length,
    },
    {
      id: "doctors",
      label: lang === "en" ? "Doctors" : "डॉक्टर",
      count: doctors.length,
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 tracking-widest uppercase">
          Loading
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-500 text-sm text-center">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );

  if (!speciality) return null;

  const specialityName =
    lang === "en" ? speciality.name_en : speciality.name_hi;
  const specialityDesc =
    lang === "en" ? speciality.description_en : speciality.description_hi;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-gray-100 pt-14 sm:pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-10">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-4 sm:mb-5 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {lang === "en" ? "Back" : "वापस"}
          </button>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="flex flex-col gap-3 sm:gap-4">
              <span className="inline-block text-[10px] sm:text-xs font-medium tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full w-fit">
                {lang === "en" ? "Medical Specialty" : "चिकित्सा विशेषता"}
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-gray-900 font-serif">
                {specialityName}
              </h1>

              {specialityDesc && (
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg">
                  {specialityDesc}
                </p>
              )}

              {/* Stats strip */}
              <div className="flex items-center w-fit bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mt-1">
                {[
                  {
                    num: treatments.length,
                    label: lang === "en" ? "Treatments" : "उपचार",
                  },
                  {
                    num: hospitals.length,
                    label: lang === "en" ? "Hospitals" : "अस्पताल",
                  },
                  {
                    num: doctors.length,
                    label: lang === "en" ? "Doctors" : "डॉक्टर",
                  },
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <div className="w-px h-8 sm:h-9 bg-gray-200 shrink-0" />
                    )}
                    <div className="flex flex-col items-center px-3 sm:px-5 py-2.5 sm:py-3 gap-0.5">
                      <span className="text-base sm:text-lg font-semibold text-gray-900 leading-none">
                        {s.num}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">
                        {s.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {speciality.image && (
              <div className="hidden md:block">
                <img
                  src={databaseImageSrc(speciality.image)}
                  alt={specialityName}
                  className="w-full h-52 lg:h-60 object-cover rounded-2xl shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0
                ${activeTab === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-700"}`}
            >
              {tab.label}
              <span
                className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold
                ${activeTab === tab.id ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}
              >
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-4 right-4 sm:left-6 sm:right-6 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-14 sm:pb-16">
        {/* Treatments */}
        {activeTab === "treatments" && (
          <div>
            <SectionTitle
              title={lang === "en" ? "Treatments" : "उपचार"}
              count={treatments.length}
            />
            {treatments.length === 0 ? (
              <EmptyState
                icon="💊"
                message={
                  lang === "en"
                    ? "No treatments found for this specialty yet."
                    : "अभी कोई उपचार नहीं मिला।"
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {treatments.map((t) => (
                  <div
                    key={t.id || t.slug}
                    onClick={() => router.push(`/treatments/${t.id}`)}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    {t.treatment_image && (
                      <div className="h-36 sm:h-40 overflow-hidden">
                        <img
                          src={databaseImageSrc(t.treatment_image)}
                          alt={t.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-3 sm:p-4 flex flex-col gap-2">
                      {t.comes_in && (
                        <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                          {t.comes_in}
                        </span>
                      )}
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                        {t.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {t.overview_description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {t.surgery_duration && (
                          <Chip>⏱ {t.surgery_duration}</Chip>
                        )}
                        {t.success_rate && <Chip>✓ {t.success_rate}</Chip>}
                        {t.recovery_time && <Chip>📅 {t.recovery_time}</Chip>}
                        {t.ayushman_covered && <Chip green>🏛 Ayushman</Chip>}
                      </div>
                      <button className="mt-0.5 text-[11px] sm:text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 transition-colors">
                        {lang === "en" ? "View Details →" : "विवरण देखें →"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hospitals */}
        {activeTab === "hospitals" && (
          <div>
            <SectionTitle
              title={lang === "en" ? "Hospitals" : "अस्पताल"}
              count={hospitals.length}
            />
            {hospitals.length === 0 ? (
              <EmptyState
                icon="🏥"
                message={
                  lang === "en"
                    ? "No hospitals found for this specialty yet."
                    : "अभी कोई अस्पताल नहीं मिला।"
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {hospitals.map((h) => (
                  <div
                    key={h.id || h.uuid}
                    onClick={() => router.push(`/allHospitals/${h.id}`)}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    {h.photo ? (
                      <div className="h-32 sm:h-36 overflow-hidden">
                        <img
                          src={h.photo}
                          alt={h.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-32 sm:h-36 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-3xl sm:text-4xl">
                        🏥
                      </div>
                    )}
                    <div className="p-3 sm:p-4 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                          {h.name}
                        </h3>
                        {h.is_verified && (
                          <span className="shrink-0 text-[9px] sm:text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      {h.city && (
                        <p className="text-[11px] sm:text-xs text-gray-400">
                          📍 {h.city}
                          {h.state ? `, ${h.state}` : ""}
                        </p>
                      )}
                      {h.phone && (
                        <p className="text-[11px] sm:text-xs text-gray-400">
                          📞 {h.phone}
                        </p>
                      )}
                      {h.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-xs">
                            {"★".repeat(Math.round(h.rating))}
                          </span>
                          <span className="text-[11px] sm:text-xs text-gray-400">
                            {h.rating}/5
                          </span>
                        </div>
                      )}
                      {h.timing_display && (
                        <p className="text-[11px] sm:text-xs text-gray-400">
                          🕐 {h.timing_display}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Doctors */}
        {activeTab === "doctors" && (
          <div>
            <SectionTitle
              title={lang === "en" ? "Doctors" : "डॉक्टर"}
              count={doctors.length}
            />
            {doctors.length === 0 ? (
              <EmptyState
                icon="👨‍⚕️"
                message={
                  lang === "en"
                    ? "No doctors found for this specialty yet."
                    : "अभी कोई डॉक्टर नहीं मिला।"
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {doctors.map((d) => (
                  <div
                    key={d.uuid || d.id}
                    onClick={() => router.push(`/allDoctors/${d.uuid}`)}
                    className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex gap-3 items-start">
                      {d.photo ? (
                        <img
                          src={d.photo}
                          alt={d.name}
                          className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-blue-50 border-2 border-gray-100 flex items-center justify-center text-lg sm:text-xl shrink-0">
                          👨‍⚕️
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {d.name}
                          </h3>
                          {d.is_verified && (
                            <span className="text-green-500 text-xs shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                        {d.degrees?.length > 0 && (
                          <p className="text-[11px] sm:text-xs text-blue-600 truncate">
                            {d.degrees.join(", ")}
                          </p>
                        )}
                        {d.specialities?.length > 0 && (
                          <p className="text-[11px] sm:text-xs text-purple-600 truncate">
                            {d.specialities.join(", ")}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {d.experience_in_years && (
                            <Chip>🩺 {d.experience_in_years} yrs</Chip>
                          )}
                          {d.city && <Chip>📍 {d.city}</Chip>}
                        </div>
                        {d.consultation_fee && (
                          <p className="text-[11px] sm:text-xs font-semibold text-green-600">
                            ₹{d.consultation_fee}{" "}
                            <span className="font-normal text-gray-400">
                              consultation
                            </span>
                          </p>
                        )}
                        {d.average_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xs">
                              {"★".repeat(Math.round(d.average_rating))}
                            </span>
                            <span className="text-[11px] sm:text-xs text-gray-400">
                              {d.average_rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MuftMadadBlogs />
        <DynamicTestimonialSection />
      </div>
      <Footer />
    </div>
  );
}

function SectionTitle({ title, count }) {
  return (
    <h2 className="flex items-center gap-2.5 mb-4 sm:mb-5 text-lg sm:text-xl font-serif font-light text-gray-900">
      {title}
      <span className="font-sans text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </h2>
  );
}

function Chip({ children, green = false }) {
  return (
    <span
      className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border
      ${
        green
          ? "text-green-700 bg-green-50 border-green-100"
          : "text-gray-400 bg-gray-50 border-gray-100"
      }`}
    >
      {children}
    </span>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl py-10 sm:py-14 flex flex-col items-center gap-3 text-center">
      <span className="text-3xl sm:text-4xl opacity-30">{icon}</span>
      <p className="text-xs sm:text-sm text-gray-400">{message}</p>
    </div>
  );
}
