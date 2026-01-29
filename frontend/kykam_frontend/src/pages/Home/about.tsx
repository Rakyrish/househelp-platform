import React from 'react';

function About() {
  const sectionStyle = {
    padding: "100px 20px",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#ffffff",
  } as React.CSSProperties;

  return (
    <section style={sectionStyle}>
      <div style={{ 
        maxWidth: "1100px", 
        margin: "0 auto", 
        display: "flex", 
        flexWrap: "wrap", 
        alignItems: "stretch", // Ensures both sides are equal height
        gap: "50px", 
        textAlign: "left" 
      }}>
        
        {/* The Story Side */}
        <div style={{ flex: "1 1 500px" }}>
          <span style={{ 
            color: "#f3a82f", 
            fontWeight: "bold", 
            textTransform: "uppercase", 
            letterSpacing: "1px", 
            fontSize: "14px" 
          }}>
            Our Story
          </span>
          <h2 style={{ 
            fontSize: "42px", 
            color: "#0f172a", 
            marginTop: "10px", 
            marginBottom: "25px", 
            fontWeight: "800" 
          }}>
            About <span style={{ color: "#f3a82f" }}>Kykam</span>
          </h2>
          
          <p style={{ fontSize: "18px", color: "#475569", lineHeight: "1.8", marginBottom: "20px" }}>
            Kykam was born out of a simple need: <strong style={{ color: "#0f172a" }}>Trust</strong>. 
            In Kenya, finding reliable domestic help often relies on informal word-of-mouth, 
            which can be unpredictable and risky for both employers and workers.
          </p>
          
          <p style={{ fontSize: "18px", color: "#475569", lineHeight: "1.8" }}>
            Our mission is to <strong style={{ color: "#0f172a" }}>formalize</strong> the domestic work 
            industry in Kenya. We provide a professional bridge where integrity meets opportunity. 
            By verifying every profile, we ensure domestic workers find dignified, safe environments, 
            and Kenyan families find the peace of mind they deserve.
          </p>
        </div>

        {/* The Vision Side */}
        <div style={{ 
          flex: "1 1 350px", 
          backgroundColor: "#f3a82f", 
          padding: "50px", 
          borderRadius: "24px", 
          color: "#0f172a", // Darker text on yellow is easier to read
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: "0 20px 40px -15px rgba(243, 168, 47, 0.4)"
        }}>
          <h4 style={{ 
            fontSize: "28px", 
            marginBottom: "20px", 
            fontWeight: "800",
            borderBottom: "2px solid rgba(15, 23, 42, 0.1)",
            paddingBottom: "10px",
            display: "inline-block"
          }}>
            Our Vision
          </h4>
          <p style={{ 
            fontSize: "18px", 
            lineHeight: "1.6", 
            fontWeight: "500",
            fontStyle: "italic" 
          }}>
            "To become Kenya's most trusted partner in household management, 
            fostering a culture of respect, safety, and security for every home 
            and worker across all 47 counties."
          </p>
          <div style={{ marginTop: "30px", fontSize: "40px", opacity: "0.2" }}>
            🇰🇪
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;