import apiClient from '@/api/apiClient';
import type { ApiResponse, User } from '@/types/apiTypes';
import type { UpdateProfileRequest } from '../types';

export const profileService = {
  getMyInfo: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/myInfo');
    return response.data;
  },

  updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data;
  },
};
