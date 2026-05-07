import type { ApiResponse, User } from '@/types/apiTypes';
import apiClient from '@/api/apiClient';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/authTypes';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/token', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  getMyInfo: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/myInfo');
    return response.data;
  },

  logout: async (token: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout', { token });
    return response.data;
  },
};
