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
    <section style={sectionStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "36px", color: "#0f172a", marginBottom: "50px", fontWeight: "800" }}>
          Simple Steps to <span style={{ color: "#f3a82f" }}>Get Started</span>
        </h2>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "30px" }}>
          
          {/* Step 1 */}
          <div style={cardStyle} className="hover-card">
            <div style={iconContainerStyle}>
              <Search size={32} strokeWidth={2} />
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "12px", fontSize: "20px", fontWeight: "700" }}>Find Your Match</h3>
            <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "14px" }}>
              Browse through our vetted professionals and filter by location, skill, and expected salary.
            </p>
          </div>

          {/* Step 2 */}
          <div style={cardStyle} className="hover-card">
            <div style={iconContainerStyle}>
              <Users size={32} strokeWidth={2} />
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "12px", fontSize: "20px", fontWeight: "700" }}>Hire Directly</h3>
            <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "14px" }}>
              Connect with the worker immediately. No middleman, no hidden placement fees.
            </p>
          </div>

          {/* Step 3 */}
          <div style={cardStyle} className="hover-card">
            <div style={iconContainerStyle}>
              <Headset size={32} strokeWidth={2} />
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