// src/types/user.ts
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
  plan_expires_at?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
  password?: string;
  plan_expires_at?: string;
}