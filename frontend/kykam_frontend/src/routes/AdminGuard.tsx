import { Navigate, Outlet } from 'react-router-dom';

const AdminGuard = () => {
  // In a real app, get this from your Auth Context or Redux
  const user = { role: 'admin', isAuthenticated: true }; 

  if (!user.isAuthenticated || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Renders the child routes
};

export default AdminGuard;