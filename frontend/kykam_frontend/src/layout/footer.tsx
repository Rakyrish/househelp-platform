const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ 
      padding: "60px 20px", 
      backgroundColor: "#0f172a", 
      color: "#94a3b8", 
      borderTop: "4px solid #f3a82f" // Kykam Brand Color Accent
    }}>
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "40px" 
      }}>
        
        {/* Column 1: Brand Identity */}
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "white", marginBottom: "15px" }}>Kykam Agencies</h2>
          <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
            Connecting Kenyan homes with verified professionals. 
            We ensure safety and integrity in every hire.
          </p>
        </div>

        {/* Column 2: Quick Navigation */}
        <div>
          <h4 style={{ color: "white", marginBottom: "20px", fontSize: "18px" }}>Platform</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "12px" }}><a href="/workers" style={linkStyle}>Find a Worker</a></li>
            <li style={{ marginBottom: "12px" }}><a href="/register/worker" style={linkStyle}>Join as a Worker</a></li>
            <li style={{ marginBottom: "12px" }}><a href="/categories" style={linkStyle}>Job Categories</a></li>
          </ul>
        </div>

        {/* Column 3: Support & Legal */}
        <div>
          <h4 style={{ color: "white", marginBottom: "20px", fontSize: "18px" }}>Support</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "12px" }}><a href="/contact" style={linkStyle}>Contact Support</a></li>
            <li style={{ marginBottom: "12px" }}><a href="/privacy" style={linkStyle}>Privacy Policy</a></li>
            <li style={{ marginBottom: "12px" }}><a href="/terms" style={linkStyle}>Terms of Service</a></li>
          </ul>
        </div>

        {/* Column 4: Direct Contact (Newly Updated) */}
        <div>
          <h4 style={{ color: "white", marginBottom: "20px", fontSize: "18px" }}>Reach Out</h4>
          <p style={{ fontSize: "14px", marginBottom: "10px" }}>
            📧 <a href="mailto:Kykamagency1@gmail.com" style={{ color: "#f3a82f", textDecoration: "none" }}>Kykamagency1@gmail.com</a>
          </p>
          <p style={{ fontSize: "14px", marginBottom: "12px" }}>
    🟢 <a href="https://wa.me/254794029089" target="_blank" rel="noreferrer" style={contactLinkStyle}>WhatsApp</a>
  </p>
  <p style={{ fontSize: "14px", marginBottom: "12px" }}>
    🎵 <a href="https://www.tiktok.com/@shirojohn" target="_blank" rel="noreferrer" style={contactLinkStyle}>TikTok</a>
  </p>
          <p style={{ fontSize: "14px", marginBottom: "10px" }}>📍 Nairobi, Kenya</p>
          <div style={{ marginTop: "15px" }}>
            <a href="/contact"  style={ctaButtonStyle}>
              SEND A MESSAGE
            </a>
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #1e293b", margin: "40px 0" }} />

      <div style={{ textAlign: "center", fontSize: "13px" }}>
        <p>© {currentYear} Kykam Agencies Kenya. Licensed & Verified.</p>
        <p style={{ marginTop: "5px", opacity: 0.6 }}>Serving all 47 Counties with Pride.</p>
      </div>
    </footer>
  );
};

const linkStyle = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: "14px",
  display: "block",
  transition: "0.2s color ease",
};
const contactLinkStyle = {
  color: "#f3a82f",
  textDecoration: "none",
  transition: "0.3s"
};

const ctaButtonStyle = {
  backgroundColor: "#f3a82f",
  color: "#0f172a",
  padding: "8px 16px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "13px",
  display: "inline-block"
};



export default Footer;