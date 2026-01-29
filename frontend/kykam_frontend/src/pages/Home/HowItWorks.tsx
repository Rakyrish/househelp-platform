

function HowItWorks() {
  const sectionStyle = {
    padding: "100px 20px",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#fffbeb", // A very soft amber tint
    textAlign: "center" as const,
  };

  const containerStyle = {
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "left" as const,
    position: "relative" as const,
  };

  // The vertical line connecting the dots
  const lineStyle = {
    position: "absolute" as const,
    left: "25px",
    top: "50px",
    bottom: "50px",
    width: "2px",
    backgroundColor: "#f3a82f",
    opacity: 0.3,
    zIndex: 0,
  };

  const stepWrapperStyle = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "50px",
    position: "relative" as const,
    zIndex: 1,
  };

  const numberCircle = {
    minWidth: "52px",
    height: "52px",
    backgroundColor: "#f3a82f",
    color: "#0f172a",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "30px",
    fontWeight: "800",
    fontSize: "20px",
    boxShadow: "0 0 0 8px rgba(243, 168, 47, 0.1)",
  };

  return (
    <section style={sectionStyle}>
      <h2 style={{ fontSize: "40px", color: "#0f172a", marginBottom: "10px", fontWeight: "800" }}>
        Getting Started is Easy
      </h2>
      <p style={{ color: "#64748b", marginBottom: "60px", fontSize: "18px" }}>
        Your journey to a professional partnership starts here.
      </p>

      <div style={containerStyle}>
        {/* Connecting Line */}
        <div style={lineStyle}></div>

        {/* Step 1 */}
        <div style={stepWrapperStyle}>
          <div style={numberCircle}>1</div>
          <div style={{ paddingTop: "10px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#0f172a", fontWeight: "700" }}>
              Create Your Profile
            </h4>
            <p style={{ margin: 0, color: "#475569", fontSize: "16px", lineHeight: "1.6" }}>
              Sign up quickly using your phone number. Tell us if you're a family looking for help or a professional seeking your next opportunity.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={stepWrapperStyle}>
          <div style={numberCircle}>2</div>
          <div style={{ paddingTop: "10px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#0f172a", fontWeight: "700" }}>
              Fast Verification
            </h4>
            <p style={{ margin: 0, color: "#475569", fontSize: "16px", lineHeight: "1.6" }}>
              Workers securely upload their National ID and documents. Our team manually reviews every profile to maintain the highest safety standards in Kenya.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div style={stepWrapperStyle}>
          <div style={numberCircle}>3</div>
          <div style={{ paddingTop: "10px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#0f172a", fontWeight: "700" }}>
              Connect & Start
            </h4>
            <p style={{ margin: 0, color: "#475569", fontSize: "16px", lineHeight: "1.6" }}>
              Browse verified matches, communicate directly, and secure a professional placement with total peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;