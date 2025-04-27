// src/services/api.ts
import { ApiError, WsMessage } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to create headers
const createHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Enhanced response handler
const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorData: ApiError = {};

    try {
      errorData = isJson ? await response.json() : {};
    } catch (e) {
      console.error('Failed to parse error response', e);
    }

    const errorMessage = 
      typeof errorData.detail === 'string' ? errorData.detail :
      typeof errorData.detail === 'object' ? Object.values(errorData.detail).flat().join(', ') :
      errorData.message || response.statusText;

    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return isJson ? response.json() : response.text() as unknown as T;
};

/**
 * GET request
 */
export const apiGet = async <T>(
  endpoint: string,
  token?: string,
  options?: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: { ...createHeaders(token), ...options?.headers },
    signal: options?.signal,
  });

  return handleResponse<T>(response);
};

/**
 * POST request
 */
export const apiPost = async <T>(
  endpoint: string,
  data: unknown,
  token?: string,
  options?: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { ...createHeaders(token), ...options?.headers },
    body: JSON.stringify(data),
    signal: options?.signal,
  });

  return handleResponse<T>(response);
};

/**
 * PUT request
 */
export const apiPut = async <T>(
  endpoint: string,
  data: unknown,
  token?: string,
  options?: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: { ...createHeaders(token), ...options?.headers },
    body: JSON.stringify(data),
    signal: options?.signal,
  });

  return handleResponse<T>(response);
};

/**
 * PATCH request
 */
export const apiPatch = async <T>(
  endpoint: string,
  data: unknown,
  token?: string,
  options?: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: { ...createHeaders(token), ...options?.headers },
    body: JSON.stringify(data),
    signal: options?.signal,
  });

  return handleResponse<T>(response);
};

/**
 * DELETE request
 */
export const apiDelete = async (
  endpoint: string,
  token?: string,
  options?: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
  }
): Promise<void> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: { ...createHeaders(token), ...options?.headers },
    signal: options?.signal,
  });

  await handleResponse<void>(response);
};

/**
 * FormData POST request (for file uploads)
 */
export const apiUpload = async <T>(
  endpoint: string,
  formData: FormData,
  token?: string,
  options?: {
    signal?: AbortSignal;
    onProgress?: (progress: number) => void;
  }
): Promise<T> => {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
    signal: options?.signal,
  });

  return handleResponse<T>(response);
};

/**
 * WebSocket connection helper
 */
export const createWebSocket = (
  endpoint: string,
  token: string,
  handlers: {
    onMessage: (message: WsMessage) => void;
    onError?: (error: Event) => void;
    onClose?: (event: CloseEvent) => void;
  }
): WebSocket => {
  const wsUrl = `${API_URL.replace(/^http/, 'ws')}${endpoint}?token=${token}`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data) as WsMessage;
      handlers.onMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message', error);
    }
  };

  ws.onerror = handlers.onError || null;
  ws.onclose = handlers.onClose || null;

  return ws;
};