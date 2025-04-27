// src/types/website.ts
import { User } from './user';

export enum WebsiteStatus {
  RUNNING = "running",
  STOPPED = "stopped",
  DEPLOYING = "deploying",
  ERROR = "error"
}

export interface Website {
  id: number;
  name: string;
  git_repo: string;
  status: WebsiteStatus;
  user_id: number;
  port?: number;
  url?: string;
  custom_domain?: string;
  owner?: User;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
}

export interface WebsiteCreate {
  name: string;
  git_repo: string;
}

export interface WebsiteUpdate {
  name?: string;
  git_repo?: string;
  custom_domain?: string;
}