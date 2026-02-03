import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd'; // Assuming you are using antd based on your snippet

// --- Types ---

interface User {
  name: string;
  role: 'worker' | 'employer' | 'admin';
}

interface LoginCredentials {
  phone: string;
  password: string;
  type: 'worker' | 'employer' | 'admin';
}

interface RegisterRequest {
  type: 'worker' | 'employer';
  payload: FormData | object;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// --- Context Definition ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Persist Session on Refresh
  useEffect(() => {
    const restoreSession = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
        } catch (e) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // 2. Login Logic
  const login = async ({ phone, password, type }: LoginCredentials) => {
    try {
      const { data } = await api.post(`/login/${type}/`, { phone, password });

      const authUser: User = {
        name: data.name,
        role: data.role,
      };

      setUser(authUser);
      setToken(data.token);

      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('token', data.token);

      api.defaults.headers.common['Authorization'] = `Token ${data.token}`;
      message.success('Login Successful');
      
      // Redirect based on role
      navigate(data.role === 'employer' ? '/employer-dashboard' : '/worker-profile');
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Login failed. Check credentials.';
      message.error(msg);
      throw error;
    }
  };

  // 3. Registration Logic
  const register = async ({ type, payload }: RegisterRequest) => {
    try {
      // Axios automatically sets 'Content-Type': 'multipart/form-data' if payload is FormData
      await api.post(`/register/${type}/`, payload);
      
      message.success('Registration Successful! Please login.');
      navigate(`/login/${type}`);
    } catch (error: any) {
      const errorData = error.response?.data;
      // Extract first error message found in the object
      const firstError = errorData ? Object.values(errorData)[0] : 'Registration failed.';
      message.error(Array.isArray(firstError) ? firstError[0] : firstError);
      throw error;
    }
  };

  // 4. Logout Logic
  const logout = () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    message.info('Logged out');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// --- Custom Hook ---

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};