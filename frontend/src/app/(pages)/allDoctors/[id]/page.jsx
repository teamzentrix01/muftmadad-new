"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Award,
  Building2,
  GraduationCap,
  User,
  Phone,
  Mail,
  Star,
  Users,
  BookOpen,
  Trophy,
  AlertCircle,
  Globe,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─── Inject styles ─────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("dp-light-styles")) return;
  const s = document.createElement("style");
  s.id = "dp-light-styles";
  s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,wght@0,600;0,700;0,800;1,700&display=swap');

        .dpl-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .dpl-serif { font-family: 'Fraunces', serif; }

        @keyframes dpl-slideLeft {
            from { opacity: 0; transform: translateX(-48px) scale(0.96); }
            to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes dpl-slideRight {
            from { opacity: 0; transform: translateX(48px) scale(0.96); }
            to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes dpl-slideUp {
            from { opacity: 0; transform: translateY(32px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dpl-fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes dpl-scaleIn {
            from { opacity: 0; transform: scale(0.82); }
            to   { opacity: 1; transform: scale(1); }
        }
        @keyframes dpl-shimmer {
            0%   { background-position: -300% center; }
            100% { background-position: 300% center; }
        }
        @keyframes dpl-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes dpl-blob {
            0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1); }
            33%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: scale(1.04); }
            66%      { border-radius: 70% 30% 50% 50% / 30% 50% 70% 50%; transform: scale(0.97); }
        }
        @keyframes dpl-float {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-8px); }
        }

        .dpl-photo-panel  { animation: dpl-slideLeft  0.8s cubic-bezier(.16,1,.3,1) both; }
        .dpl-info-panel   { animation: dpl-slideRight 0.8s cubic-bezier(.16,1,.3,1) 0.1s both; }
        .dpl-bottom-bar   { animation: dpl-slideUp    0.7s cubic-bezier(.16,1,.3,1) 0.3s both; }
        .dpl-section      { animation: dpl-slideUp    0.6s cubic-bezier(.16,1,.3,1) both; }
        .dpl-avatar-wrap  { animation: dpl-scaleIn    0.7s cubic-bezier(.16,1,.3,1) 0.2s both; }
        .dpl-blob-shape   { animation: dpl-blob 8s ease-in-out infinite; }
        .dpl-float        { animation: dpl-float 4s ease-in-out infinite; }
        .dpl-spin-ring    { animation: dpl-spin 18s linear infinite; }

        .dpl-stat {
            transition: transform 0.28s cubic-bezier(.16,1,.3,1), box-shadow 0.28s ease, background 0.28s ease;
            cursor: default;
        }
        .dpl-stat:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 12px 32px rgba(14,116,200,0.18);
            background: #e8f3ff !important;
        }
        .dpl-tag {
            transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
            cursor: default;
        }
        .dpl-tag:hover {
            transform: translateY(-2px) scale(1.06);
            background: #0e74c8 !important;
            color: #fff !important;
            border-color: #0e74c8 !important;
        }
        .dpl-section-card {
            transition: transform 0.28s cubic-bezier(.16,1,.3,1), box-shadow 0.28s ease;
        }
        .dpl-section-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 36px rgba(14,116,200,0.10);
        }
        .dpl-list-row {
            transition: background 0.2s ease, transform 0.2s ease, padding-left 0.2s ease;
        }
        .dpl-list-row:hover {
            background: #eff6ff !important;
            transform: translateX(4px);
        }
        .dpl-contact-btn {
            transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
            text-decoration: none;
        }
        .dpl-contact-btn:hover {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 8px 22px rgba(14,116,200,0.25);
            background: #0e74c8 !important;
            color: #fff !important;
        }
        .dpl-phone-btn:hover { box-shadow: 0 8px 22px rgba(14,116,200,0.3) !important; }
        .dpl-retry-btn {
            transition: all 0.22s ease;
            cursor: pointer;
            border: none;
        }
        .dpl-retry-btn:hover {
            transform: translateY(-2px) scale(1.04);
            box-shadow: 0 10px 28px rgba(14,116,200,0.3);
        }

        @keyframes dpl-skeleton-wave {
            0%   { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }
        .dpl-skel {
            background: linear-linear(90deg, #f0f4f8 25%, #e2eaf4 50%, #f0f4f8 75%);
            background-size: 800px 100%;
            animation: dpl-skeleton-wave 1.6s infinite;
            border-radius: 6px;
        }

        /* ── Responsive: Mobile ── */
        @media (max-width: 640px) {
            .dpl-main-card {
                grid-template-columns: 1fr !important;
            }
            .dpl-photo-panel {
                padding: 32px 20px 24px !important;
                border-radius: 0 !important;
            }
            .dpl-avatar-size {
                width: 130px !important;
                height: 130px !important;
            }
            .dpl-spin-ring-wrap {
                inset: -8px !important;
            }
            .dpl-info-panel {
                padding: 24px 20px 28px !important;
            }
            .dpl-bottom-bar {
                flex-direction: column !important;
                align-items: flex-start !important;
                padding: 18px 20px !important;
                gap: 14px !important;
            }
            .dpl-bottom-bar-contacts {
                width: 100% !important;
                flex-direction: column !important;
            }
            .dpl-bottom-bar-contacts a,
            .dpl-bottom-bar-contacts div {
                width: 100% !important;
                justify-content: center !important;
                box-sizing: border-box !important;
            }
            .dpl-sections-grid {
                grid-template-columns: 1fr !important;
            }
            .dpl-stats-row {
                flex-direction: row !important;
                flex-wrap: wrap !important;
                gap: 8px !important;
            }
            .dpl-stat {
                flex: 1 1 calc(50% - 4px) !important;
                min-width: 0 !important;
            }
            .dpl-name-serif-lg {
                font-size: 20px !important;
            }
            .dpl-name-serif-md {
                font-size: 16px !important;
            }
            .dpl-hero-name {
                font-size: 22px !important;
            }
            .dpl-hero-sub {
                font-size: 18px !important;
            }
            .dpl-section-page {
                padding-top: 80px !important;
                padding-left: 12px !important;
                padding-right: 12px !important;
            }
        }

        /* ── Responsive: Tablet ── */
        @media (min-width: 641px) and (max-width: 860px) {
            .dpl-main-card {
                grid-template-columns: 240px 1fr !important;
            }
            .dpl-photo-panel {
                padding: 32px 20px !important;
            }
            .dpl-avatar-size {
                width: 140px !important;
                height: 140px !important;
            }
            .dpl-info-panel {
                padding: 28px 24px !important;
            }
            .dpl-bottom-bar-contacts {
                flex-wrap: wrap !important;
            }
            .dpl-sections-grid {
                grid-template-columns: 1fr !important;
            }
        }
    `;
  document.head.appendChild(s);
};

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
const SkeletonProfile = () => {
  useEffect(() => {
    injectStyles();
  }, []);
  return (
    <div className="dpl-root" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 8px 48px rgba(0,0,0,0.09)",
          display: "flex",
          flexWrap: "wrap",
          minHeight: 380,
        }}
      >
        {/* Left */}
        <div
          style={{
            width: "100%",
            maxWidth: 300,
            background: "#eef5fb",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <div
            className="dpl-skel"
            style={{ width: 160, height: 160, borderRadius: "50%" }}
          />
        </div>
        {/* Right */}
        <div
          style={{
            flex: 1,
            minWidth: 260,
            padding: "40px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div className="dpl-skel" style={{ height: 12, width: 80 }} />
          <div className="dpl-skel" style={{ height: 28, width: 220 }} />
          <div className="dpl-skel" style={{ height: 16, width: 180 }} />
          <div className="dpl-skel" style={{ height: 14, width: 260 }} />
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[140, 120, 130].map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 24 }}>
                <div className="dpl-skel" style={{ height: 13, width: 80 }} />
                <div className="dpl-skel" style={{ height: 13, width: w }} />
              </div>
            ))}
          </div>
          <div
            style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {[70, 60, 80, 68].map((w, i) => (
              <div
                key={i}
                className="dpl-skel"
                style={{ height: 28, width: w, borderRadius: 100 }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Bottom bar skeleton */}
      <div
        style={{
          marginTop: 3,
          background: "#fff",
          borderRadius: "0 0 24px 24px",
          padding: "24px 36px",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          boxShadow: "0 8px 32px rgba(0,0,0,0.07)",
        }}
      >
        {[200, 140, 180].map((w, i) => (
          <div key={i} className="dpl-skel" style={{ height: 18, width: w }} />
        ))}
      </div>
    </div>
  );
};

/* ─── Section Block ─────────────────────────────────────────────────────── */
const Section = ({
  icon: Icon,
  title,
  accentColor = "#1d6fc4",
  delay = 0,
  children,
}) => (
  <div
    className="dpl-section-card dpl-section"
    style={{
      background: "#fff",
      border: "1px solid #e8f0fa",
      borderRadius: 18,
      padding: "22px 24px",
      animationDelay: `${delay}s`,
    }}
  >
    <h3
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        color: accentColor,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={13} color={accentColor} />
      </span>
      {title}
    </h3>
    {children}
  </div>
);

/* ─── Doctor Profile ────────────────────────────────────────────────────── */
const DoctorProfile = ({ doctor }) => {
  useEffect(() => {
    injectStyles();
  }, []);
  const blue = "#1d6fc4";
  const lightBlue = "#e8f3ff";

  return (
    <div className="dpl-root" style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* ── MAIN CARD (split: photo left + info right) ── */}
      <div
        className="dpl-main-card"
        style={{
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 8px 60px rgba(14,100,200,0.12)",
          display: "grid",
          gridTemplateColumns: "290px 1fr",
        }}
      >
        {/* ──── LEFT: Photo Panel ──── */}
        <div
          className="dpl-photo-panel"
          style={{
            background:
              "linear-gradient(160deg, #daeeff 0%, #c5dfff 60%, #b8d4f8 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "44px 28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles in background */}
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 200,
              height: 200,
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 140,
              height: 140,
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
            }}
          />

          {/* Avatar */}
          <div
            className="dpl-avatar-wrap"
            style={{ position: "relative", marginBottom: 22 }}
          >
            {/* Spinning dashed ring */}
            <div
              className="dpl-spin-ring dpl-spin-ring-wrap"
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                border: "2px dashed rgba(29,111,196,0.35)",
              }}
            />
            {/* Photo circle */}
            <div
              className="dpl-avatar-size"
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #fff",
                boxShadow: "0 12px 40px rgba(14,100,200,0.22)",
                background: "linear-gradient(135deg, #93c5fd, #3b82f6)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {doctor.photo ? (
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={56} color="rgba(255,255,255,0.85)" />
                </div>
              )}
            </div>
          </div>

          {/* Name under photo */}
          <div className="dpl-float" style={{ textAlign: "center" }}>
            <p
              className="dpl-serif dpl-name-serif-lg"
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0c2a52",
                lineHeight: 1.1,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}
            >
              {doctor.name?.split(" ").slice(0, -1).join(" ") || doctor.name}
            </p>
            <p
              className="dpl-serif dpl-name-serif-md"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1d6fc4",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {doctor.name?.split(" ").slice(-1)[0] || ""}
            </p>
            {Array.isArray(doctor.specialities) &&
              doctor.specialities.length > 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#2d6caa",
                    marginTop: 6,
                    fontWeight: 500,
                  }}
                >
                  {doctor.specialities.slice(0, 2).join(", ")}
                </p>
              )}
            {doctor.currently_serving && (
              <p
                style={{
                  fontSize: 11,
                  color: "#3a7fc1",
                  marginTop: 4,
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                {doctor.currently_serving}
              </p>
            )}
          </div>

          {/* Stats pills */}
          <div
            className="dpl-stats-row"
            style={{
              marginTop: 22,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
            }}
          >
            {doctor.average_rating > 0 && (
              <div
                className="dpl-stat"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: 12,
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Star size={13} color="#f59e0b" fill="#f59e0b" />
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}
                  >
                    {parseFloat(doctor.average_rating).toFixed(1)}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#4a6fa5" }}>
                  {doctor.total_reviews} reviews
                </span>
              </div>
            )}
            {doctor.total_patients_treated > 0 && (
              <div
                className="dpl-stat"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: 12,
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={13} color={blue} />
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}
                  >
                    {Number(doctor.total_patients_treated).toLocaleString()}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#4a6fa5" }}>Patients</span>
              </div>
            )}
            {doctor.consultation_fee && (
              <div
                className="dpl-stat"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: 12,
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}
                >
                  ₹{parseFloat(doctor.consultation_fee).toLocaleString()}
                </span>
                <span style={{ fontSize: 11, color: "#4a6fa5" }}>
                  Consult fee
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ──── RIGHT: Info Panel ──── */}
        <div
          className="dpl-info-panel"
          style={{
            padding: "38px 36px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            background: "#fff",
          }}
        >
          {/* PROFILE label */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            PROFILE
          </p>

          {/* Doctor name */}
          <h1
            className="dpl-serif dpl-hero-name"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: blue,
              marginBottom: 4,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {doctor.name}
          </h1>

          {/* Specialities as subtitle */}
          {Array.isArray(doctor.specialities) &&
            doctor.specialities.length > 0 && (
              <p
                style={{
                  fontSize: 14,
                  color: "#475569",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                {doctor.specialities.join(", ")}
              </p>
            )}

          {/* Degrees */}
          {Array.isArray(doctor.degrees) && doctor.degrees.length > 0 && (
            <p
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 20,
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              {doctor.degrees.join(", ")}
            </p>
          )}

          {/* Divider */}
          <div
            style={{ height: 1, background: "#e8f0fa", margin: "4px 0 18px" }}
          />

          {/* Key info rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {doctor.experience_in_years && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  EXPERIENCE
                </span>
                <span
                  style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}
                >
                  {doctor.experience_in_years} Years+
                </span>
              </div>
            )}
            {Array.isArray(doctor.languages_spoken) &&
              doctor.languages_spoken.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    LANGUAGES
                  </span>
                  <span
                    style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}
                  >
                    {doctor.languages_spoken.join(", ")}
                  </span>
                </div>
              )}
            {(doctor.address || doctor.city) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    paddingTop: 1,
                  }}
                >
                  LOCATION
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  {[doctor.city, doctor.state, doctor.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            style={{ height: 1, background: "#e8f0fa", margin: "0 0 18px" }}
          />

          {/* SPECIALITY label + pill tags */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            SPECIALITY
          </p>
          {Array.isArray(doctor.specialities) &&
            doctor.specialities.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  marginBottom: 18,
                }}
              >
                {doctor.specialities.map((s, i) => (
                  <span
                    key={i}
                    className="dpl-tag"
                    style={{
                      padding: "5px 14px",
                      background: "#f0f7ff",
                      border: `1px solid ${blue}30`,
                      borderRadius: 100,
                      fontSize: 12,
                      color: blue,
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

          {/* Overview */}
          {doctor.overview && (
            <>
              <div
                style={{ height: 1, background: "#e8f0fa", margin: "0 0 14px" }}
              />
              <p
                style={{
                  fontSize: 12.5,
                  color: "#64748b",
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                {doctor.overview}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div
        className="dpl-bottom-bar"
        style={{
          background: "#fff",
          borderRadius: "0 0 24px 24px",
          borderTop: "2px solid #e8f0fa",
          padding: "22px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 16px 48px rgba(14,100,200,0.10)",
          marginTop: 0,
        }}
      >
        {/* Left: name + hospital */}
        <div>
          <p
            className="dpl-serif"
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0c2a52",
              lineHeight: 1.1,
              textTransform: "uppercase",
            }}
          >
            {doctor.name}
          </p>
          {Array.isArray(doctor.serving_in_hospitals) &&
            doctor.serving_in_hospitals.length > 0 && (
              <p
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 3,
                  fontWeight: 400,
                }}
              >
                {typeof doctor.serving_in_hospitals[0] === "object"
                  ? doctor.serving_in_hospitals[0].name
                  : doctor.serving_in_hospitals[0]}
                {doctor.serving_in_hospitals.length > 1 &&
                  ` +${doctor.serving_in_hospitals.length - 1} more`}
              </p>
            )}
          {doctor.currently_serving && !doctor.serving_in_hospitals?.length && (
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
              {doctor.currently_serving}
            </p>
          )}
        </div>

        {/* Right: contact buttons */}
        <div
          className="dpl-bottom-bar-contacts"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <a href={`/care?doctor=${doctor.id}`} className="rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white">Book appointment</a>
          {doctor.phone && (
            <a
              href={`tel:${doctor.phone}`}
              className="dpl-contact-btn dpl-phone-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: blue,
                borderRadius: 10,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 4px 16px rgba(29,111,196,0.25)",
              }}
            >
              <MessageCircle size={14} />
              {doctor.phone}
            </a>
          )}
          {doctor.email && (
            <a
              href={`mailto:${doctor.email}`}
              className="dpl-contact-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 18px",
                background: "#f0f7ff",
                border: `1px solid ${blue}30`,
                borderRadius: 10,
                color: blue,
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              <Mail size={13} />
              {doctor.email}
            </a>
          )}
          {(doctor.address || doctor.city) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              <MapPin size={12} color="#94a3b8" />
              {[doctor.address, doctor.city, doctor.state]
                .filter(Boolean)
                .slice(0, 2)
                .join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* ── EXTRA SECTIONS GRID ── */}
      {((Array.isArray(doctor.serving_in_hospitals) &&
        doctor.serving_in_hospitals.length > 0) ||
        (Array.isArray(doctor.awards_and_recognitions) &&
          doctor.awards_and_recognitions.length > 0) ||
        (Array.isArray(doctor.publications) &&
          doctor.publications.length > 0)) && (
        <div
          className="dpl-sections-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          {Array.isArray(doctor.serving_in_hospitals) &&
            doctor.serving_in_hospitals.length > 0 && (
              <Section
                icon={Building2}
                title="Hospitals"
                accentColor="#1d6fc4"
                delay={0.55}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {doctor.serving_in_hospitals.map((h, i) => (
                    <div
                      key={i}
                      className="dpl-list-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 9,
                        background: "#f8fafc",
                        border: "1px solid #e8f0fa",
                      }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: blue,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "#334155",
                          fontWeight: 400,
                        }}
                      >
                        {typeof h === "object"
                          ? h.name || JSON.stringify(h)
                          : h}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

          {Array.isArray(doctor.awards_and_recognitions) &&
            doctor.awards_and_recognitions.length > 0 && (
              <Section
                icon={Trophy}
                title="Awards & Recognitions"
                accentColor="#d97706"
                delay={0.62}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {doctor.awards_and_recognitions.map((a, i) => (
                    <div
                      key={i}
                      className="dpl-list-row"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 9,
                        background: "#fffbf0",
                        border: "1px solid #fef3c7",
                      }}
                    >
                      <Trophy
                        size={12}
                        color="#d97706"
                        style={{ marginTop: 2, flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "#334155",
                          fontWeight: 400,
                          lineHeight: 1.5,
                        }}
                      >
                        {a}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

          {Array.isArray(doctor.publications) &&
            doctor.publications.length > 0 && (
              <Section
                icon={BookOpen}
                title="Publications"
                accentColor="#7c3aed"
                delay={0.69}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {doctor.publications.map((p, i) => (
                    <div
                      key={i}
                      className="dpl-list-row"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 9,
                        background: "#faf8ff",
                        border: "1px solid #ede9fe",
                      }}
                    >
                      <BookOpen
                        size={12}
                        color="#7c3aed"
                        style={{ marginTop: 2, flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "#334155",
                          fontWeight: 400,
                          lineHeight: 1.5,
                        }}
                      >
                        {p}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    injectStyles();
    if (!id) {
      setError("Invalid doctor link.");
      setLoading(false);
      return;
    }
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/doctors/id/${id}`,
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        setDoctor(response.data.data);
      } else {
        setError("Doctor not found.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "Doctor not found. The link may be invalid or the profile has been removed.",
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load profile. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(150deg, #eef6ff 0%, #f5f9ff 50%, #edf3fb 100%)",
        position: "relative",
      }}
    >
      {/* Subtle background decoration */}
      <div
        style={{
          position: "fixed",
          top: "5%",
          right: "3%",
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, rgba(29,111,196,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          left: "2%",
          width: 340,
          height: 340,
          background:
            "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Navbar />
      {/* <button
        onClick={() => router.push("/")}
        style={{
          position: "fixed",
          top: 80,
          left: 100,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          color: "#1d6fc4",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <ArrowLeft size={14} />
        Back
      </button> */}

      <section
        className="dpl-root dpl-section-page"
        style={{
          paddingTop: 120,
          paddingBottom: 80,
          paddingLeft: 16,
          paddingRight: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto 16px" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              color: "#1d6fc4",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {loading && <SkeletonProfile />}

          {!loading && error && (
            <div
              style={{
                maxWidth: 440,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 80,
                paddingBottom: 80,
                textAlign: "center",
                gap: 18,
                animation: "dpl-slideUp 0.6s cubic-bezier(.16,1,.3,1) both",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={28} color="#ef4444" />
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: "#475569",
                  fontWeight: 400,
                  lineHeight: 1.65,
                }}
              >
                {error}
              </p>
              <button
                onClick={fetchDoctor}
                className="dpl-retry-btn"
                style={{
                  padding: "11px 32px",
                  background: "#1d6fc4",
                  borderRadius: 100,
                  color: "white",
                  fontSize: 13.5,
                  fontWeight: 600,
                  boxShadow: "0 4px 20px rgba(29,111,196,0.25)",
                  letterSpacing: "0.02em",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && doctor && <DoctorProfile doctor={doctor} />}
        </div>
      </section>

      <Footer />
    </div>
  );
}
