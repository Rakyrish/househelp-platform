import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Header from "./layout/header";
import Footer from "./layout/footer";

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

// Dashboard Pages
import Worker from "./components/worker";
import Employer from "./components/employer";
import WorkerDirectory from "./pages/Dashboard/WorkerDirectory";

// Admin System Pages
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import VerificationPage from "./pages/admin/Verification";

// Context & Protection
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 1. ADMIN LOGIN (No Layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 2. ADMIN DASHBOARD (Uses AdminLayout Sidebar) */}
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

          {/* 3. PUBLIC & USER SECTION (Uses Header/Footer) */}
          {/* Note the "/*" after the path - this is crucial for nested routes */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <main className="min-h-screen"> 
                  <Routes>
                    {/* Public Pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/why-kykam" element={<Why />} />
                    <Route path="/login/worker" element={<WorkerLogin />} />
                    <Route path="/login/employer" element={<EmployerLogin />} />
                    <Route path="/register/worker" element={<RegisterWorker />} />
                    <Route path="/register/employer" element={<RegisterEmployer />} />

                    {/* Private Worker Pages */}
                    <Route
                      path="/dashboard/worker"
                      element={
                        <ProtectedRoute allowedRole="worker">
                          <Worker />
                        </ProtectedRoute>
                      }
                    />

                    {/* Private Employer Pages */}
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

                    {/* Fallback for anything not matched inside the public section */}
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