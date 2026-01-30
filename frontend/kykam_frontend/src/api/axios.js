import axios from 'axios';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: VITE_API_BASE_URL ? `${VITE_API_BASE_URL}/api/` : '/api/',
    // withCredentials: true, 
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config.url.includes('/login/');

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // ONLY redirect if it's NOT a login attempt
            if (!isLoginRequest) {
                console.warn("Token expired. Logging out...");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/'; 
            }
        }
        return Promise.reject(error);
    }
);

export default api;