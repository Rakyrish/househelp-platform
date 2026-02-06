import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// Layouts
import Header from "./layout/header";
import Footer from "./layout/footer";
import AdminLayout from "./layout/AdminLayout";

// Public & Auth Pages
import Home from "./pages/Home/Home";
import About from "./pages/Home/about";
import Services from "./pages/Home/services";
import Why from "./pages/Home/why";
import RegisterWorker from "./auth/register/Worker";
import RegisterEmployer from "./auth/register/Employer";
import WorkerLogin from "./auth/login/Worker";
import EmployerLogin from "./auth/login/Employer";
import AdminLogin from "./auth/login/Admin/AdminLogin";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPasswordConfirm from "./auth/ResetPasswordConfirm";
import ContactUs from "./layout/ContactUs";
import MaintenancePage from "./pages/MaintenancePage";

// Dashboard & Protected Pages
import Worker from "./components/worker";
import Employer from "./components/employer";
import WorkerDirectory from "./pages/Dashboard/WorkerDirectory";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import VerificationPage from "./pages/admin/Verification";

// Context & Protection
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// API Instance (Your fixed axios instance withCredentials: true)
import api from "./api/axios";

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
    return <MaintenancePage message={maintenance.msg} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
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
                    
                    {/* Auth Routes */}
                    <Route path="/login/worker" element={<WorkerLogin />} />
                    <Route path="/login/employer" element={<EmployerLogin />} />
                    <Route path="/register/worker" element={<RegisterWorker />} />
                    <Route path="/register/employer" element={<RegisterEmployer />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />

                    {/* Private Worker Routes */}
                    <Route
                      path="/dashboard/worker"
                      element={
                        <ProtectedRoute allowedRole="worker">
                          <Worker />
                        </ProtectedRoute>
                      }
                    />

                    {/* Private Employer Routes */}
                    <Route
                      path="/dashboard/employer"
                      element={
                        <ProtectedRoute allowedRole="employer">
                          <Employer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/workerDir"
                      element={
                        <ProtectedRoute allowedRole="employer">
                          <WorkerDirectory />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;