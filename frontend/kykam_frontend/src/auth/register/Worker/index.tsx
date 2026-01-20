import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const RegisterWorker = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    location: '',
    age: '',
    gender: 'other',
    id_number: '',
    kin_name: '',
    kin_phone: '',
    kin_relationship: '',
  });

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const navigate = useNavigate();

  // 1. HELPER: Restrict input to numbers only in real-time
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const onlyNums = value.replace(/\D/g, ''); // Remove all non-numeric characters
    setFormData((prev) => ({ ...prev, [name]: onlyNums }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- SECURITY & VALIDATION ---
    
    // Password length check
    if (formData.password.length < 4) {
      return message.error("Password is too short (minimum 4 characters).");
    }

    // Password match check
    if (formData.password !== formData.confirm_password) {
      return message.error("Passwords do not match!");
    }

    // Phone validation: Must start with 07 and be 10 digits total
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      return message.error("Phone number must start with 07 and be exactly 10 digits.");
    }

    // Kin Phone validation
    if (!phoneRegex.test(formData.kin_phone)) {
      return message.error("Next of Kin phone must start with 07 and be 10 digits.");
    }

    // --- DATA PREPARATION ---
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      // We don't send confirm_password to the Django backend
      if (key !== 'confirm_password') {
        data.append(key, formData[key as keyof typeof formData]);
      }
    });

    if (idFront) data.append('id_photo_front', idFront);
    if (idBack) data.append('id_photo_back', idBack);

    try {
      const response = await fetch(`${API}/users/register/worker/`, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        message.success("Registration Successful!");
        // Reset Form
        setFormData({
          full_name: '', email: '', password: '', confirm_password: '',
          phone: '', location: '', age: '', gender: 'other',
          id_number: '', kin_name: '', kin_phone: '', kin_relationship: ''
        });
        setIdFront(null);
        setIdBack(null);
      } else {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        message.error("Registration failed. Check if email or ID is already used.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      message.error("Could not connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#f3a82f] p-6 text-white text-center">
          <h2 className="text-3xl font-bold">Worker Registration</h2>
          <p className="mt-2 opacity-90">Join the Kykam network and start earning.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* SECTION 1: Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="col-span-full font-bold text-gray-700 border-b pb-2">Personal Information</h3>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Full Name*</label>
              <input name="full_name" type="text" value={formData.full_name} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Email Address*</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Password* (Min 4 chars)</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Confirm Password*</label>
              <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Phone Number* (starts with 07)</label>
              <input 
                name="phone" 
                type="text" 
                inputMode="numeric"
                placeholder="0712345678"
                value={formData.phone} 
                onChange={handleNumericChange} 
                required 
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Age*</label>
              <input 
                name="age" 
                type="text" 
                inputMode="numeric"
                value={formData.age} 
                onChange={handleNumericChange} 
                required 
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Gender*</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="border border-gray-300 rounded-md px-4 py-2 outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">General Location*</label>
              <input name="location" type="text" value={formData.location} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" placeholder="City, Suburb" />
            </div>
          </div>

          {/* SECTION 2: ID Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="col-span-full font-bold text-gray-700 border-b pb-2">Identity Verification</h3>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-600">ID/Passport Number*</label>
              <input 
                name="id_number" 
                type="text" 
                value={formData.id_number}
                onChange={handleNumericChange} 
                minLength={6}
                required 
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">ID Photo (Front)*</label>
              <input type="file" onChange={(e) => setIdFront(e.target.files?.[0] || null)} required className="border border-gray-300 rounded-md px-2 py-1" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">ID Photo (Back)*</label>
              <input type="file" onChange={(e) => setIdBack(e.target.files?.[0] || null)} required className="border border-gray-300 rounded-md px-2 py-1" />
            </div>
          </div>

          {/* SECTION 3: Next of Kin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="col-span-full font-bold text-gray-700 border-b pb-2">Next of Kin (Emergency)*</h3>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Kin Name*</label>
              <input name="kin_name" type="text" value={formData.kin_name} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Kin Relationship*</label>
              <input name="kin_relationship" type="text" value={formData.kin_relationship} onChange={handleChange} required className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Kin Phone Number* (starts with 07)</label>
              <input 
                name="kin_phone" 
                type="text" 
                inputMode="numeric"
                value={formData.kin_phone}
                onChange={handleNumericChange} 
                required 
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#f3a82f] outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full cursor-pointer py-4 bg-[#f3a82f] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg mt-4"
          >
            Register as Worker
          </button>
        </form>
        <div>
          <p className="text-center text-sm text-gray-500 mb-4">
            Already have an account? <a  onClick={ () => navigate('/login/worker') } className="text-blue-600 font-medium hover:underline">Login here</a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterWorker;