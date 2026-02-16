import React, { useState } from "react";
import { message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // 1. Import useAuth
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Users,
  Banknote,
  Home,
  Calendar,
  ClipboardList,
  ArrowRight,
  IdCard,
  Upload,
  X,
} from "lucide-react";

// --- HELPER COMPONENTS (STAY THE SAME) ---

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
    <span className="text-[10px] font-bold text-slate-400 uppercase mb-3">
      {label}
    </span>
    {file ? (
      <div className="relative w-full">
        <img
          src={URL.createObjectURL(file)}
          className="h-32 w-full object-cover rounded-xl shadow-sm"
          alt="preview"
        />
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
        <Upload
          className="text-slate-300 group-hover:text-[#f3a82f] mb-2"
          size={24}
        />
        <span className="text-xs text-slate-400 font-medium text-center">
          Tap to Upload
        </span>
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

const RegisterEmployer = () => {
  const { register } = useAuth(); // 2. Hook into AuthContext
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [idFront, setIdFront] = useState<File | null>(null);
    const [idBack, setIdBack] = useState<File | null>(null);
    const [passportImg, setPassportImg] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    location: "",
    family_size: "",
    worker_type: "general_househelp",
    salary: "",
    accommodation: "live_out",
    start_date: "",
    requirements: "",
    id_number: "",
  });

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Basic Validations
    if (formData.password.length < 4)
      return message.error("Password too short.");
    if (formData.password !== formData.confirm_password)
      return message.error("Passwords do not match!");
    
    const phoneRegex = /^07\d{8}$|^01\d{8}$/;
    if (!phoneRegex.test(formData.phone))
      return message.error("Invalid phone format (07... or 01...)");

    if (!idFront || !idBack || !passportImg) {
      return message.error(
        "Please upload all required documents: ID Front, ID Back, and Passport Image.",
      );
    }

    setLoading(true);

    try {
      // 2. Build the FormData (this is what carries the files)
      const data = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach((key) => {
        if (key !== "confirm_password") {
          data.append(key, (formData as any)[key]);
        }
      });

      // 3. Append the File objects
      data.append("id_photo_front", idFront);
      data.append("id_photo_back", idBack);
      data.append("passport_img", passportImg);

      // 4. Send the 'data' (FormData) object, not 'payload'
      await register({ type: "employer", payload: data });
      
    } catch (error: any) {
      console.error("Registration failed", error);
      // message.error is likely handled in your AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#f3a82f] px-8 py-10 text-white relative">
            <div className="relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                Employer Account
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Hire with Kykam
              </h2>
              <p className="mt-2 text-orange-50 opacity-90 font-medium">
                Find reliable, vetted domestic help for your home.
              </p>
            </div>
            <Home
              className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10"
              size={120}
            />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Section 1: Account Info */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <div className="p-2 bg-orange-100 rounded-lg text-[#f3a82f]">
                  <User size={20} />
                </div>
                <h3 className="text-lg font-bold">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <FormInput
                    label="Full Name*"
                    icon={User}
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <FormInput
                  label="Email Address*"
                  icon={Mail}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@email.com"
                />
                <FormInput
                  label="Phone Number*(Prefer Whatsapp Number)"
                  icon={Phone}
                  name="phone"
                  type="text"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={handleNumericChange}
                  required
                  placeholder="0712345678"
                />
                <FormInput
                  label="Password*"
                  icon={Lock}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Confirm Password*"
                  icon={Lock}
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </section>

            {/* <div className="mb-6 max-w-sm">
                <FormInput label="ID Number*" icon={IdCard} name="id_number" type="text" value={formData.id_number} onChange={handleNumericChange} required />
            </div> */}
            {/* Verification Documents */}
            <section className="bg-slate-50 -mx-8 px-8 py-8 border-y border-slate-100">
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <IdCard size={20} />
                </div>
                <h3 className="text-lg font-bold">Verification Documents</h3>
              </div>
              <div className="mb-6 max-w-sm">
                <FormInput
                  label="ID Number*"
                  icon={IdCard}
                  name="id_number"
                  type="text"
                  value={formData.id_number}
                  onChange={handleNumericChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageUpload
                  label="ID Front"
                  file={idFront}
                  setFile={setIdFront}
                  required
                />
                <ImageUpload
                  label="ID Back"
                  file={idBack}
                  setFile={setIdBack}
                  required
                />
                <ImageUpload
                  label="Passport Image"
                  file={passportImg}
                  setFile={setPassportImg}
                  required
                />
              </div>
            </section>

            {/* Section 2: Job Requirements */}
            <section className="bg-slate-50 -mx-8 px-8 py-8 border-y border-slate-100">
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <ClipboardList size={20} />
                </div>
                <h3 className="text-lg font-bold">Job Requirements</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Home Location*"
                  icon={MapPin}
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Kilimani, Nairobi"
                />

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Type of Help Needed*
                  </label>
                  <select
                    name="worker_type"
                    value={formData.worker_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f3a82f]/20 outline-none cursor-pointer"
                  >
                    <option value="general_househelp">General Househelp</option>
                    <option value="nanny">Nanny / Childcare</option>
                    <option value="cook">Professional Cook</option>
                    <option value="gardener">Gardener</option>
                    <option value="elderly">Elderly Care</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Family Size*"
                    icon={Users}
                    name="family_size"
                    type="text"
                    inputMode="numeric"
                    value={formData.family_size}
                    onChange={handleNumericChange}
                    required
                    placeholder="e.g. 4"
                  />
                  <FormInput
                    label="Salary (Ksh)*"
                    icon={Banknote}
                    name="salary"
                    type="text"
                    inputMode="numeric"
                    value={formData.salary}
                    onChange={handleNumericChange}
                    required
                    placeholder="15000"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Accommodation Type*
                  </label>
                  <select
                    name="accommodation"
                    value={formData.accommodation}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f3a82f]/20 outline-none cursor-pointer"
                  >
                    <option value="live_out">Live Out (Commuter)</option>
                    <option value="live_in">Live In (Stay over)</option>
                  </select>
                </div>

                <FormInput
                  label="Target Start Date"
                  icon={Calendar}
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                />

                <div className="md:col-span-2 flex flex-col space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Specific Requirements / Notes
                  </label>
                  <textarea
                    name="requirements"
                    rows={3}
                    value={formData.requirements}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f3a82f]/20 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                    placeholder="e.g. Must be good with pets, speaks Swahili fluently..."
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#f3a82f] text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-70 group cursor-pointer"
            >
              {loading ? (
                <Spin />
              ) : (
                <>
                  Register & Post Job
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-slate-500 font-medium">
              Need to manage your employees?{" "}
              <button
                onClick={() => navigate("/login/employer")}
                className="text-[#f3a82f] font-bold hover:underline cursor-pointer"
              >
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEmployer;
