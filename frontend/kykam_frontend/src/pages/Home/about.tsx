function About() {

   const sectionStyle = {
      padding: "80px 20px",
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
    } as React.CSSProperties;

  return (
    <section style={{ ...sectionStyle, backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "40px", textAlign: "left" }}>
          <div style={{ flex: "1 1 400px" }}>
            <h2 style={{ fontSize: "36px", color: "#333", marginBottom: "20px" }}>About <span style={{ color: "#f3a82f" }}>Kykam</span></h2>
            <p style={{ fontSize: "18px", color: "#555", lineHeight: "1.8", marginBottom: "20px" }}>
              Kykam was born out of a simple need: <strong>Trust</strong>. In Kenya, finding reliable domestic help often relies on word of mouth, which can be risky for both the employer and the worker. 
            </p>
            <p style={{ fontSize: "18px", color: "#555", lineHeight: "1.8" }}>
              Our mission is to formalize the domestic work industry in Kenya. We provide a platform where integrity meets opportunity. By verifying every user, we ensure that domestic workers find safe environments and that Kenyan families find the peace of mind they deserve.
            </p>
          </div>
          <div style={{ flex: "1 1 300px", backgroundColor: "#f3a82f", padding: "40px", borderRadius: "20px", color: "white" }}>
            <h4 style={{ fontSize: "24px", marginBottom: "15px" }}>Our Vision</h4>
            <p style={{ fontSize: "16px", fontStyle: "italic" }}>
              To become Kenya's most trusted partner in household management, fostering respect and security for every home and worker in all 47 counties.
            </p>
          </div>
        </div>
      </section>
  );
}
export default About;