// src/types/api.ts

/**
 * Standard API error response format
 */
export interface ApiError {
  detail?: string | Record<string, string[]>;
  message?: string;
  status_code?: number;
  code?: string;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
}

/**
 * Standard paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * WebSocket message types
 */
export type WsMessageType = 
  | 'STATUS_UPDATE' 
  | 'DEPLOYMENT_LOG' 
  | 'ERROR' 
  | 'HEARTBEAT';

/**
 * WebSocket message format
 */
export interface WsMessage<T = unknown> {
  type: WsMessageType;
  data: T;
  timestamp: string;
}

/**
 * Website status update payload
 */
export interface WsStatusUpdate {
  websiteId: number;
  status: string;
  message?: string;
}

/**
 * Deployment log payload
 */
export interface WsDeploymentLog {
  websiteId: number;
  log: string;
  level: 'INFO' | 'WARN' | 'ERROR';
}