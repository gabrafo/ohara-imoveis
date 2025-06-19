import api from './api';
import type { LoginRequest, RegisterRequest } from '../types/auth/requests';
import type { AuthResponse } from '../types/auth/responses';

const AuthService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/sign-in', credentials);
    
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    return response.data;
  },
  
  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(data.birthDate)) {
      throw new Error('Data de nascimento deve estar no formato DD-MM-YYYY');
    }
    
    const response = await api.post<AuthResponse>('/auth/sign-up', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },
  
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
  
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }
};

export default AuthService;