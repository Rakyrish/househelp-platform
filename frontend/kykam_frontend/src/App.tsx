import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
// import {BrowserRouter as Router, Route, BrowserRouter} from 'react-router-dom';
import Header from './layout/header';
import Footer from './layout/footer';

import Home from './pages/Home/Home';
import About from './pages/Home/about';
import Services from './pages/Home/services';
import Why from './pages/Home/why';
import RegisterWorker from "./auth/register/Worker";
import RegisterEmployer from "./auth/register/Employer";
import Worker from './components/worker';
import Employer from './components/employer';
import WorkerDirectory from "./pages/Dashboard/WorkerDirectory";
import WorkerLogin from "./auth/login/Worker";
import EmployerLogin from "./auth/login/Employer";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider> {/* Wrap everything in the Auth Brain */}
        <Header />
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login/worker" element={<WorkerLogin />} />
          <Route path="/login/employer" element={<EmployerLogin />} />
          <Route path="/register/worker" element={<RegisterWorker />} />
          <Route path="/register/employer" element={<RegisterEmployer />} />
          <Route path="/why-kykam" element={<Why />} />
          

          {/* Private Worker Pages */}
          <Route path="/dashboard/worker" element={
            <ProtectedRoute allowedRole="worker">
              <Worker />
            </ProtectedRoute>
          } />

          {/* Private Employer Pages */}
          <Route path="/dashboard/employer" element={
            <ProtectedRoute allowedRole="employer">
              <Employer />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/workerDir" element={
            <ProtectedRoute allowedRole="employer">
              <WorkerDirectory />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;