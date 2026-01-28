import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; 
import { message } from "antd";

function EmployerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. State management
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2. Input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Passes 'employer' type to hit the Employer login endpoint in Django
      await login({
        phone: formData.phone,
        password: formData.password,
        type: "employer",
      });
      message.success("Login successful!");
      navigate("/dashboard/employer");
    } catch (err: any) {
      // FIX: Extract the string message to prevent the "Objects are not valid" error
      
     message.error("Invalid phone number or password.")   
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl border border-slate-100">
        <div>
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg
              className="h-8 w-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Employer Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Access your dashboard to manage postings and hires.
          </p>
        </div>

        {/* Error Alert - Only renders if there is a string in the 'error' state */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
                placeholder="07XXXXXXXX"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-900"
              >
                Remember my company
              </label>
            </div>
            <div className="text-sm">
              <button
              onClick={() => navigate('/forgot-password') }
                type="button"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-colors shadow-md ${
                loading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {loading ? "Verifying..." : "Log in to Dashboard"}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-center text-sm text-slate-600">
            New to the platform?{" "}
            <button
              onClick={() => navigate("/register/employer")}
              className="font-semibold text-orange-600 hover:underline focus:outline-none"
            >
              Create an Employer Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployerLogin;
