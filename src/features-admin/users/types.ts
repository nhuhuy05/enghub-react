export interface AdminPermission {
  name: string;
  description: string | null;
}

export interface AdminRole {
  name: string;
  description: string | null;
  permissions: AdminPermission[];
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  provider: string | null;
  active: boolean;
  roles: AdminRole[];
  created_at: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  first: boolean;
  last: boolean;
}

export interface AdminUserFilters {
  keyword?: string;
  role?: string;
  active?: boolean;
  page?: number;
  size?: number;
}

export interface AdminUserCreatePayload {
  email: string;
  password: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  active?: boolean;
  roles?: string[];
}

export interface AdminUserUpdatePayload {
  email?: string;
  password?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  active?: boolean;
  roles?: string[];
}
