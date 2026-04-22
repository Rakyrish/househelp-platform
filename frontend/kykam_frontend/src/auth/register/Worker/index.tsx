import React, { useState } from "react";
import { message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import TermsModal from "../../../components/TermsModal";
import {
  User, Mail, Lock, Phone, MapPin, Briefcase,
  IdCard, ShieldAlert, Upload, X, ArrowRight, DollarSign,
  CheckCircle, ChevronRight
} from "lucide-react";

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
const steps = ["Personal Info", "Documents", "Emergency Contact"];

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${done
                  ? "bg-[#f3a82f] text-white shadow-md shadow-orange-200"
                  : active
                    ? "bg-white border-2 border-[#f3a82f] text-[#f3a82f]"
                    : "bg-slate-100 text-slate-400"
                }`}
            >
              {done ? <CheckCircle size={18} /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${active ? "text-[#f3a82f]" : done ? "text-slate-500" : "text-slate-300"
                }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-[2px] w-8 sm:w-16 mb-5 mx-0.5 sm:mx-1 rounded-full transition-all duration-500 ${i < current ? "bg-[#f3a82f]" : "bg-slate-100"
                }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── FORM INPUT ───────────────────────────────────────────────────────────────
const FormInput = ({ label, icon: Icon, ...props }: any) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f3a82f] transition-colors duration-200">
        <Icon size={17} />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl
          focus:bg-white focus:ring-2 focus:ring-[#f3a82f]/20 focus:border-[#f3a82f]
          outline-none transition-all duration-200 placeholder:text-slate-300
          text-slate-700 text-sm font-medium"
      />
    </div>
  </div>
);

// ─── SELECT FIELD ─────────────────────────────────────────────────────────────
const FormSelect = ({ label, children, ...props }: any) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <select
      {...props}
      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl
        focus:ring-2 focus:ring-[#f3a82f]/20 focus:border-[#f3a82f]
        outline-none cursor-pointer text-sm font-medium text-slate-700 transition-all duration-200"
    >
      {children}
    </select>
  </div>
);

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
const ImageUpload = ({
  label,
  file,
  setFile,
}: {
  label: string;
  file: File | null;
  setFile: (f: File | null) => void;
}) => (
  <div
    className="relative group bg-white border-2 border-dashed border-slate-200 rounded-2xl p-4
    flex flex-col items-center hover:border-[#f3a82f] hover:bg-orange-50/30 transition-all duration-200"
  >
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
      {label}
    </span>
    {file ? (
      <div className="relative w-full">
        <img
          src={URL.createObjectURL(file)}
          className="h-28 w-full object-cover rounded-xl shadow-sm"
          alt="preview"
        />
        <button
          type="button"
          onClick={() => setFile(null)}
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full
            hover:bg-red-600 shadow-md cursor-pointer transition-colors"
        >
          <X size={13} />
        </button>
        <div className="mt-2 flex items-center gap-1.5 justify-center">
          <CheckCircle size={13} className="text-emerald-500" />
          <span className="text-[10px] text-emerald-600 font-semibold truncate max-w-[120px]">
            {file.name}
          </span>
        </div>
      </div>
    ) : (
      <label className="cursor-pointer flex flex-col items-center py-5 w-full">
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center mb-2 transition-colors">
          <Upload
            className="text-slate-300 group-hover:text-[#f3a82f] transition-colors"
            size={20}
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">Tap to upload</span>
        <span className="text-[10px] text-slate-300 mt-0.5">JPG, PNG, WEBP</span>
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

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SectionHeader = ({
  icon: Icon,
  label,
  color,
}: {
  icon: any;
  label: string;
  color: string;
}) => (
  <div className="flex items-center gap-2.5 mb-6">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon size={18} />
    </div>
    <h3 className="text-base font-bold text-slate-800">{label}</h3>
  </div>
);

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
const ProgressBar = ({ step }: { step: number }) => {
  const pct = Math.round(((step + 1) / 3) * 100);
  return (
    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ─── FORM STATE TYPE ──────────────────────────────────────────────────────────
interface IFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  location: string;
  age: string;
  gender: string;
  id_number: string;
  kin_name: string;
  kin_phone: string;
  kin_relationship: string;
  experience: string;
  expected_salary: string;
  accepted_terms: boolean;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const RegisterWorker = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IFormData>({
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
    expected_salary: "",
    accepted_terms: false,
  });

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [passportImg, setPassportImg] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
  };

  // ── Per-step validation ────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    if (step === 0) {
      if (!formData.full_name || !formData.email || !formData.password || !formData.confirm_password) {
        message.error("Please fill in all required personal details.");
        return false;
      }
      if (formData.password !== formData.confirm_password) {
        message.error("Passwords do not match!");
        return false;
      }
      if (!formData.phone || !formData.location || !formData.age || !formData.expected_salary || !formData.experience) {
        message.error("Please complete all personal detail fields.");
        return false;
      }
    }
    if (step === 1) {
      if (!formData.id_number) {
        message.error("Please enter your ID number.");
        return false;
      }
      if (!idFront || !idBack || !passportImg) {
        message.error("Please upload ID Front, ID Back, and Passport Image.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.kin_name || !formData.kin_phone || !formData.kin_relationship) {
        message.error("Please complete all emergency contact fields.");
        return false;
      }
      if (!formData.accepted_terms) {
        message.error("You must agree to the Terms and Conditions to continue.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // ── Phone formatter: 07XXXXXXXX → 2547XXXXXXXX ────────────────────────────
  const formatPhoneForMpesa = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
    if (cleaned.startsWith("254")) return cleaned;
    return "254" + cleaned;
  };

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    const payload = new window.FormData();

    // Append all text fields except confirm_password
    (Object.keys(formData) as (keyof IFormData)[]).forEach((key) => {
      if (key !== "confirm_password" && key !== "accepted_terms") {
        if (key === "phone" || key === "kin_phone") {
          payload.append(key, formatPhoneForMpesa(String(formData[key])));
        } else {
          payload.append(key, String(formData[key]));
        }
      }
    });

    // Add boolean explicitly
    payload.append("accepted_terms", formData.accepted_terms ? "true" : "false");

    if (idFront) payload.append("id_photo_front", idFront);
    if (idBack) payload.append("id_photo_back", idBack);
    if (passportImg) payload.append("passport_img", passportImg);

    try {
      // ✅ register returns the full axios response — no cast needed
      const response = await register({ type: "worker", payload });

      const payment_token = response?.data?.payment_token;
      const amount = response?.data?.amount ?? 129;

      message.success(
        "Registration successful! Complete your payment to activate your account."
      );

      navigate("/payment/verify", {
        state: {
          payment_token,
          amount,
          email: formData.email,
          phone: formatPhoneForMpesa(formData.phone),
          name: formData.full_name,
        },
      });
    } catch (error) {
      // Error already displayed inside AuthContext — just log here
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Step panels ───────────────────────────────────────────────────────────
  const renderStep = () => {
    if (step === 0)
      return (
        <section className="animate-fadeIn">
          <SectionHeader icon={User} label="Personal Details" color="bg-orange-100 text-[#f3a82f]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput label="Full Name *" icon={User} name="full_name" type="text" value={formData.full_name} onChange={handleChange} required placeholder="Jane Mwangi" />
            <FormInput label="Email Address *" icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="jane@example.com" />
            <FormInput label="Password *" icon={Lock} name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Min. 6 characters" />
            <FormInput label="Confirm Password *" icon={Lock} name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required placeholder="Repeat password" />
            <FormInput label="Phone Number *" icon={Phone} name="phone" type="text" value={formData.phone} onChange={handleNumericChange} required placeholder="0712345678" inputMode="numeric" />
            <FormInput label="Expected Salary (KES) *" icon={DollarSign} name="expected_salary" type="text" value={formData.expected_salary} onChange={handleNumericChange} required placeholder="15000" inputMode="numeric" />
            <FormInput label="Location *" icon={MapPin} name="location" type="text" value={formData.location} onChange={handleChange} required placeholder="City, Suburb" />
            <FormSelect label="Experience Level *" name="experience" value={formData.experience} onChange={handleChange} required>
              <option value="">Select experience</option>
              <option value="none">No experience</option>
              <option value="few months">Less than a year</option>
              <option value="1-3">1–3 years</option>
              <option value="5+">5+ years</option>
            </FormSelect>
            <FormInput label="Age *" icon={User} name="age" type="text" inputMode="numeric" value={formData.age} onChange={handleNumericChange} required placeholder="25" />
            <FormSelect label="Gender *" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Prefer not to say</option>
            </FormSelect>
          </div>
        </section>
      );

    if (step === 1)
      return (
        <section className="animate-fadeIn">
          <SectionHeader icon={IdCard} label="Verification Documents" color="bg-blue-100 text-blue-600" />
          <div className="mb-6 max-w-xs">
            <FormInput label="National ID Number *" icon={IdCard} name="id_number" type="text" value={formData.id_number} onChange={handleNumericChange} required placeholder="e.g. 34012345" />
          </div>
          <p className="text-xs text-slate-400 mb-4 font-medium">
            Upload clear, well-lit photos of your documents. All images are encrypted and stored securely.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ImageUpload label="ID Front *" file={idFront} setFile={setIdFront} />
            <ImageUpload label="ID Back *" file={idBack} setFile={setIdBack} />
            <ImageUpload label="Passport Photo *" file={passportImg} setFile={setPassportImg} />
          </div>
          <div className="mt-5 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 items-start">
            <ShieldAlert size={16} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-500 leading-relaxed">
              Your documents are used solely for identity verification and are never shared with third parties without your consent.
            </p>
          </div>
        </section>
      );

    if (step === 2)
      return (
        <section className="animate-fadeIn">
          <SectionHeader icon={ShieldAlert} label="Emergency Contact" color="bg-red-100 text-red-500" />
          <p className="text-xs text-slate-400 mb-6 font-medium">
            This person will be contacted in case of an emergency. Please provide accurate information.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput label="Full Name *" icon={User} name="kin_name" type="text" value={formData.kin_name} onChange={handleChange} required placeholder="John Doe" />
            <FormInput label="Relationship *" icon={Briefcase} name="kin_relationship" type="text" value={formData.kin_relationship} onChange={handleChange} required placeholder="e.g. Spouse, Parent" />
            <FormInput label="Phone Number *" icon={Phone} name="kin_phone" type="text" value={formData.kin_phone} onChange={handleNumericChange} required placeholder="0712345678" inputMode="numeric" />
          </div>

          <div className="mt-8 p-5 bg-orange-50 rounded-2xl border border-orange-100">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">
              Registration Summary
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-slate-400 text-xs">Name</span>
                <p className="font-semibold text-slate-700 truncate">{formData.full_name || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Email</span>
                <p className="font-semibold text-slate-700 truncate">{formData.email || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Phone</span>
                <p className="font-semibold text-slate-700">{formData.phone || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Location</span>
                <p className="font-semibold text-slate-700">{formData.location || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Experience</span>
                <p className="font-semibold text-slate-700">{formData.experience || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Expected Salary</span>
                <p className="font-semibold text-slate-700">KES {formData.expected_salary || "—"}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Account activation fee</span>
              <span className="text-base font-extrabold text-[#f3a82f]">KES 99</span>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="accepted_terms"
              name="accepted_terms"
              checked={formData.accepted_terms}
              onChange={(e) => setFormData((prev) => ({ ...prev, accepted_terms: e.target.checked }))}
              className="mt-1 w-5 h-5 rounded border-slate-300 text-[#f3a82f] focus:ring-[#f3a82f] cursor-pointer"
            />
            <label htmlFor="accepted_terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
              I agree to the <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-[#f3a82f] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">Terms and Conditions</button> and consent to the collection and processing of my personal data including identification documents for verification purposes.
            </label>
          </div>
        </section>
      );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 py-12 px-4 sm:px-6">
        <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
      `}</style>

        <div className="max-w-3xl mx-auto">
          <div className="bg-[#f3a82f] rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-7 sm:py-9 text-white relative overflow-hidden mb-6 shadow-lg shadow-orange-200/60">
            <div className="relative z-10">
              <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">Worker Portal</p>
              <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
              <p className="mt-1.5 text-orange-100/90 text-sm font-medium">
                Complete all steps and pay <strong className="text-white">KES 99</strong> to activate your profile.
              </p>
            </div>
            <Briefcase className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10" size={110} />
            <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 right-32 w-48 h-48 rounded-full bg-white/5" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-2">
              <StepIndicator current={step} />
              <ProgressBar step={step} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-8 pt-6 space-y-6 sm:space-y-8">
              {renderStep()}

              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl
                    hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-sm cursor-pointer"
                  >
                    ← Back
                  </button>
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#f3a82f] text-white
                    font-bold rounded-2xl hover:bg-orange-500 transition-all duration-200 shadow-md
                    shadow-orange-100 group cursor-pointer text-sm"
                  >
                    Continue
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <>


                    <button
                      type="submit"
                      disabled={loading || !formData.accepted_terms}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#f3a82f] text-white
                    font-bold rounded-2xl hover:bg-orange-500 transition-all duration-200 shadow-md
                    shadow-orange-100 disabled:opacity-60 group cursor-pointer text-sm"
                    >
                      {loading ? (
                        <Spin size="small" />
                      ) : (
                        <>
                          Register & Proceed to Payment
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </>

                )}
              </div>
            </form>

            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-slate-400 text-sm font-medium">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login/worker")}
                  className="text-[#f3a82f] font-bold hover:underline cursor-pointer"
                >
                  Login here
                </button>
              </p>
              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                <ShieldAlert size={12} />
                <span>Secured & encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TermsModal
        open={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        userType="Worker"
      />
    </>
  );
};

export default RegisterWorker;