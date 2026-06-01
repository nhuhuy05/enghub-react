import apiClient from '@/api/apiClient';
import type { ApiResponse } from '@/types/apiTypes';
import type {
  AdminRole,
  AdminUser,
  AdminUserCreatePayload,
  AdminUserFilters,
  AdminUserUpdatePayload,
  PageResponse,
} from '../types';

const unwrapAdminResult = <T>(response: ApiResponse<T>, fallback: string): T => {
  if (response.code !== 1000) {
    throw new Error(getAdminUserErrorMessage(response.code, response.message || fallback));
  }
  return response.result;
};

export const getAdminUserErrorMessage = (code?: number, fallback = 'Không thể xử lý người dùng.') => {
  if (code === 1001) return 'Dữ liệu không hợp lệ hoặc thao tác này không được phép.';
  if (code === 1002) return 'Email đã tồn tại.';
  if (code === 1003) return 'Email không đúng định dạng.';
  if (code === 1004) return 'Mật khẩu phải có ít nhất 8 ký tự.';
  if (code === 1005) return 'Không tìm thấy người dùng.';
  if (code === 1007) return 'Bạn không có quyền quản lý người dùng.';
  if (code === 9999) return 'Backend đang lỗi ngoài dự kiến. Kiểm tra log server của request vừa gửi.';
  return fallback;
};

export const adminUserService = {
  getUsers: async (filters: AdminUserFilters): Promise<PageResponse<AdminUser>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminUser>>>('/admin/users', {
      params: {
        keyword: filters.keyword || undefined,
        role: filters.role || undefined,
        active: filters.active,
        page: filters.page ?? 0,
        size: filters.size ?? 20,
      },
    });
    return unwrapAdminResult(response.data, 'Không thể tải danh sách người dùng.');
  },

  getUser: async (userId: number): Promise<AdminUser> => {
    const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${userId}`);
    return unwrapAdminResult(response.data, 'Không thể tải chi tiết người dùng.');
  },

  createUser: async (payload: AdminUserCreatePayload): Promise<AdminUser> => {
    const response = await apiClient.post<ApiResponse<AdminUser>>('/admin/users', payload);
    return unwrapAdminResult(response.data, 'Không thể tạo người dùng.');
  },

  updateUser: async (userId: number, payload: AdminUserUpdatePayload): Promise<AdminUser> => {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}`, payload);
    return unwrapAdminResult(response.data, 'Không thể cập nhật người dùng.');
  },

  updateStatus: async (userId: number, active: boolean): Promise<AdminUser> => {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/status`, { active });
    return unwrapAdminResult(response.data, 'Không thể cập nhật trạng thái người dùng.');
  },

  deleteUser: async (userId: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/admin/users/${userId}`);
    unwrapAdminResult(response.data, 'Không thể xóa người dùng.');
  },

  getRoles: async (): Promise<AdminRole[]> => {
    const response = await apiClient.get<ApiResponse<AdminRole[]>>('/roles');
    return unwrapAdminResult(response.data, 'Không thể tải danh sách vai trò.');
  },
};
