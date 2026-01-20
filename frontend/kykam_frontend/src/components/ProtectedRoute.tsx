import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, token } = useAuth();

    if (!token) {
        // Not logged in at all
        message.warning("kindly login to access dashboard.");
        return <Navigate to="/" replace />;
    }

    if (allowedRole && user?.role !== allowedRole) {
        // Logged in but wrong role (e.g., Worker trying to see Employer dash)
        const homePath = user?.role === 'worker' ? '/dashboard/worker' : '/dashboard/employer';
        return <Navigate to={homePath} replace />;
    }
    return children;
};

export default ProtectedRoute;