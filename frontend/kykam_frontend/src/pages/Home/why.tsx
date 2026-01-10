function Why() {
    const sectionStyle = {
        padding: "80px 20px", 
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        backgroundColor: "#f0f4f8"
    } as React.CSSProperties;
    const cardStyle = {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    width: "300px",
    margin: "10px"
  };
return (
     <section style={sectionStyle}>
        <h2 style={{ fontSize: "36px", color: "#333", marginBottom: "10px" }}>Why Choose Kykam?</h2>
        <p style={{ color: "#666", marginBottom: "50px", fontSize: "18px" }}>Building trust in every Kenyan household.</p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "30px" }}>
          <div style={cardStyle}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>🛡️</div>
            <h3 style={{ color: "#f3a82f" }}>Fully Verified</h3>
            <p style={{ color: "#666", lineHeight: "1.5" }}>We vet workers using National ID and Police Clearance (Good Conduct) to ensure your family's safety.</p>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>🇰🇪</div>
            <h3 style={{ color: "#f3a82f" }}>Nationwide Reach</h3>
            <p style={{ color: "#666", lineHeight: "1.5" }}>Whether you are in Nakuru, Kisumu, or Mombasa, Kykam brings quality service to your doorstep.</p>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>💰</div>
            <h3 style={{ color: "#f3a82f" }}>Direct & Fair</h3>
            <p style={{ color: "#666", lineHeight: "1.5" }}>We eliminate exploitative agencies. Workers get fair pay, and employers get direct communication.</p>
          </div>
        </div>
      </section> 
  );
}
export default Why;