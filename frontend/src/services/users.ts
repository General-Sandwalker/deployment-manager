// src/services/users.ts
import { User, UserCreate, UserUpdate } from "@/types/user";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const createUser = async (user: UserCreate): Promise<User> => {
  return apiPost<User>("/users/", user);
};

export const getUsers = async (
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<User[]> => {
  return apiGet<User[]>(`/users/?skip=${skip}&limit=${limit}`, token);
};

export const getUser = async (userId: number, token: string): Promise<User> => {
  return apiGet<User>(`/users/${userId}`, token);
};

export const updateUser = async (
  userId: number,
  updates: UserUpdate,
  token: string
): Promise<User> => {
  return apiPut<User>(`/users/${userId}`, updates, token);
};

export const deleteUser = async (userId: number, token: string): Promise<void> => {
  return apiDelete(`/users/${userId}`, token);
};
