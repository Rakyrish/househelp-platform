import axios from 'axios';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: VITE_API_BASE_URL ? `${VITE_API_BASE_URL}/api/` : '/api/',
    
    // ✅ FIX 1: Allow cookies to be sent with requests
    withCredentials: true, 

    // ✅ FIX 2: Tell Axios to look for the Django CSRF cookie
    xsrfCookieName: 'csrftoken', 
    
    // ✅ FIX 3: Tell Axios to send the token in the header Django expects
    xsrfHeaderName: 'X-CSRFToken', 
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Safe check for config and url
        const url = error.config?.url || '';
        const isLoginRequest = url.includes('/login/');

        // Specific check for temporary access expiration (backend returns 401)
        if (error.response && (error.response.status === 401 || error.response.status === 403) && error.response.data?.code === 'temporary_access_expired') {
            console.warn('Temporary access expired - forcing logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('/login/worker?expired=true');
            return Promise.reject(error);
        }

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // ONLY redirect if it's NOT a login attempt
            if (!isLoginRequest) {
                console.warn("Session expired or CSRF mismatch. Logging out...");
                const storedUser = localStorage.getItem('user');
                let role = null;
                try {
                    if (storedUser) {
                        const parsedUser = JSON.parse(storedUser);
                        role = parsedUser?.role;
                    }
                } catch (e) {}

                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Use replace to avoid back-button loops
                if (role === 'worker') {
                    window.location.replace('/login/worker');
                } else if (role === 'employer') {
                    window.location.replace('/login/employer');
                } else if (role === 'admin') {
                    window.location.replace('/admin/login');
                } else {
                    window.location.replace('/');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;