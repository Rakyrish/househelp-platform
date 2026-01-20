import  { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Define the User shape
interface User {
    name: string;
    role: 'worker' | 'employer';
}

// Define what the Context provides
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (phone: string, password: string, loginType: 'worker' | 'employer') => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const login = async (phone: string, password: string, loginType: 'worker' | 'employer') => {
        const response = await api.post(`/login/${loginType}/`, { phone, password });
        const { token: receivedToken, role, name, redirect } = response.data;

        setToken(receivedToken);
        setUser({ name, role });
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify({ name, role }));
        navigate(redirect);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.clear();
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};