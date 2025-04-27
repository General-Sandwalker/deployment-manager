// src/services/users.ts
import { User, UserCreate, UserUpdate } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const createUser = async (userData: UserCreate): Promise<User> => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create user');
  }

  return response.json();
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }

  return response.json();
};

export const updateCurrentUser = async (userData: UserUpdate, token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }

  return response.json();
};

export const updateUserSettings = async (settingsData: UserUpdate, token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/me/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settingsData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user settings');
  }

  return response.json();
};

export const deleteCurrentUser = async (token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete user account');
  }
};

// Admin user management functions
export const getUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

export const getUser = async (id: number, token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
};

export const updateUser = async (
  id: number,
  userData: UserUpdate,
  token: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
};

export const deleteUser = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
};
