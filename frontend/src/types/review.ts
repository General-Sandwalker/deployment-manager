// src/types/review.ts
export interface Review {
  id: number;
  content: string;
  rating: number;
  user_id: number;
  website_id: number;
  created_at: string;
  updated_at?: string;
  user_email?: string;
  user_full_name?: string;
  website_name?: string;
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