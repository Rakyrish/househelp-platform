import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { HelmetProvider } from "react-helmet-async";

// Layouts (Keep Static for initial shell)
import Header from "./layout/header";
import Footer from "./layout/footer";
import AdminLayout from "./layout/AdminLayout";

// Lazy Loaded Public & Auth Pages
const Home = lazy(() => import("./pages/Home/Home"));
const About = lazy(() => import("./pages/Home/about"));
const Services = lazy(() => import("./pages/Home/services"));
const Why = lazy(() => import("./pages/Home/why"));
const RegisterWorker = lazy(() => import("./auth/register/Worker"));
const RegisterEmployer = lazy(() => import("./auth/register/Employer"));
const WorkerLogin = lazy(() => import("./auth/login/Worker"));
const EmployerLogin = lazy(() => import("./auth/login/Employer"));
const AdminLogin = lazy(() => import("./auth/login/Admin/AdminLogin"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const ResetPasswordConfirm = lazy(() => import("./auth/ResetPasswordConfirm"));
const ContactUs = lazy(() => import("./layout/ContactUs"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy Loaded Dashboard & Protected Pages
const Worker = lazy(() => import("./components/worker"));
const Employer = lazy(() => import("./components/employer"));
const WorkerDirectory = lazy(() => import("./pages/Dashboard/WorkerDirectory"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const VerificationPage = lazy(() => import("./pages/admin/Verification"));
const PaymentReview = lazy(() => import("./pages/admin/PaymentReview"));
const PaymentVerification = lazy(() => import("./pages/payment/PaymentVerification"));

// Context & Protection
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { EMPLOYER_LOGIN_ROUTE } from "./utils/authRoutes";

// API Instance (Your fixed axios instance withCredentials: true)
import api from "./api/axios";

// Fallback Loader
const PageLoader = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#f3a82f]"></div>
  </div>
);

function App() {
  const [maintenance, setMaintenance] = useState({ active: false, msg: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

        // 1. CSRF HANDSHAKE (The Developer-side fix)
        // This ensures the browser gets the 'csrftoken' cookie immediately
        try {
          await api.get("/set-csrf/");
          console.log("✔ Security handshake complete");
        } catch (csrfErr) {
          console.warn("✘ CSRF initialization failed. Forms may require refresh.", csrfErr);
        }

        // 2. SYSTEM STATUS CHECK
        // Using standard axios for the public status check
        const { data } = await axios.get(`${API_BASE}/api/admin-panel/platform-settings/`);

        // Check if current user is admin (Admins bypass maintenance mode)
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const isAdmin = user?.role === "admin";

        if (data.maintenance_mode && !isAdmin) {
          setMaintenance({ active: true, msg: data.broadcast_message });
        }
      } catch (err) {
        console.error("✘ System status check failed. Proceeding with caution.");
      } finally {
        setLoading(false);
      }
    };

    initializeSystem();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#f3a82f] mx-auto"></div>
          <p className="text-gray-600 font-medium">Verifying System Status...</p>
        </div>
      </div>
    );
  }

  if (maintenance.active) {
    return (
      <Suspense fallback={<PageLoader />}>
        <MaintenancePage message={maintenance.msg} />
      </Suspense>
    );
  }

  return (
    <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- 1. ADMIN AUTH (No Layout) --- */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* --- 2. ADMIN SYSTEM (Uses AdminLayout Sidebar) --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="verify/:userId" element={<VerificationPage />} />
              <Route path="payments" element={<PaymentReview />} />
            </Route>

            {/* --- 3. PUBLIC & CLIENT SECTION (Uses Header/Footer) --- */}
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <main className="page-container min-h-[calc(100vh-160px)]">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/why-kykam" element={<Why />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/payment/verify" element={<PaymentVerification />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={<Navigate to={EMPLOYER_LOGIN_ROUTE} replace />} />
                      <Route path="/login/worker" element={<WorkerLogin />} />
                      <Route path="/login/employer" element={<EmployerLogin />} />
                      <Route path="/register/worker" element={<RegisterWorker />} />
                      <Route path="/register/employer" element={<RegisterEmployer />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />

                      {/* Private Worker Routes */}
                      <Route
                        path="/worker/dashboard"
                        element={
                          <ProtectedRoute allowedRole="worker">
                            <Worker />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/dashboard/worker" element={<Navigate to="/worker/dashboard" replace />} />

                      {/* Private Employer Routes */}
                      <Route
                        path="/employer/dashboard"
                        element={
                          <ProtectedRoute allowedRole="employer">
                            <Employer />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/dashboard/employer" element={<Navigate to="/employer/dashboard" replace />} />
                      <Route
                        path="/dashboard/workerDir"
                        element={
                          <ProtectedRoute allowedRole="employer">
                            <WorkerDirectory />
                          </ProtectedRoute>
                        }
                      />

                      {/* 404 Page */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
