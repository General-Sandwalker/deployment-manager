// src/services/websites.ts
import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import { Website, WebsiteCreate, WebsiteUpdate } from "@/types";

export const createWebsite = async (
  website: WebsiteCreate,
  token: string
): Promise<Website> => {
  return apiPost<Website>('/websites/', website, token);
};

export const getUserWebsites = async (
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<Website[]> => {
  return apiGet<Website[]>(`/websites/?skip=${skip}&limit=${limit}`, token);
};

export const getAllWebsites = async (
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<Website[]> => {
  return apiGet<Website[]>(`/websites/all/?skip=${skip}&limit=${limit}`, token);
};

export const getWebsite = async (
  websiteId: number,
  token: string
): Promise<Website> => {
  return apiGet<Website>(`/websites/${websiteId}`, token);
};

export const updateWebsite = async (
  websiteId: number,
  updates: WebsiteUpdate,
  token: string
): Promise<Website> => {
  return apiPut<Website>(`/websites/${websiteId}`, updates, token);
};

export const deleteWebsite = async (
  websiteId: number,
  token: string
): Promise<void> => {
  return apiDelete(`/websites/${websiteId}`, token);
};

export const startWebsite = async (
  websiteId: number,
  token: string
): Promise<Website> => {
  return apiPost<Website>(`/websites/${websiteId}/start`, {}, token);
};

export const stopWebsite = async (
  websiteId: number,
  token: string
): Promise<Website> => {
  return apiPost<Website>(`/websites/${websiteId}/stop`, {}, token);
};

export const redeployWebsite = async (
  websiteId: number,
  token: string
): Promise<Website> => {
  return apiPost<Website>(`/websites/${websiteId}/redeploy`, {}, token);
};

export const adminDeleteWebsite = async (
  websiteId: number,
  token: string
): Promise<void> => {
  return apiDelete(`/admin/websites/${websiteId}`, token);
};