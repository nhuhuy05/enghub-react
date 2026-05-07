export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  authenticated: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}
