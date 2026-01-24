import React, { useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const RegisterEmployer = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '', // Tracked for validation
    phone: '',
    location: '',
    family_size: '',
    worker_type: 'general_househelp',
  });

  // 1. HELPER: Ensure only numbers are typed
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const onlyNums = value.replace(/\D/g, ''); 
    setFormData((prev) => ({ ...prev, [name]: onlyNums }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- SECURITY & VALIDATION ---

    // Password length check
    if (formData.password.length < 4) {
      return message.error("Password must be at least 4 characters.");
    }

    // Password match check
    if (formData.password !== formData.confirm_password) {
      return message.error("Passwords do not match!");
    }

    // Phone validation (Starts with 07 and is 10 digits)
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      return message.error("Phone must start with 07 and be 10 digits.");
    }

    setLoading(true);
    setMessages({ type: '', text: '' });

    // Prepare data (remove confirm_password before sending to API)
    const { confirm_password, ...payload } = formData;

    try {
      await axios.post(`${API}/api/register/employer/`, payload);

      message.success('Registration Successful!');
      setMessages({ type: 'success', text: 'Account created! Redirecting to login...' });
         navigate('/login/employer')
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: '',
        location: '',
        family_size: '',
        worker_type: 'general_househelp',
      });

    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || 
        error.response?.data?.email?.[0] || 
        'Registration failed. Check your input.';

      message.error(errorMsg);
      setMessages({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-[#f3a82f] p-8 text-center relative">
          <div className="absolute top-4 right-4 bg-[#1e293b] text-white text-[10px] font-bold px-2 py-1 rounded">
            EMPLOYER
          </div>
          <h2 className="text-3xl font-bold text-white">Hire with Kykam</h2>
          <p className="text-white/80 mt-2">Find the perfect help for your home.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {messages.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${messages.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {messages.text}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name*</label>
              <input name="full_name" type="text" value={formData.full_name} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" placeholder="John Doe" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email*</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone* (07...)</label>
                <input 
                  name="phone" 
                  type="text" 
                  inputMode="numeric"
                  value={formData.phone} 
                  onChange={handleNumericChange} 
                  required 
                  className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password*</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirm Password*</label>
                <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Home Location*</label>
              <input name="location" type="text" value={formData.location} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" placeholder="e.g. Kilimani, Nairobi" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Family Size*</label>
                <input 
                  name="family_size" 
                  type="text" 
                  inputMode="numeric"
                  value={formData.family_size} 
                  onChange={handleNumericChange} 
                  required 
                  className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" 
                  placeholder="e.g. 4" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type of Househelp Needed*</label>
                <select name="worker_type" value={formData.worker_type} onChange={handleChange} className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none bg-white">
                  <option value="general_househelp">General HouseHelp</option>
                  <option value="nanny">Nanny/Childcare</option>
                  <option value="cook">Cook</option>
                  <option value="gardener">Gardener</option>
                  <option value="house_cleaner">House Cleaner</option>
                  <option value="elderly">Elderly care</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 bg-[#f3a82f] text-white font-bold rounded-xl shadow-lg transform transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#d99221] cursor-pointer'}`}
          >
            {loading ? "Processing..." : "Create Employer Account"}
          </button>
        </form>
        <div className="mb-2 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <a onClick={() => navigate('/login/employer')} className="text-blue-400 font-semibold hover:underline">
            Log in here
          </a>
        </p>
      </div>
      </div>
      
    </div>
  );
};

export default RegisterEmployer;