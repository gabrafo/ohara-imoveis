// types/auth/responses.ts
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileResponse {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}