import  { useState } from 'react';
import api from '../api/axios';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            const response = await api.post('contact-us/', formData);
            setStatus({ type: 'success', msg: response.data.success });
            // Clear form on success
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            setStatus({ 
                type: 'error', 
                msg: error.response?.data?.error || "Failed to send message. Check your internet." 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
            <h2 style={{ color: "#0f172a", textAlign: "center" }}>Contact Kykam Agencies</h2>
            <p style={{ textAlign: "center", color: "#64748b", marginBottom: "30px" }}>
                Have a question? Send us a message and we'll reply to your email.
            </p>

            {status.msg && (
                <div style={{ 
                    padding: "15px", 
                    borderRadius: "8px", 
                    marginBottom: "20px",
                    backgroundColor: status.type === 'success' ? "#dcfce7" : "#fee2e2",
                    color: status.type === 'success' ? "#166534" : "#991b1b",
                    textAlign: "center"
                }}>
                    {status.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject (e.g., Hiring Inquiry)"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />
                <textarea
                    name="message"
                    placeholder="How can we help you?"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, resize: "vertical" }}
                />
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        padding: "12px",
                        backgroundColor: loading ? "#cbd5e1" : "#f3a82f",
                        color: "#0f172a",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "0.3s"
                    }}
                >
                    {loading ? "Sending..." : "Send Message"}
                </button>
            </form>
        </div>
    );
};

const inputStyle = {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    outline: "none"
};

export default ContactUs;