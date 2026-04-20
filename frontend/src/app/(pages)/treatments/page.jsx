"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/languageContext";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

function AllTreatmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const currentLang = lang || searchParams.get("lang") || "hi";

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
          { params: { lang: currentLang } }
        );
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

  const handleTreatmentClick = (id) => {
    router.push(`/treatments/${id}`);
  };

  const pageTitle =
    currentLang === "en" ? "All Treatments" : "सभी उपचार";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="h-20 sm:h-24 md:h-28"></div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium uppercase bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {pageTitle}
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            {currentLang === "en"
              ? `${treatments.length} treatments available`
              : `${treatments.length} उपचार उपलब्ध हैं`}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* All Treatments Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {treatments.map((treatment, index) => (
              <TreatmentItem
                key={index}
                icon={treatment.icon}
                label={treatment.label}
                onClick={() => handleTreatmentClick(treatment.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function AllTreatmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AllTreatmentsContent />
    </Suspense>
  );
}