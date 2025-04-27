// src/types/website.ts
export enum WebsiteStatus {
  RUNNING = "running",
  STOPPED = "stopped",
  DEPLOYING = "deploying",
  ERROR = "error"
}

export interface Website {
  id: number;
  name: string;
  status: WebsiteStatus;
  git_repo: string;
  url: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface WebsiteCreate {
  name: string;
  git_repo: string;
}

export interface WebsiteUpdate {
  name?: string;
  git_repo?: string;
}