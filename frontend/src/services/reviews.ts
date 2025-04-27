// src/services/reviews.ts
import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import { Review, ReviewCreate, ReviewUpdate } from "@/types";

export const createReview = async (
  review: ReviewCreate,
  token: string
): Promise<Review> => {
  return apiPost<Review>('/reviews/', review, token);
};

export const getUserReviews = async (
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<Review[]> => {
  return apiGet<Review[]>(`/reviews/?skip=${skip}&limit=${limit}`, token);
};

export const getAllReviews = async (
  token: string,
  skip: number = 0,
  limit: number = 100
): Promise<Review[]> => {
  return apiGet<Review[]>(`/reviews/all/?skip=${skip}&limit=${limit}`, token);
};

export const getReview = async (
  reviewId: number,
  token: string
): Promise<Review> => {
  return apiGet<Review>(`/reviews/${reviewId}`, token);
};

export const updateReview = async (
  reviewId: number,
  updates: ReviewUpdate,
  token: string
): Promise<Review> => {
  return apiPut<Review>(`/reviews/${reviewId}`, updates, token);
};

export const deleteReview = async (
  reviewId: number,
  token: string
): Promise<void> => {
  return apiDelete(`/reviews/${reviewId}`, token);
};