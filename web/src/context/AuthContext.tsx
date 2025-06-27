import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth.service';
import type { RegisterRequest } from '../types/auth/requests';

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  birthDate?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>; 
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const userData = await AuthService.getProfile() as User;
          setUser(userData);
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          await AuthService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    await AuthService.login({ email, password });
    const userData = await AuthService.getProfile() as User;
    setUser(userData);
    setLoading(false);
    return userData;
  };

  const register = async (data: any): Promise<User> => {
    setLoading(true);
    await AuthService.register(data);
    const userData = await AuthService.getProfile() as User;
    setUser(userData);
    setLoading(false);
    return userData;
  };

  const logout = async () => {
    setLoading(true);
    await AuthService.logout();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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