export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface Permission {
  id?: string | number;
  name: string;
  description?: string;
}

export interface Role {
  id?: string | number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface User {
  id: string | number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: Role[];
}
