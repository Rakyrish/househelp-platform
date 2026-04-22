import { useState } from 'react';
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
        <div className="max-w-xl mx-auto py-10 md:py-14 px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-2">
                Contact Kykam Agencies
            </h2>
            <p className="text-center text-slate-500 mb-8 text-sm md:text-base">
                Have a question? Send us a message and we'll reply to your email.
            </p>

            {status.msg && (
                <div className={`p-4 rounded-xl mb-5 text-center text-sm font-medium ${
                    status.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {status.msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#f3a82f]/30 focus:border-[#f3a82f] transition-all"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#f3a82f]/30 focus:border-[#f3a82f] transition-all"
                />
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject (e.g., Hiring Inquiry)"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#f3a82f]/30 focus:border-[#f3a82f] transition-all"
                />
                <textarea
                    name="message"
                    placeholder="How can we help you?"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#f3a82f]/30 focus:border-[#f3a82f] transition-all resize-y"
                />
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-sm md:text-base transition-all active:scale-[0.98] ${
                        loading
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-[#f3a82f] text-slate-900 hover:brightness-110 cursor-pointer'
                    }`}
                >
                    {loading ? "Sending..." : "Send Message"}
                </button>
            </form>
        </div>
    );
};

export default ContactUs;