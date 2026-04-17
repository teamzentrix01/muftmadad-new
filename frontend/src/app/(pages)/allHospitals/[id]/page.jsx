"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Phone,
  MapPin,
  Clock,
  Users,
  Stethoscope,
  Star,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ZoomIn,
  X,
  Images,
  Shield,
  Building2,
  Pill,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ══════════════════════════════════════════════════════
   GALLERY LIGHTBOX
══════════════════════════════════════════════════════ */
const GalleryTab = ({ images }) => {
  const [idx, setIdx] = useState(null);

  useEffect(() => {
    const fn = (e) => {
      if (idx === null) return;
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowLeft")
        setIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [idx, images.length]);

  if (!images?.length)
    return (
      <EmptyState
        icon={<Images className="w-8 h-8" />}
        msg="No gallery images yet."
      />
    );

  return (
    <>
      <SectionHeading>
        Gallery <PillBadge>{images.length} photos</PillBadge>
      </SectionHeading>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 focus:outline-none transition-all"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-all">
              <div className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-1.5 transition-opacity">
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {idx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIdx(null)}
        >
          <button
            onClick={() => setIdx(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 z-10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs px-3 py-1 rounded-full">
            {idx + 1} / {images.length}
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-3 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 z-10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((i) => (i + 1) % images.length);
                }}
                className="absolute right-3 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 z-10 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={images[idx]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

/* ══════════════════════════════════════════════════════
   REUSABLE COMPONENTS
══════════════════════════════════════════════════════ */
const SectionHeading = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2 flex-wrap">
    {children}
  </h3>
);

const PillBadge = ({ children, color = "gray" }) => {
  const cls =
    {
      gray: "bg-gray-100 text-gray-500",
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
    }[color] || "bg-gray-100 text-gray-500";
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
};

const EmptyState = ({ icon, msg }) => (
  <div className="py-16 flex flex-col items-center gap-3 text-gray-300">
    {icon}
    <p className="text-sm text-gray-400">{msg}</p>
  </div>
);

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   TAB: OVERVIEW
══════════════════════════════════════════════════════ */
const KEY_POINTS = [
  "Free OPD (Outpatient Department) services for all patients.",
  "50% discount on all diagnostic tests.",
  "Free treatment, including all surgical procedures, for patients aged above 70 years.",
];

const OverviewTab = ({ h }) => (
  <div className="space-y-8">
    {/* Key Highlights — always shown */}
    <div>
      <SectionHeading>Key Highlights</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {KEY_POINTS.map((point, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl"
          >
            <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">{point}</p>
          </div>
        ))}
      </div>
    </div>

    {h.about && ( 
      <div>
        <SectionHeading>About</SectionHeading>
        <p className="text-sm text-gray-600 leading-7">{h.about}</p>
      </div>
    )}

    {(h.total_doctors > 0 ||
      h.total_specialities > 0 ||
      h.total_reviews > 0) && (
      <div>
        <SectionHeading>At a Glance</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Doctors",
              val: h.total_doctors,
              show: h.total_doctors > 0,
            },
            {
              label: "Specialities",
              val: h.total_specialities,
              show: h.total_specialities > 0,
            },
            {
              label: "Reviews",
              val: h.total_reviews,
              show: h.total_reviews > 0,
            },
            {
              label: "Rating",
              val: h.rating > 0 ? `${parseFloat(h.rating).toFixed(1)} ★` : null,
              show: h.rating > 0,
            },
          ]
            .filter((s) => s.show)
            .map((s, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-semibold text-gray-900 mb-1">
                  {s.val}
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
        </div>
      </div>
    )}

    <div>
      <SectionHeading>Contact & Timings</SectionHeading>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
        {h.address && (
          <InfoRow icon={MapPin} label="Address">
            {[h.address, h.city, h.state, h.pincode].filter(Boolean).join(", ")}
          </InfoRow>
        )}
        {h.timing_display && (
          <InfoRow icon={Clock} label="Timings">
            {h.timing_display}
          </InfoRow>
        )}
        {h.phone && (
          <InfoRow icon={Phone} label="Phone">
            <a
              href={`tel:${h.phone}`}
              className="text-blue-600 hover:underline"
            >
              {h.phone}
            </a>
          </InfoRow>
        )}
      </div>
    </div>

    {h.certifications?.length > 0 && (
      <div>
        <SectionHeading>Certifications</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {h.certifications.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full"
            >
              <CheckCircle className="w-3 h-3" />
              {c}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════
   TAB: DOCTORS — fetched dynamically by currently_serving
══════════════════════════════════════════════════════ */
const DoctorsTab = ({ doctors, loading }) => {
  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div>
      <SectionHeading>
        Doctors <PillBadge color="blue">{doctors?.length || 0}</PillBadge>
      </SectionHeading>
      {doctors?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map((doc, i) => (
            <Link
              href={`/allDoctors/${doc.uuid}`}
              key={doc.uuid || i}
              className="flex gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50/40 transition-colors cursor-pointer"
            >
              {doc.photo ? (
                <img
                  src={doc.photo}
                  alt={doc.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-lg">
                  👨‍⚕️
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {doc.name}
                  </p>
                  {doc.is_verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  )}
                </div>
                {doc.specialities?.length > 0 && (
                  <p className="text-xs text-blue-600 mt-0.5">
                    {doc.specialities.join(", ")}
                  </p>
                )}
                {doc.degrees?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc.degrees.join(", ")}
                  </p>
                )}
                {doc.experience_in_years && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    🩺 {doc.experience_in_years} yrs experience
                  </p>
                )}
                {doc.consultation_fee && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">
                    ₹{doc.consultation_fee} consultation
                  </p>
                )}
                {doc.average_rating > 0 && (
                  <p className="text-xs text-yellow-500 mt-0.5">
                    ⭐ {doc.average_rating}/5
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          msg="No doctors found serving at this hospital."
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   TAB: SPECIALITIES — from hospital.available_specialities
══════════════════════════════════════════════════════ */
// const SpecialitiesTab = ({ items }) => {

//   const router = useRouter(); // import useRouter from 'next/navigation'

//   return (
//     <div>
//       <SectionHeading>
//         Specialities <PillBadge color="purple">{items?.length || 0}</PillBadge>
//       </SectionHeading>
//       {items?.length > 0 ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//           {items.map((item, i) => (
//             <div
//               key={i}
//               onClick={() => {
//                 if (item.id) {
//                   router.push(`/speciality/${item.id}`);
//                 } else {
//                   alert("This Speciality will be added after some time");
//                 }
//               }}
//               className="flex items-center gap-3 p-3.5 bg-purple-50 border border-purple-100 rounded-xl hover:border-purple-300 hover:bg-purple-100 transition-colors cursor-pointer"
//             >
//               <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
//                 <Stethoscope className="w-4 h-4 text-purple-600" />
//               </div>
//               <span className="text-sm text-gray-700 font-medium flex-1">
//                 {item.name || item}
//               </span>
//               {!item.id && (
//                 <span className="text-[10px] text-orange-400 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full shrink-0">
//                   Coming Soon
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <EmptyState
//           icon={<Stethoscope className="w-8 h-8" />}
//           msg="No specialities listed."
//         />
//       )}
//     </div>
//   );
// };

const SpecialitiesTab = ({ items }) => ( 
  <div>
    <SectionHeading>
      Specialities <PillBadge color="purple">{items?.length || 0}</PillBadge>
    </SectionHeading>
    {items?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 bg-purple-50 border border-purple-100 rounded-xl"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium flex-1">
              {item.name || item}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Stethoscope className="w-8 h-8" />}
        msg="No specialities listed."
      />
    )}
  </div>
);

/* ══════════════════════════════════════════════════════
   TAB: TREATMENTS — from hospital.available_treatments
══════════════════════════════════════════════════════ */
const TreatmentsTab = ({ items }) => (
  <div>
    <SectionHeading>
      Treatments <PillBadge color="orange">{items?.length || 0}</PillBadge>
    </SectionHeading>
    {items?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 bg-orange-50 border border-orange-100 rounded-xl hover:border-orange-200 transition-colors"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">{item}</span>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Pill className="w-8 h-8" />}
        msg="No treatments listed."
      />
    )}
  </div>
);

/* ══════════════════════════════════════════════════════
   TAB: SERVICES
══════════════════════════════════════════════════════ */
const ServicesTab = ({ items }) => (
  <div>
    <SectionHeading>
      Services <PillBadge color="green">{items?.length || 0}</PillBadge>
    </SectionHeading>
    {items?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-100 rounded-xl hover:border-green-200 transition-colors"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 ml-1" />
            <span className="text-sm text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Building2 className="w-8 h-8" />}
        msg="No services listed."
      />
    )}
  </div>
);

/* ══════════════════════════════════════════════════════
   SKELETON
══════════════════════════════════════════════════════ */
const SkeletonPage = () => (
  <div className="min-h-screen bg-gray-50 pt-20">
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 animate-pulse">
      <div className="h-52 bg-gray-200 rounded-2xl" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${70 + i * 7}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function HospitalDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

 const fetchData = async () => {
  if (!id) {
    setLoading(false);
    return;
  }
  setLoading(true);
  setError("");
  try {
    // 1. Fetch hospital details
    const res = await axios.get(`${API}/hospitals/${id}`, {
      withCredentials: true,
    });
    const data = res.data?.data || res.data;

    // 2. Fetch doctors and all specialities in parallel
    if (data?.name) {
      setDoctorsLoading(true);
      try {
        const [docRes, allSpecRes] = await Promise.all([
          axios.get(
            `${API}/doctors?hospital=${encodeURIComponent(data.name.toLowerCase())}`,
            { withCredentials: true }
          ),
          axios.get(`${API}/specialities`, { withCredentials: true }),
        ]);

        const docData = docRes.data?.data || docRes.data || [];
        setDoctors(Array.isArray(docData) ? docData : []);

        // Enrich available_specialities with IDs by matching names
        const allSpecs = allSpecRes.data?.data || allSpecRes.data || [];
        const enriched = (data.available_specialities || []).map((name) => {
          const match = allSpecs.find(
            (s) => s.name_en?.toLowerCase() === name?.toLowerCase()
          );
          return { name, id: match?.id || null };
        });

        setHospital({ ...data, available_specialities: enriched });
      } catch {
        setDoctors([]);
        setHospital(data);
      } finally {
        setDoctorsLoading(false);
      }
    } else {
      setHospital(data);
    }
  } catch (err) {
    setError(
      err.response?.status === 404
        ? "Hospital not found."
        : err.response?.data?.message || "Failed to load. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [id]);

  const TABS = [
    { id: "overview", label: "Overview", count: null },
    { id: "doctors", label: "Doctors", count: doctors.length },
    {
      id: "specialities",
      label: "Specialities",
      count: hospital?.available_specialities?.length || 0,
    },
    {
      id: "treatments",
      label: "Treatments",
      count: hospital?.available_treatments?.length || 0,
    },
    {
      id: "services",
      label: "Services",
      count: hospital?.available_services?.length || 0,
    },
    {
      id: "gallery",
      label: "Gallery",
      count: hospital?.gallery_images?.length || 0,
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab h={hospital} />;
      case "doctors":
        return <DoctorsTab doctors={doctors} loading={doctorsLoading} />;
      case "specialities":
        return (
          <SpecialitiesTab items={hospital?.available_specialities || []} />
        );
      case "treatments":
        return <TreatmentsTab items={hospital?.available_treatments || []} />;
      case "services":
        return <ServicesTab items={hospital?.available_services || []} />;
      case "gallery":
        return <GalleryTab images={hospital?.gallery_images || []} />;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <SkeletonPage />
      </>
    );

  if (!id || error)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-sm w-full text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-gray-600 text-sm">
              {error || "No hospital ID provided."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
              <Link
                href="/allHospitals"
                className="inline-flex items-center gap-2 px-5 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm rounded-lg transition-colors"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    );

  const fullAddress = [
    hospital.address,
    hospital.city,
    hospital.state,
    hospital.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="min-h-screen bg-[#f8f8f6]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-20">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {hospital.photo && (
            <div className="h-52 sm:h-64 overflow-hidden">
              <img
                src={hospital.photo}
                alt={hospital.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {hospital.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {hospital.certifications?.slice(0, 2).map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full"
                    >
                      <Shield className="w-3 h-3" />
                      {c}
                    </span>
                  ))}
                </div>
                <h1
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-2xl sm:text-3xl text-gray-900 font-normal mb-2 leading-tight"
                >
                  {hospital.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  {fullAddress && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {fullAddress}
                    </span>
                  )}
                  {hospital.rating > 0 && (
                    <span className="flex items-center gap-1 text-yellow-600 font-medium">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {parseFloat(hospital.rating).toFixed(1)}
                      {hospital.total_reviews > 0 && (
                        <span className="text-gray-400 font-normal ml-0.5">
                          ({hospital.total_reviews})
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              {hospital.phone && (
                <a
                  href={`tel:${hospital.phone}`}
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" /> {hospital.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors
                    ${activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-gray-100 text-gray-600" : "bg-gray-50 text-gray-400"}`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div key={activeTab} style={{ animation: "fadeUp 0.2s ease-out" }}>
              {renderTab()}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
