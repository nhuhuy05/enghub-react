export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: string[];
}
