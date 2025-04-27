// src/types/user.ts
export interface User {
  avatar: unknown;
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string; // ISO datetime string
  plan_expires_at: string | null; // ISO datetime string or null
}

export interface UserCreate {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  full_name?: string | null;
  plan_expires_at?: string | null;
}