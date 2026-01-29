import React, { useState } from "react";
import { message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Lock, Phone, MapPin, Briefcase, 
  IdCard, ShieldAlert, Upload, X, ArrowRight, DollarSign
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// --- HELPER COMPONENTS (DEFINED OUTSIDE TO PREVENT FOCUS LOSS) ---

const FormInput = ({ label, icon: Icon, ...props }: any) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f3a82f] transition-colors">
        <Icon size={18} />
      </div>
      <input 
        {...props} 
        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#f3a82f]/20 focus:border-[#f3a82f] outline-none transition-all placeholder:text-slate-400 text-slate-700"
      />
    </div>
  </div>
);

const ImageUpload = ({ label, file, setFile }: any) => (
  <div className="relative group bg-white border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center hover:border-[#f3a82f] transition-all">
    <span className="text-[10px] font-bold text-slate-400 uppercase mb-3">{label}</span>
    {file ? (
      <div className="relative w-full">
        <img src={URL.createObjectURL(file)} className="h-32 w-full object-cover rounded-xl shadow-sm" alt="preview" />
        <button 
          type="button" 
          onClick={() => setFile(null)} 
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    ) : (
      <label className="cursor-pointer flex flex-col items-center py-6 w-full">
        <Upload className="text-slate-300 group-hover:text-[#f3a82f] mb-2" size={24} />
        <span className="text-xs text-slate-400 font-medium text-center">Tap to Upload</span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
        />
      </label>
    )}
  </div>
);

// --- MAIN COMPONENT ---

const RegisterWorker = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    location: "",
    age: "",
    gender: "other",
    id_number: "",
    kin_name: "",
    kin_phone: "",
    kin_relationship: "",
    experience: "",
    expected_salary: ""
  });

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [passportImg, setPassportImg] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const onlyNums = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, [name]: onlyNums }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      return message.error("Passwords do not match!");
    }
    
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "confirm_password") data.append(key, (formData as any)[key]);
    });

    if (idFront) data.append("id_photo_front", idFront);
    if (idBack) data.append("id_photo_back", idBack);
    if (passportImg) data.append("passport_img", passportImg);

    try {
      const response = await fetch(`${API}/api/register/worker/`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        message.success("Registration Successful!");
        navigate("/login/worker");
      } else {
        await response.json();
        message.error("Registration failed. Email or ID may already be in use.");
      }
    } catch (error) {
      message.error("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="bg-[#f3a82f] px-8 py-10 text-white relative">
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">Worker Registration</h2>
              <p className="mt-2 text-orange-50 opacity-90 font-medium">Create your profile and start getting job offers.</p>
            </div>
            <Briefcase className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10" size={100} />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            <section>
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <div className="p-2 bg-orange-100 rounded-lg text-[#f3a82f]"><User size={20}/></div>
                <h3 className="text-lg font-bold">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput label="Full Name*" icon={User} name="full_name" type="text" value={formData.full_name} onChange={handleChange} required placeholder="John Doe" />
                <FormInput label="Email Address*" icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                <FormInput label="Password*" icon={Lock} name="password" type="password" value={formData.password} onChange={handleChange} required />
                <FormInput label="Confirm Password*" icon={Lock} name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required />
                <FormInput label="Phone Number* (Prefer Whatsapp Number) " icon={Phone} name="phone" type="text" inputMode="numeric" value={formData.phone} onChange={handleNumericChange} required placeholder="0712345678" />
                <FormInput label="Expected Salary*" icon={DollarSign} name="expected_salary" type="text" inputMode="numeric" value={formData.expected_salary} onChange={handleNumericChange} required placeholder="Ksh 15,000" />
                <FormInput label="Location*" icon={MapPin} name="location" type="text" value={formData.location} onChange={handleChange} required placeholder="City, Suburb" />
                
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Experience Level*</label>
                  <select name="experience" value={formData.experience} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f3a82f]/20 outline-none cursor-pointer">
                    <option value="">Select Experience</option>
                    <option value="none">None</option>
                    <option value="few months">Less than a year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <FormInput label="Age*" icon={User} name="age" type="text" inputMode="numeric" value={formData.age} onChange={handleNumericChange} required />
                   <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Gender*</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f3a82f]/20 outline-none cursor-pointer">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-50 -mx-8 px-8 py-8 border-y border-slate-100">
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><IdCard size={20}/></div>
                <h3 className="text-lg font-bold">Verification Documents</h3>
              </div>
              
              <div className="mb-6 max-w-sm">
                <FormInput label="ID Number*" icon={IdCard} name="id_number" type="text" value={formData.id_number} onChange={handleNumericChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageUpload label="ID Front" file={idFront} setFile={setIdFront} />
                <ImageUpload label="ID Back" file={idBack} setFile={setIdBack} />
                <ImageUpload label="Passport Image" file={passportImg} setFile={setPassportImg} />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <div className="p-2 bg-red-100 rounded-lg text-red-600"><ShieldAlert size={20}/></div>
                <h3 className="text-lg font-bold">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormInput label="Kin Name" icon={User} name="kin_name" value={formData.kin_name} onChange={handleChange} required />
                <FormInput label="Relationship" icon={Briefcase} name="kin_relationship" value={formData.kin_relationship} onChange={handleChange} required />
                <FormInput label="Kin Phone" icon={Phone} name="kin_phone" value={formData.kin_phone} onChange={handleNumericChange} required />
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#f3a82f] text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-70 group cursor-pointer"
            >
              {loading ? <Spin /> : (
                <>
                  Complete Registration
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-slate-500 font-medium">
              Already have an account?{" "}
              <button onClick={() => navigate("/login/worker")} className="text-[#f3a82f] font-bold hover:underline cursor-pointer">
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterWorker;