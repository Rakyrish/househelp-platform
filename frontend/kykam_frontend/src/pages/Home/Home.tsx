import React from 'react';
import About from './about';
import Why from './why';
import Services from './services';

const Home = () => {
  // Styles
  const sectionStyle = {
    padding: "80px 20px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  } as React.CSSProperties;

  const primaryButtonStyle = {
    backgroundColor: "#f3a82f",
    color: "white",
    padding: "15px 35px",
    borderRadius: "8px",
    border: "none",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.2s"
  };

  const secondaryButtonStyle = {
          ...primaryButtonStyle,
          backgroundColor: "white",
          color: "#333",
          border: "2px solid #eee",
          boxShadow: "none"
      } as React.CSSProperties;

  return (
    <div style={{ backgroundColor: "#f8f9fa" }}>
      
      {/* 1. HERO SECTION */}
      <section style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://www.shutterstock.com/image-photo/housework-house-keeping-service-two-260nw-2337635893.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "85vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: "0 20px"
      }}>
        <h1 style={{ fontSize: "52px", marginBottom: "20px", fontWeight: "800", maxWidth: "900px" }}>
          Empowering Homes Across <span style={{ color: "#f3a82f" }}>Kenya</span>.
        </h1>
        <p style={{ fontSize: "22px", marginBottom: "40px", maxWidth: "800px", lineHeight: "1.6" }}>
          Connecting families from the 47 counties with verified, professional househelps. 
          Your safety is our priority, from Nairobi to the furthest corner of Kenya.
        </p>
        {/* Bottom Actions */}
      <div style={{ 
          display: "flex", 
          gap: "15px", 
          flexWrap: "nowrap", 
          whiteSpace: "nowrap", 
          justifyContent: "center",
          marginTop: "25px" ,
          marginBottom: "20px"
      }}>
          <a href="/register/employer" style={primaryButtonStyle}>
              Find a Househelp
          </a>

    <a href="/register/worker" style={{ 
        ...secondaryButtonStyle, 
        display: "flex",          
        alignItems: "center",     
        gap: "10px"               
    }}>
        <svg 
            width={20} 
            height={20} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={"#333"} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Look for a Job</span>
    </a>
</div>
      </section>

      {/* 2. WHY CHOOSE US (Trust Signals) */}
      <Why />

      <Services />

       {/* 4. HOW IT WORKS */}
      <section style={{ ...sectionStyle, backgroundColor: "#fdf3e7", }}>
        <h2 style={{ fontSize: "32px", color: "#333", marginBottom: "40px" }}>Getting Started is Easy</h2>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
            <div style={{ minWidth: "50px", height: "50px", backgroundColor: "#f3a82f", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "20px", fontWeight: "bold", fontSize: "20px" }}>1</div>
            <div>
                <h4 style={{ margin: "0", fontSize: "20px" }}>Register Your Account</h4>
                <p style={{ margin: "5px 0 0", color: "#666" }}>Sign up as an employer seeking help or a worker seeking a job.</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
            <div style={{ minWidth: "50px", height: "50px", backgroundColor: "#f3a82f", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "20px", fontWeight: "bold", fontSize: "20px" }}>2</div>
            <div>
                <h4 style={{ margin: "0", fontSize: "20px" }}>Submit Verification</h4>
                <p style={{ margin: "5px 0 0", color: "#666" }}>Workers upload their IDs for our team to verify traceability and conduct.</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
            <div style={{ minWidth: "50px", height: "50px", backgroundColor: "#f3a82f", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "20px", fontWeight: "bold", fontSize: "20px" }}>3</div>
            <div>
                <h4 style={{ margin: "0", fontSize: "20px" }}>Secure Placement</h4>
                <p style={{ margin: "5px 0 0", color: "#666" }}>Connect directly through the platform and start a professional relationship.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION */}
      <About />

    </div>
  );
};

export default Home;