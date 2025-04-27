/* eslint-disable @typescript-eslint/no-unused-vars */
// src/services/websites.ts
import { Website, WebsiteCreate, WebsiteUpdate, WebsiteStatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// User routes
export const getUserWebsites = async (token: string): Promise<Website[]> => {
  const response = await fetch(`${API_URL}/websites/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user websites');
  }

  return response.json();
};

export const getWebsite = async (id: number, token: string): Promise<Website> => {
  const response = await fetch(`${API_URL}/websites/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch website');
  }

  return response.json();
};

export const createWebsite = async (website: WebsiteCreate, token: string): Promise<Website> => {
  const response = await fetch(`${API_URL}/websites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(website),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create website');
  }

  return response.json();
};

export const updateWebsite = async (
  id: number,
  website: WebsiteUpdate,
  token: string
): Promise<Website> => {
  const response = await fetch(`${API_URL}/websites/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(website),
  });

  if (!response.ok) {
    throw new Error('Failed to update website');
  }

  return response.json();
};

export const deleteWebsite = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/websites/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete website');
  }
};

export const startWebsite = async (id: number, token: string): Promise<Website> => {
  const response = await fetch(`${API_URL}/websites/${id}/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to start website');
  }

  return response.json();
};

export const stopWebsite = async (id: number, token: string): Promise<Website> => {
  const response = await fetch(`${API_URL}/websites/${id}/stop`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to stop website');
  }

  return response.json();
};

export const redeployWebsite = async (id: number, token: string): Promise<Website> => {
  const response = await fetch(`${API_URL}/websites/${id}/redeploy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to redeploy website');
  }

  return response.json();
};

// Admin routes
export const adminGetAllWebsites = async (token: string): Promise<Website[]> => {
  const response = await fetch(`${API_URL}/admin/websites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all websites');
  }

  return response.json();
};

export const adminUpdateWebsite = async (
  id: number,
  website: WebsiteUpdate,
  token: string
): Promise<Website> => {
  const response = await fetch(`${API_URL}/admin/websites/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(website),
  });

  if (!response.ok) {
    throw new Error('Failed to update website as admin');
  }

  return response.json();
};

export const adminDeleteWebsite = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/websites/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete website as admin');
  }
};

export const adminStartWebsite = async (id: number, token: string): Promise<Website> => {
  const response = await fetch(`${API_URL}/admin/websites/${id}/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to start website as admin');
  }

  return response.json();
};

export const adminStopWebsite = async (id: number, token: string): Promise<Website> => {
  const response = await fetch(`${API_URL}/admin/websites/${id}/stop`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to stop website as admin');
  }

  return response.json();
};