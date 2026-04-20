"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/languageContext";
import { getTreatmentIdFromLabel } from "@/data/treatmentPageData";
import axios from "axios";

const CountUp = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const increment = end / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const TreatmentItem = ({ icon, label, onClick }) => (
  <div
    className="flex flex-col items-center gap-3 p-3 cursor-pointer transition hover:scale-105"
    onClick={onClick}
  >
    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center bg-blue-50 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
      <img src={icon} alt={label} className="w-full h-full object-cover" />
    </div>
    <p className="text-[13px] sm:text-sm font-semibold text-gray-800 leading-snug text-center break-words w-full line-clamp-2">
      {label}
    </p>
  </div>
);

// Separate component that uses useSearchParams
function MedicalTreatmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const currentLang = lang || searchParams.get("lang") || "hi";

  // State for API-fetched treatments
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/getAll`,
          {
            params: { lang: currentLang },
          },
        );

        // Map response to extract only png_logo and name
        const fetched = response.data.map((item) => ({
          icon: item.png_logo,
          label: item.name,
         
id: item.id,
specialty_id: item.specialty_id,
        }));

        setTreatments(fetched);
      } catch (err) {
        console.error("Failed to fetch treatments:", err);
        setError("Failed to load treatments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, [currentLang]);

  // Naya - id pass karo, specialty_id nahi
  const handleTreatmentClick = (id) => {
    router.push(`/treatments/${id}`);
  };

  const pageTitle =
    currentLang === "en"
      ? "Treatments We Provide"
      : "हमारे द्वारा प्रदान किए जाने वाले उपचार";

  const stats =
    currentLang === "en"
      ? {
          consulted: "Consulted Patients",
          surgeries: "Surgeries Performed",
          cities: "Cities",
          hospitals: "Partner Hospitals",
        }
      : {
          consulted: "परामर्शित मरीज",
          surgeries: "किए गए सर्जरी",
          cities: "शहर",
          hospitals: "सहयोगी अस्पताल",
        };

  return (
    <div className="bg-white">
      <div className="h-20 sm:h-24 md:h-28"></div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium uppercase bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            {pageTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {currentLang === "en"
              ? "Free treatment available for 25+ major diseases with up to 80% discount"
              : "25+ प्रमुख रोगों का निःशुल्क इलाज 80% तक छूट के साथ उपलब्ध"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Treatments Grid */}
       {/* Treatments Grid */}
{/* Treatments Grid */}
{!loading && !error && (
  <>
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 mb-6">
      {treatments.slice(0, 15).map((treatment, index) => (
        <TreatmentItem
          key={index}
          icon={treatment.icon}
          label={treatment.label}
          onClick={() => handleTreatmentClick(treatment.id)}
        />
      ))}
    </div>

    {treatments.length > 15 && (
      <div className="flex justify-center mb-10">
        <button
  onClick={() => router.push("/treatments")}
  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all shadow-md text-sm"
>
  View All Treatments ({treatments.length}) →
</button>
      </div>
    )}
  </>
)}
      </section>

      <section className="bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-16 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="group text-center">
              <div className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-all duration-500">
                <CountUp end={1000} suffix="+" />
              </div>
              <p className="text-md lg:text-xl font-medium text-gray-700">
                {stats.consulted}
              </p>
            </div>

            <div className="group text-center">
              <div className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent group-hover:scale-110 transition-all duration-500">
                <CountUp end={200} suffix="+" />
              </div>
              <p className="text-md lg:text-xl font-medium text-gray-700">
                {stats.surgeries}
              </p>
            </div>

            <div className="group text-center">
              <div className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent group-hover:scale-110 transition-all duration-500">
                <CountUp end={5} suffix="+" />
              </div>
              <p className="text-md lg:text-xl font-medium text-gray-700">
                {stats.cities}
              </p>
            </div>

            <div className="group text-center">
              <div className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-all duration-500">
                <CountUp end={12} suffix="+" />
              </div>
              <p className="text-md lg:text-xl font-semibold text-gray-700">
                {stats.hospitals}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main component with Suspense wrapper
export default function MedicalTreatmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <MedicalTreatmentsContent />
    </Suspense>
  );
}
