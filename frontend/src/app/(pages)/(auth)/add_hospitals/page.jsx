"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Image as ImageIcon } from "lucide-react";
import React, { Fragment, useState, useEffect } from "react";
import {
  Save,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  MapPin,
  FileText,
  Clock,
  Award,
  BarChart3,
  Globe,
  Shield,
  UserPlus,
  Users,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// ─── CertificateUploadField ───────────────────────────────────────────────────
const CertificateUploadField = ({ files, onAdd, onRemove }) => {
  const handleFileChange = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => onAdd(reader.result, file.name);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };
  return (
    <div className="mt-3">
      <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-gray-100 hover:bg-blue-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-all text-sm text-gray-600 hover:text-blue-600">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Upload Certificate from Device
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {files?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {files.map((f, i) => (
            <div
              key={i}
              className="relative group border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col items-center justify-center w-24 h-24"
            >
              {f.data?.startsWith("data:image") ? (
                <img
                  src={f.data}
                  alt={f.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 p-2">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-[9px] text-gray-500 text-center truncate w-full px-1">
                    {f.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ImageUploadField ─────────────────────────────────────────────────────────
const ImageUploadField = ({
  label,
  value,
  onChange,
  placeholder = "https://...",
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value.startsWith("data:") ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm mb-2"
      />
      <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-gray-100 hover:bg-blue-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-all text-sm text-gray-600 hover:text-blue-600">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Upload From Device
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {value && (
        <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 group">
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  );
};

const AVAILABLE_SERVICES = [
  "Ambulance Available",
  "Blood Bank",
  "ICU",
  "Pharmacy",
  "Dialysis",
  "Emergency Services",
  "Laboratory",
  "Radiology / Imaging",
  "Operation Theatre",
  "Physiotherapy",
  "Canteen / Cafeteria",
  "Parking",
  "Wi-Fi",
  "24/7 Service",
];

// ─── SpecialityCheckboxSelector ──────────────────────────────────────────────
const SpecialityCheckboxSelector = ({ selected, onChange }) => {
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/specialities`,
          { withCredentials: true }
        );
        // Adjust based on your API response shape:
        // res.data, res.data.data, res.data.specialities, etc.
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? res.data?.specialities ?? [];
        setSpecialities(list);
      } catch (err) {
        setError("Failed to load specialities.");
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialities();
  }, []);

  const toggle = (name) => {
    const updated = selected.includes(name)
      ? selected.filter((s) => s !== name)
      : [...selected, name];
    onChange(updated);
  };

  if (loading)
    return (
      <p className="text-sm text-gray-400 animate-pulse">
        Loading specialities...
      </p>
    );
  if (error)
    return <p className="text-sm text-red-500">{error}</p>;
  if (specialities.length === 0)
    return <p className="text-sm text-gray-400">No specialities found.</p>;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200 max-h-64 overflow-y-auto">
        {specialities.map((sp) => {
          // Adjust field name: sp.name / sp.title / sp.speciality_name etc.
          const label = sp.name_en ?? sp.name_hi ?? sp.name ?? sp.title ?? sp.speciality_name ?? String(sp.id ?? sp.uuid ?? sp.slug ?? "Unknown");
const key = sp.id ?? sp.uuid ?? sp.slug ?? label;
          return (
            <label
  key={key}
  className="flex items-center gap-2 cursor-pointer group"
>
              <input
                type="checkbox"
                checked={selected.includes(label)}
                onChange={() => toggle(label)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                {label}
              </span>
            </label>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="mt-2 text-xs text-blue-600 font-medium">
          Selected ({selected.length}): {selected.join(", ")}
        </p>
      )}
    </div>
  );
};

const STORAGE_KEY = "pending_doctors";

const emptyDoctor = () => ({
  uuid: uuidv4(),
  name: "",
  email: "",
  photo: "",
  phone: "",
  degrees: [],
  specialities: [],
  sitting_plan: [],
  experience_in_years: "",
  registration_number: "",
  city: "",
  state: "",
  country: "",
  address: "",
  overview: "",
  is_active: true,
  is_verified: false,
  availability_schedule: [],
  consultation_fee: "",
  languages_spoken: [],
  awards_and_recognitions: [],
  publications: [],
  average_rating: 0,
  total_reviews: 0,
  total_patients_treated: 0,
  meta_title: "",
  meta_description: "",
  serving_in_hospitals: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
});

const emptyDoctorLocalArrays = () => ({
  degrees: "",
  specialities: "",
  languages_spoken: "",
  sitting_plan: "",
  awards_and_recognitions: "",
  publications: "",
});

// ─── Doctor Mini Form ─────────────────────────────────────────────────────────
const DoctorForm = ({ onAddToList, hospitalName }) => {
  const [doctorData, setDoctorData] = useState(emptyDoctor());
  const [localArrayInputs, setLocalArrayInputs] = useState(
    emptyDoctorLocalArrays(),
  );
  const [doctorStep, setDoctorStep] = useState(1);
  const [error, setError] = useState("");

  const doctorSteps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Professional" },
    { id: 3, label: "Location" },
    { id: 4, label: "Additional" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDoctorData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayInputChange = (e, field) => {
    setLocalArrayInputs((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleArrayInputBlur = (field) => {
    const array = localArrayInputs[field]
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);
    setDoctorData((prev) => ({ ...prev, [field]: array }));
  };

  const handleAddToList = () => {
    if (!doctorData.name.trim()) {
      setError("Doctor name is required.");
      return;
    }
    if (!doctorData.email.trim()) {
      setError("Doctor email is required.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(doctorData.email.trim())) {
      setError("Please enter a valid email (e.g. ajeet@gmail.com)");
      return;
    }
    setError("");
    const finalDoctor = {
      ...doctorData,
      serving_in_hospitals: hospitalName
        ? [hospitalName, ...doctorData.serving_in_hospitals]
        : doctorData.serving_in_hospitals,
    };
    onAddToList(finalDoctor);
    setDoctorData(emptyDoctor());
    setLocalArrayInputs(emptyDoctorLocalArrays());
    setDoctorStep(1);
  };

  const inputCls =
    "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";

  return (
    <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50/40">
      <div className="flex gap-2 mb-6 flex-wrap">
        {doctorSteps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setDoctorStep(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${doctorStep === s.id ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {doctorStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name <span className="text-red-500"></span>
            </label>
            <input
              type="text"
              name="name"
              value={doctorData.name}
              onChange={handleChange}
              placeholder="Dr. Full Name"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={doctorData.email}
              onChange={handleChange}
              placeholder="doctor@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={doctorData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Photo"
              value={doctorData.photo}
              onChange={(val) =>
                setDoctorData((prev) => ({ ...prev, photo: val }))
              }
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Is Active?
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                name="is_active"
                checked={doctorData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Is Verified?
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                name="is_verified"
                checked={doctorData.is_verified}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">Verified</span>
            </div>
          </div>
        </div>
      )}

      {doctorStep === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Degrees{" "}
              <span className="text-xs text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={localArrayInputs.degrees}
              onChange={(e) => handleArrayInputChange(e, "degrees")}
              onBlur={() => handleArrayInputBlur("degrees")}
              placeholder="MBBS, MD, DM"
              className={inputCls}
            />
            {doctorData.degrees.length > 0 && (
              <p className="mt-1 text-xs text-blue-600">
                Saved: {doctorData.degrees.join(", ")}
              </p>
            )}
          </div>
         <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Specialities
  </label>
  <SpecialityCheckboxSelector
    selected={doctorData.specialities}
    onChange={(updated) =>
      setDoctorData((prev) => ({ ...prev, specialities: updated }))
    }
  />
</div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sitting Plan{" "}
              <span className="text-xs text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={localArrayInputs.sitting_plan}
              onChange={(e) => handleArrayInputChange(e, "sitting_plan")}
              onBlur={() => handleArrayInputBlur("sitting_plan")}
              placeholder="Monday: 8AM-9PM, Tuesday: 7AM-6PM"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: Day: StartTime-EndTime
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Experience (years)
            </label>
            <input
              type="number"
              name="experience_in_years"
              value={doctorData.experience_in_years}
              onChange={handleChange}
              placeholder="5"
              min="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              name="registration_number"
              value={doctorData.registration_number}
              onChange={handleChange}
              placeholder="MCI-12345"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Consultation Fee (₹)
            </label>
            <input
              type="number"
              name="consultation_fee"
              value={doctorData.consultation_fee}
              onChange={handleChange}
              placeholder="500"
              min="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Languages Spoken{" "}
              <span className="text-xs text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={localArrayInputs.languages_spoken}
              onChange={(e) => handleArrayInputChange(e, "languages_spoken")}
              onBlur={() => handleArrayInputBlur("languages_spoken")}
              placeholder="English, Hindi"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {doctorStep === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={doctorData.city}
              onChange={handleChange}
              placeholder="Delhi"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={doctorData.state}
              onChange={handleChange}
              placeholder="Delhi"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={doctorData.country}
              onChange={handleChange}
              placeholder="India"
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={doctorData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Full Address"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {doctorStep === 4 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Overview / Bio
            </label>
            <textarea
              name="overview"
              value={doctorData.overview}
              onChange={handleChange}
              rows={3}
              placeholder="Doctor's bio and description..."
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Awards & Recognitions{" "}
              <span className="text-xs text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={localArrayInputs.awards_and_recognitions}
              onChange={(e) =>
                handleArrayInputChange(e, "awards_and_recognitions")
              }
              onBlur={() => handleArrayInputBlur("awards_and_recognitions")}
              placeholder="Best Doctor 2023, Excellence Award"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Publications{" "}
              <span className="text-xs text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={localArrayInputs.publications}
              onChange={(e) => handleArrayInputChange(e, "publications")}
              onBlur={() => handleArrayInputBlur("publications")}
              placeholder="Journal of Medicine 2023"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Total Reviews
              </label>
              <input
                type="number"
                name="total_reviews"
                value={doctorData.total_reviews}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Average Rating
              </label>
              <input
                type="number"
                name="average_rating"
                value={doctorData.average_rating}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="5"
                step="0.1"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Patients Treated
              </label>
              <input
                type="number"
                name="total_patients_treated"
                value={doctorData.total_patients_treated}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              name="meta_title"
              value={doctorData.meta_title}
              onChange={handleChange}
              placeholder="SEO title"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              value={doctorData.meta_description}
              onChange={handleChange}
              rows={2}
              placeholder="SEO description"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDoctorStep((s) => Math.max(1, s - 1))}
            disabled={doctorStep === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            type="button"
            onClick={() => setDoctorStep((s) => Math.min(4, s + 1))}
            disabled={doctorStep === 4}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToList}
          className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add to List
        </button>
      </div>

      {hospitalName && (
        <p className="mt-3 text-xs text-gray-400 text-right">
          Will be linked to:{" "}
          <span className="font-semibold text-blue-600">{hospitalName}</span>
        </p>
      )}
    </div>
  );
};

// ─── Doctor List Card ─────────────────────────────────────────────────────────
const DoctorListCard = ({ doctor, index, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
            {index + 1}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{doctor.name}</p>
            <p className="text-xs text-gray-500">
              {doctor.email}
              {doctor.specialities?.length > 0 &&
                ` · ${doctor.specialities.join(", ")}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600 bg-gray-50">
          {doctor.phone && (
            <span>
              <strong>Phone:</strong> {doctor.phone}
            </span>
          )}
          {doctor.experience_in_years && (
            <span>
              <strong>Experience:</strong> {doctor.experience_in_years} yrs
            </span>
          )}
          {doctor.consultation_fee && (
            <span>
              <strong>Fee:</strong> ₹{doctor.consultation_fee}
            </span>
          )}
          {doctor.city && (
            <span>
              <strong>City:</strong> {doctor.city}
            </span>
          )}
          {doctor.degrees?.length > 0 && (
            <span>
              <strong>Degrees:</strong> {doctor.degrees.join(", ")}
            </span>
          )}
          {doctor.registration_number && (
            <span>
              <strong>Reg No:</strong> {doctor.registration_number}
            </span>
          )}
          {doctor.sitting_plan?.length > 0 && (
            <span className="col-span-2 md:col-span-3">
              <strong>Sitting Plan:</strong> {doctor.sitting_plan.join(", ")}
            </span>
          )}
          {doctor.languages_spoken?.length > 0 && (
            <span>
              <strong>Languages:</strong> {doctor.languages_spoken.join(", ")}
            </span>
          )}
          <span>
            <strong>Status:</strong>{" "}
            <span
              className={doctor.is_active ? "text-green-600" : "text-red-500"}
            >
              {doctor.is_active ? "Active" : "Inactive"}
            </span>
            {" · "}
            <span
              className={doctor.is_verified ? "text-blue-600" : "text-gray-400"}
            >
              {doctor.is_verified ? "Verified" : "Unverified"}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Main Hospital Form ───────────────────────────────────────────────────────
const AdminHospitalForm = () => {
  const [formData, setFormData] = useState({
    uuid: uuidv4(),
    name: "",
    photo: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    location: null,
    about: "",
    timing_display: "",
    certifications: [],
    available_specialities: [],
    available_treatments: [],
    gallery_images: [],
    available_services: [],
    total_doctors: 0,
    total_specialities: 0,
    is_verified: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    certificate_files: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitDetails, setSubmitDetails] = useState(null);
  const [localArrayInputs, setLocalArrayInputs] = useState({
    certifications: "",
    available_specialities: "",
    available_treatments: "",
  });
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [doctorList, setDoctorList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showDoctorForm, setShowDoctorForm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doctorList));
    } catch {}
  }, [doctorList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayInputChange = (e, field) => {
    setLocalArrayInputs((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleArrayInputBlur = (field) => {
    const array = localArrayInputs[field]
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);
    setFormData((prev) => ({ ...prev, [field]: array }));
  };

  const handleGalleryUrlBlur = () => {
    const urls = galleryUrlInput
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u);
    if (urls.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      gallery_images: [...prev.gallery_images, ...urls],
    }));
    setGalleryUrlInput("");
  };

  const handleGalleryFileUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          gallery_images: [...prev.gallery_images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  const handleServiceCheckbox = (service) => {
    setFormData((prev) => {
      const updated = prev.available_services.includes(service)
        ? prev.available_services.filter((s) => s !== service)
        : [...prev.available_services, service];
      return { ...prev, available_services: updated };
    });
  };

  const handleAddCertificateFile = (data, name) => {
    setFormData((prev) => ({
      ...prev,
      certificate_files: [...prev.certificate_files, { data, name }],
    }));
  };

  const handleRemoveCertificateFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      certificate_files: prev.certificate_files.filter((_, i) => i !== index),
    }));
  };

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }));
  };

  const handleAddDoctorToList = (doctor) => {
    setDoctorList((prev) => [...prev, doctor]);
    setShowDoctorForm(false);
  };

  const handleRemoveDoctor = (index) => {
    setDoctorList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setMessage({ type: "error", text: "Hospital name is required." });
        return;
      }
      if (!formData.phone.trim()) {
        setMessage({ type: "error", text: "Phone number is required." });
        return;
      }
      if (!formData.email.trim()) {
        setMessage({ type: "error", text: "Email is required." });
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.address.trim()) {
        setMessage({ type: "error", text: "Address is required." });
        return;
      }
    }
    setMessage({ type: "", text: "" });
    setCurrentStep((prev) => Math.min(steps.length, prev + 1));
  };

  const resetAll = () => {
    setFormData({
      uuid: uuidv4(),
      name: "",
      photo: "",
      slug: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      location: null,
      about: "",
      timing_display: "",
      certifications: [],
      available_specialities: [],
      available_treatments: [],
      gallery_images: [],
      available_services: [],
      total_doctors: 0,
      total_specialities: 0,
      is_verified: false,
      is_active: true,
      meta_title: "",
      meta_description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      certificate_files: [],
    });
    setLocalArrayInputs({
      certifications: "",
      available_specialities: "",
      available_treatments: "",
    });
    setDoctorList([]);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(1);
    setGalleryUrlInput("");
    setSubmitDetails(null);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Hospital name is required." });
      setCurrentStep(1);
      return;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: "error", text: "Phone number is required." });
      setCurrentStep(1);
      return;
    }
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Email is required." });
      setCurrentStep(1);
      return;
    }
    if (!formData.address.trim()) {
      setMessage({ type: "error", text: "Address is required." });
      setCurrentStep(2);
      return;
    }

    // City, State, Country remain optional - no validation

    setLoading(true);
    setMessage({ type: "", text: "" });
    setSubmitDetails(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/hospitals`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      // Doctors submission remains optional
      let doctorsOk = 0;
      let doctorsFailed = [];

      if (doctorList.length > 0) {
        const results = await Promise.allSettled(
          doctorList.map((doc) =>
            axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/doctors`,
              {
                ...doc,
                experience_in_years:
                  doc.experience_in_years !== ""
                    ? Number(doc.experience_in_years)
                    : 0,
                consultation_fee:
                  doc.consultation_fee !== ""
                    ? Number(doc.consultation_fee)
                    : 0,
                average_rating:
                  doc.average_rating !== "" ? Number(doc.average_rating) : 0,
                total_reviews:
                  doc.total_reviews !== "" ? Number(doc.total_reviews) : 0,
                total_patients_treated:
                  doc.total_patients_treated !== ""
                    ? Number(doc.total_patients_treated)
                    : 0,
              },
              {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
              },
            ),
          ),
        );
        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            doctorsOk++;
          } else {
            doctorsFailed.push({
              name: doctorList[idx].name,
              reason:
                result.reason?.response?.data?.message ||
                result.reason?.message ||
                "Unknown error",
            });
          }
        });
      }

      localStorage.removeItem(STORAGE_KEY);
      const allGood = doctorsFailed.length === 0;
      setSubmitDetails({ doctorsOk, doctorsFailed });
      setMessage({
        type: allGood ? "success" : "warning",
        text: allGood
          ? `Hospital created successfully${doctorsOk > 0 ? ` with ${doctorsOk} doctor(s)!` : "!"}`
          : `Hospital created. ${doctorsOk} doctor(s) saved, ${doctorsFailed.length} failed.`,
      });
      if (allGood) setTimeout(resetAll, 2500);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to create hospital profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: Building2, color: "text-blue-600" },
    { id: 2, title: "Location", icon: MapPin, color: "text-orange-600" },
    { id: 3, title: "About", icon: FileText, color: "text-blue-600" },
    { id: 4, title: "Timing", icon: Clock, color: "text-orange-600" },
    { id: 5, title: "Quality", icon: Award, color: "text-blue-600" },
    { id: 6, title: "Statistics", icon: BarChart3, color: "text-orange-600" },
    { id: 7, title: "Gallery", icon: ImageIcon, color: "text-blue-600" },
    { id: 8, title: "Doctors", icon: Users, color: "text-green-600" },
    { id: 9, title: "SEO & Status", icon: Globe, color: "text-blue-600" },
  ];

  return (
    <Fragment>
      <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8 ">
        <Navbar />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 bg-white rounded-xl shadow-md p-8 border-t-4 border-blue-500">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-medium md:text-4xl text-gray-900 mb-2">
              Add New Hospital
            </h1>
            <p className="text-lg text-gray-600">
              Fill in all the required information across multiple sections
            </p>
          </div>

          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max px-4">
              {steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (step.id <= currentStep) setCurrentStep(step.id);
                    }}
                    type="button"
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all border-2 ${currentStep === step.id ? "bg-white border-blue-500 shadow-md" : step.id < currentStep ? "bg-white border-green-400" : "bg-white border-gray-200 opacity-50 cursor-not-allowed"}`}
                  >
                    <StepIcon
                      className={`w-5 h-5 ${currentStep === step.id ? step.color : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-medium ${currentStep === step.id ? "text-gray-900" : "text-gray-600"}`}
                    >
                      {step.title}
                      {step.id === 8 && doctorList.length > 0 && (
                        <span className="ml-1.5 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {doctorList.length}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === "success" ? "bg-green-50 border-2 border-green-500 text-green-800" : message.type === "warning" ? "bg-yellow-50 border-2 border-yellow-500 text-yellow-800" : "bg-red-50 border-2 border-red-500 text-red-800"}`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${message.type === "warning" ? "text-yellow-600" : "text-red-600"}`}
                />
              )}
              <div>
                <p className="font-medium">{message.text}</p>
                {submitDetails?.doctorsFailed?.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {submitDetails.doctorsFailed.map((d, i) => (
                      <li key={i}>
                        • <strong>{d.name}</strong>: {d.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            className="bg-white rounded-xl shadow-md p-8 border-l-4 border-orange-500"
          >
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    Basic Information
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UUID (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value={formData.uuid}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-600 cursor-not-allowed font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                      maxLength={200}
                      placeholder="Enter hospital name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug (Auto-generated from name)
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="hospital-name-slug"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly version of the hospital name
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      maxLength={20}
                      placeholder="+91 1234567890"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={255}
                      placeholder="hospital@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Hospital Photo"
                      value={formData.photo}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, photo: val }))
                      }
                      placeholder="https://example.com/hospital-photo.jpg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {/* Step 2 - Remove all * from labels */}
            {/* Step 2 - Only Address has red star */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    Location Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Street address, landmark, area"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="Enter city (optional)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="Enter state (optional)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="Enter pincode (optional)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="Enter country (optional)"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    About Hospital
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About Hospital
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Detailed description about the hospital, facilities, services, etc."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    Timing & Operations
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timing Display
                  </label>
                  <input
                    type="text"
                    name="timing_display"
                    value={formData.timing_display}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g., 24/7, Mon-Sat: 8AM-8PM"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    Certifications & Quality
                  </h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Certifications (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={localArrayInputs.certifications}
                      onChange={(e) =>
                        handleArrayInputChange(e, "certifications")
                      }
                      onBlur={() => handleArrayInputBlur("certifications")}
                      placeholder="NABH, JCI, ISO 9001:2015"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <CertificateUploadField
                      files={formData.certificate_files}
                      onAdd={handleAddCertificateFile}
                      onRemove={handleRemoveCertificateFile}
                    />
                  </div>
                 <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Specialities Available
  </label>
  <SpecialityCheckboxSelector
    selected={formData.available_specialities}
    onChange={(updated) =>
      setFormData((prev) => ({ ...prev, available_specialities: updated }))
    }
  />
</div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Treatments Available{" "}
                      <span className="text-xs text-gray-400">
                        (comma-separated)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={localArrayInputs.available_treatments}
                      onChange={(e) =>
                        handleArrayInputChange(e, "available_treatments")
                      }
                      onBlur={() =>
                        handleArrayInputBlur("available_treatments")
                      }
                      placeholder="Cataract, Total Knee Replacement, Endocrinology"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    {formData.available_treatments.length > 0 && (
                      <p className="mt-1 text-xs text-blue-600">
                        Saved: {formData.available_treatments.join(", ")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Services Available
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      {AVAILABLE_SERVICES.map((service) => (
                        <label
                          key={service}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={formData.available_services.includes(
                              service,
                            )}
                            onChange={() => handleServiceCheckbox(service)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                            {service}
                          </span>
                        </label>
                      ))}
                    </div>
                    {formData.available_services.length > 0 && (
                      <p className="mt-2 text-xs text-blue-600 font-medium">
                        Selected ({formData.available_services.length}):{" "}
                        {formData.available_services.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6 */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    Hospital Statistics
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Doctors
                    </label>
                    <input
                      type="number"
                      name="total_doctors"
                      value={formData.total_doctors}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Specialities
                    </label>
                    <input
                      type="number"
                      name="total_specialities"
                      value={formData.total_specialities}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 7 */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    Gallery Images
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload from Device
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileUpload}
                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 text-sm text-gray-600 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can select multiple images at once
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Add via URL (comma-separated)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      onBlur={handleGalleryUrlBlur}
                      placeholder="https://example.com/img1.jpg, https://..."
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleGalleryUrlBlur}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      Add URLs
                    </button>
                  </div>
                </div>
                {formData.gallery_images.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Preview ({formData.gallery_images.length} image
                      {formData.gallery_images.length > 1 ? "s" : ""})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.gallery_images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border-2 border-gray-200 aspect-square"
                        >
                          <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.startsWith("data:")
                              ? `Uploaded file ${index + 1}`
                              : img.split("/").pop()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 8 */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-medium text-gray-900">
                        Add Doctors
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Fill details → <strong>Add to List</strong> → repeat for
                        each doctor.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDoctorForm((v) => !v)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${showDoctorForm ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-green-500 text-white hover:bg-green-600 shadow-sm"}`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {showDoctorForm ? "Close Form" : "Add Doctor"}
                  </button>
                </div>
                {showDoctorForm && (
                  <DoctorForm
                    onAddToList={handleAddDoctorToList}
                    hospitalName={formData.name}
                  />
                )}
                {doctorList.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        Doctors Added ({doctorList.length})
                      </h3>
                      {!showDoctorForm && (
                        <button
                          type="button"
                          onClick={() => setShowDoctorForm(true)}
                          className="text-xs text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Add Another
                        </button>
                      )}
                    </div>
                    {doctorList.map((doctor, index) => (
                      <DoctorListCard
                        key={doctor.uuid}
                        doctor={doctor}
                        index={index}
                        onRemove={handleRemoveDoctor}
                      />
                    ))}
                  </div>
                ) : (
                  !showDoctorForm && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                      <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        No doctors added yet.
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        This step is optional — you can skip and submit without
                        doctors.
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Step 9 */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    SEO & Status
                  </h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="SEO-friendly title for search engines"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended length: 50-60 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Brief description for search engine results"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended length: 150-160 characters
                    </p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Status & Verification
                    </h3>
                    <div className="flex gap-8">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700">
                          Is Active
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_verified"
                          checked={formData.is_verified}
                          onChange={handleChange}
                          className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700">
                          Is Verified
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      System Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(formData.created_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span>{" "}
                        {new Date(formData.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {doctorList.length > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <Users className="w-5 h-5 text-green-600 shrink-0" />
                      <p className="text-sm text-green-800 font-medium">
                        {doctorList.length} doctor
                        {doctorList.length > 1 ? "s" : ""} ready — will be saved
                        to the doctors table on submit.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-end pt-6 border-t-2 border-gray-200 mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              {currentStep < steps.length ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                    Next: {steps[currentStep].title}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {loading
                    ? "Saving..."
                    : `Submit Hospital${doctorList.length > 0 ? ` + ${doctorList.length} Doctor${doctorList.length > 1 ? "s" : ""}` : ""}`}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </Fragment>
  );
};

export default AdminHospitalForm;
