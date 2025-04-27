// src/types/website.ts
import { User } from "./user";

export enum WebsiteStatus {
  STOPPED = "stopped",
  RUNNING = "running",
  DEPLOYING = "deploying",
  ERROR = "error"
}

export interface Website {
  id: number;
  name: string;
  domain: string | null;
  git_repo: string;
  port: number;
  status: WebsiteStatus;
  user_id: number;
  created_at: string;
  expires_at: string | null;
  pid: number | null;
  deployment_log: string | null;
  owner?: User;
}

export interface WebsiteCreate {
  name: string;
  git_repo: string;
  domain?: string | null;
  port?: number;
  user_id?: number;
}

export interface WebsiteUpdate {
  name?: string;
  domain?: string | null;
  git_repo?: string;
  status?: WebsiteStatus;
  expires_at?: string | null;
  pid?: number | null;
  deployment_log?: string | null;
}

export interface WebsitePagination {
  skip: number;
  limit: number;
  total: number;
}

export interface WebsiteStatusUpdate {
  websiteId: number;
  status: WebsiteStatus;
}

export interface WebsiteSocketMessage {
  type: 'STATUS_UPDATE' | 'DEPLOYMENT_LOG';
  data: WebsiteStatusUpdate | string;
}