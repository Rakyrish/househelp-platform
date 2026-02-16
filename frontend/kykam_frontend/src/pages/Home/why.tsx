import React from 'react';
import { ShieldCheck, Map, HandCoins } from 'lucide-react';

function Why() {
  const sectionStyle = {
    padding: "100px 20px", 
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    textAlign: "center",
    backgroundColor: "#f8fafc"
  } as React.CSSProperties;

  const cardStyle = {
    backgroundColor: "white",
    padding: "40px 30px",
    borderRadius: "24px", // Slightly rounder for a friendlier feel
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid #f1f5f9"
  } as React.CSSProperties;

  const iconContainerStyle = {
    marginBottom: "24px", 
    backgroundColor: "#fff7ed", // Kykam light orange tint
    width: "80px", 
    height: "80px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    borderRadius: "20px", // Squircle shape
    color: "#f3a82f" // Kykam Brand Orange
  };

  return (
    <section style={sectionStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "42px", color: "#0f172a", marginBottom: "16px", fontWeight: "800" }}>
          Why Choose <span style={{ color: "#f3a82f" }}>Kykam?</span>
        </h2>
        <p style={{ color: "#64748b", marginBottom: "60px", fontSize: "19px", maxWidth: "700px", margin: "0 auto 60px" }}>
          We are more than an agency; we are a community built on security, transparency, and mutual respect.
        </p>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "30px" }}>
          
          {/* Card 1: Safety */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "15px", fontSize: "22px", fontWeight: "700" }}>Fully Verified</h3>
            <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "15px" }}>
              We vet workers using National ID, Next of Kin data, and Good Conduct images to ensure your family's absolute safety.
            </p>
          </div>

          {/* Card 2: Coverage */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              <Map size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "15px", fontSize: "22px", fontWeight: "700" }}>Nationwide Reach</h3>
            <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "15px" }}>
              From the heart of Nairobi to Nakuru, Kisumu, and Mombasa—Kykam brings professional service to every corner of Kenya.
            </p>
          </div>

          {/* Card 3: Fairness */}
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              <HandCoins size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ color: "#0f172a", marginBottom: "15px", fontSize: "22px", fontWeight: "700" }}>Direct & Fair</h3>
            <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "15px" }}>
              We eliminate exploitative middlemen. Workers earn fair wages, and employers enjoy clear, honest communication.
            </p>
          </div>

        </div>
      </div>
    </section> 
  );
}

export default Why;