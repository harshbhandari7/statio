import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isManagerOrAdmin: () => boolean;
  isSuperuser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile
      auth.getCurrentUser()
        .then(response => {
          setUser(response.data);
        })
        .catch((error) => {
          // Only clear token if it's an authentication error (401)
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
          }
          // Don't redirect on other errors
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setUser(user);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials');
      throw error;
    }
  };

  const register = async (email: string, password: string, full_name: string) => {
    try {
      const response = await auth.register(email, password, full_name);
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setUser(user);
      toast.success('Registered successfully');
      navigate('/');
    } catch (error) {
      toast.error('Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.is_superuser === true;
  };

  const isManagerOrAdmin = () => {
    return user?.role === 'admin' || user?.role === 'manager' || user?.is_superuser === true;
  };

  const isSuperuser = () => {
    return user?.is_superuser === true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAdmin, 
      isManagerOrAdmin,
      isSuperuser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}