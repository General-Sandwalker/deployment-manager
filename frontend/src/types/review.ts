// src/types/review.ts
import { User } from "./user";

export interface Review {
  id: number;
  content: string;
  rating: number;
  user_id: number;
  created_at: string;
  user?: User;
  website_id?: number;
}

export interface ReviewCreate {
  content: string;
  rating: number;
  website_id: number;
}

export interface ReviewUpdate {
  content?: string;
  rating?: number;
}