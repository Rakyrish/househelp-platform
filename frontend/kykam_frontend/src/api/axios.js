import axios from 'axios';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: VITE_API_BASE_URL ? `${VITE_API_BASE_URL}/api/` : '/api/',
    // withCredentials: true, 
});

api.interceptors.response.use(
    (response) => response, // If request is successful, do nothing
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Token expired or unauthorized. Logging out...");
            
            // 1. Clear Local Storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // 2. Redirect to login page
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;