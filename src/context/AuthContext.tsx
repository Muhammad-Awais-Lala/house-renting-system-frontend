import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/api';

export type Role = 'tenant' | 'landlord' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  profileImage?: string;
  phoneNumber?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: Role;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('houseintel_token');
    const storedUser = localStorage.getItem('houseintel_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Verify user status on mount and when token changes
  useEffect(() => {
    const verifyStatus = async () => {
      if (user && user._id) {
        try {
          const resp = await userService.getProfile(user._id);
          const freshUser = resp.data.user;
          if (freshUser.isActive === false) {
            // User is blocked
            logout();
            setError('You are blocked by admin');
            setIsBlocked(true);
          } else {
            // Update stored user with latest data (in case of role changes etc.)
            setUser(freshUser);
            localStorage.setItem('houseintel_user', JSON.stringify(freshUser));
            setIsBlocked(false);
          }
        } catch (err) {
          console.error('Failed to verify user status', err);
        }
      }
    };
    verifyStatus();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.login(email, password);
      const { token: newToken, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem('houseintel_token', newToken);
      localStorage.setItem('houseintel_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: Role;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.register(userData);
      const { token: newToken, user: newUser } = response.data;

      // Store token and user data
      localStorage.setItem('houseintel_token', newToken);
      localStorage.setItem('houseintel_user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('houseintel_token');
    localStorage.removeItem('houseintel_user');
    setToken(null);
    setUser(null);
    setError(null);
    setIsBlocked(false);
  };

  const clearError = () => {
    setError(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('houseintel_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isBlocked, isLoading, error, clearError, updateUser }}>
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
