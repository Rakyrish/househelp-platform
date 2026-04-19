import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// --- Types ---

interface User {
  name: string;
  role: 'worker' | 'employer' | 'admin';
  verification_status?: string;
  payment_submitted_at?: string | null;
  is_verified?: boolean;
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

// ✅ Register now returns the full response data so callers can access
// payment_token, amount, or any other field Django sends back
interface RegisterResponse {
  data: {
    payment_token?: string;
    amount?: number;
    message?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

// --- Context Definition ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const persistSession = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    localStorage.setItem('token', nextToken);
    api.defaults.headers.common['Authorization'] = `Token ${nextToken}`;
  };

  const fetchWorkerUser = async (): Promise<User> => {
    const { data } = await api.get('/worker/dashboard/profile_status/');
    console.log("User status:", data.verification_status);

    return {
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Worker',
      role: data.role || 'worker',
      verification_status: data.verification_status,
      payment_submitted_at: data.payment_submitted_at,
      is_verified: data.is_verified,
    };
  };

  // 1. Persist Session on Refresh
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Token ${storedToken}`;

          if (parsedUser.role === 'worker') {
            const freshWorkerUser = await fetchWorkerUser();
            setUser(freshWorkerUser);
            localStorage.setItem('user', JSON.stringify(freshWorkerUser));
          } else {
            setUser(parsedUser);
          }
        } catch (e) {
          localStorage.clear();
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    void restoreSession();
  }, []);

  // 2. Login Logic
  const login = async ({ phone, password, type }: LoginCredentials) => {
    try {
      const { data } = await api.post(`/login/${type}/`, { phone, password });
      api.defaults.headers.common['Authorization'] = `Token ${data.token}`;

      const authUser: User = data.role === 'worker'
        ? await fetchWorkerUser()
        : {
            name: data.name,
            role: data.role,
            verification_status: data.verification_status,
          };

      persistSession(authUser, data.token);
      message.success('Login Successful');

      // Redirect based on role
      navigate(
        data.role === 'admin'
          ? '/admin'
          : data.role === 'employer'
            ? '/dashboard/employer'
            : '/dashboard/worker'
      );
    } catch (error: any) {
      if (error.response?.data?.requires_payment) {
        throw error;
      }
      
      const msg = error.response?.data?.error || error.response?.data?.detail || 'Login failed. Check credentials.';
      message.error(msg);
      throw error;
    }
  };

  // 3. Registration Logic
  // ✅ Returns the full axios response so the caller (RegisterWorker) can
  // read payment_token and amount from response.data and navigate to payment page.
  // Navigation is NOT done here — the component decides where to go after register.
  const register = async ({ type, payload }: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await api.post(`/register/${type}/`, payload);
      // Do NOT navigate or show success here — let the calling component handle it
      // since worker registration needs to redirect to payment, not login
      return response;
    } catch (error: any) {
      const errorData = error.response?.data;
      const firstError = errorData
        ? Object.values(errorData)[0]
        : 'Registration failed.';
      message.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      throw error;
    }
  };

  // 4. Refresh User Logic
  const refreshUser = async () => {
    if (!token || user?.role !== 'worker') return;
    try {
      const updatedUser = await fetchWorkerUser();
      persistSession(updatedUser, token);
    } catch (error) {
      console.error("Failed to refresh user status", error);
    }
  };

  // 1.5 Auto-refresh worker status unconditionally on mount
  useEffect(() => {
    if (!loading && user?.role === 'worker') {
      refreshUser();
    }
  }, [loading, user?.role]);

  // 5. Logout Logic
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
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, loading }}>
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
