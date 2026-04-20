// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { message } from 'antd';

// const ProtectedRoute = ({ children, allowedRole }) => {
//     const { user, token } = useAuth();

//     if (!token) {
//         // Not logged in at all
//         message.warning("kindly login to access dashboard.");
//         return <Navigate to="/" replace />;
//     }

//     if (allowedRole && user?.role !== allowedRole) {
//         // Logged in but wrong role (e.g., Worker trying to see Employer dash)
//         const homePath = user?.role === 'worker' ? '/dashboard/worker' : '/dashboard/employer';
//         return <Navigate to={homePath} replace />;
//     }
//     return children;

// };

// export default ProtectedRoute;

import type { JSX } from "react/jsx-dev-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EMPLOYER_LOGIN_PATH, getDashboardPath, getLoginPath } from "../utils/authRoutes";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRole?: "worker" | "employer" | "admin";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, token, loading } = useAuth();

  // 1️⃣ Loading state
  if (loading) return null; // Or a spinner if you want

  // 2️⃣ Not logged in at all
  if (!token || !user) {
    return <Navigate to={getLoginPath(allowedRole)} replace />;
  }

  // 3️⃣ Wrong role trying to access a protected route
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (allowedRole === "employer") {
      return <Navigate to={EMPLOYER_LOGIN_PATH} replace />;
    }
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // ✅ All good
  return children;
};

export default ProtectedRoute;

