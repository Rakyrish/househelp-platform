const Footer = () => {
  return (
      <footer style={{ padding: "60px 20px", backgroundColor: "#1e293b", color: "#cbd5e1", textAlign: "center" }}>
        <h2 style={{ color: "white", marginBottom: "20px" }}>Kykam Platform</h2>
        <p style={{ marginBottom: "20px" }}>Connecting Kenyan Homes with Integrity.</p>
        <div style={{ marginBottom: "30px" }}>
          <a href="/terms" style={{ color: "#f3a82f", margin: "0 15px", textDecoration: "none" }}>Terms</a>
          <a href="/privacy" style={{ color: "#f3a82f", margin: "0 15px", textDecoration: "none" }}>Privacy</a>
          <a href="/contact" style={{ color: "#f3a82f", margin: "0 15px", textDecoration: "none" }}>Contact Us</a>
        </div>
        <p style={{ fontSize: "14px", opacity: "0.7" }}>© 2026 Kykam Kenya. Serving all 47 Counties.</p>
      </footer>

    )
}

export default Footer