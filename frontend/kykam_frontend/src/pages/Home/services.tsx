import React from 'react';
import { Users, Search, Headset } from 'lucide-react'; // Optimized for your use case

function HowItWorks() {
  const sectionStyle = {
    padding: "100px 20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    textAlign: "center",
    backgroundColor: "#ffffff"
  } as React.CSSProperties;

  const cardStyle = {
    backgroundColor: "#f8fafc",
    padding: "40px 30px",
    borderRadius: "24px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "all 0.3s ease",
    border: "1px solid #f1f5f9"
  } as React.CSSProperties;

  const iconContainerStyle = {
    marginBottom: "24px",
    backgroundColor: "#f3a82f", // Solid brand color for contrast
    width: "70px",
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    color: "white", // White icon on orange background
    boxShadow: "0 10px 15px -3px rgba(243, 168, 47, 0.3)"
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16 px-4 md:py-24">

      {/* Visual Background Accents */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl text-center">

        {/* Header */}
        <span className="text-sm font-bold uppercase tracking-widest text-amber-500">
          The Kykam Advantage
        </span>

        <h2 className="mt-3 text-4xl font-extrabold text-slate-900 md:text-5xl">
          Our Specialized Services
        </h2>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "30px" }}>

          {/* Card 1: Vetting */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🛡️
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "12px", fontSize: "20px", fontWeight: "700" }}>Find Your Match</h3>
            <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "14px" }}>
              Browse through our vetted professionals and filter by location, skill, and expected salary.
            </p>
          </div>

          {/* Card 2: Nationwide */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🌍
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "12px", fontSize: "20px", fontWeight: "700" }}>Hire Directly</h3>
            <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "14px" }}>
              Connect with the worker immediately. No middleman, no hidden placement fees.
            </p>
          </div>

          {/* Card 3: Direct Matching */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              🤝
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "12px", fontSize: "20px", fontWeight: "700" }}>Ongoing Support</h3>
            <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "14px" }}>
              Our team is always on standby to assist with contract mediation or replacement needs.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;