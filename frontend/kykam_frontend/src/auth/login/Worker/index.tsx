import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { message } from "antd";

function WorkerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. State for form inputs and errors
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Show error message if redirected here after session expiry
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      message.error("Your session has expired. Please verify your account to continue.");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Keep handleChange simple - no transformation, just store as typed
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Normalize phone silently at submission time
  const normalizePhone = (phone: string): string => {
    if (/^0[71]/.test(phone)) {
      return "254" + phone.slice(1);
    }
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({
        phone: normalizePhone(formData.phone), // 👈 normalized here silently
        password: formData.password,
        type: "worker",
      });

      message.success("Login successful!");
      navigate("/dashboard/worker");

    } catch (err: any) {
      if (err.response?.status === 403) {
        if (err.response?.data?.requires_payment) {
          message.warning(err.response.data.error || "Please verify your account to continue.");
          navigate("/payment/verify", {
            state: {
              payment_token: err.response.data.payment_token,
              amount: err.response.data.amount,
              phone: err.response.data.phone,
              email: err.response.data.email,
              name: err.response.data.name,
            },
          });
          return;
        } else if (err.response?.data?.requires_payment === false) {
          // Under review + expired = blocked
          setError(err.response.data.error || "Your account is still under review. Please wait for admin approval.");
          message.error(err.response.data.error || "Your account is still under review.");
          return;
        } else {
          setError(err.response.data.error || "Your account access is currently restricted.");
          return;
        }
      }
      // Fallback for 400s or 401s
      setError(err.response?.data?.error || err.response?.data?.detail || "Invalid phone number or password.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Worker Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
                placeholder="e.g. 0712345678"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                onClick={() => navigate('/forgot-password')}
                type="button"
                className="font-medium text-blue-600 hover:text-orange-500"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-colors shadow-md ${loading
                ? "bg-orange-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
                }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="pt-4">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register/worker")}
              className="font-semibold text-blue-600 hover:underline focus:outline-none"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkerLogin;
