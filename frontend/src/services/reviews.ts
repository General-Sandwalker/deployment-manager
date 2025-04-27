// src/services/reviews.ts
import { Review, ReviewCreate, ReviewUpdate } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Public routes
export const getAllReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_URL}/reviews/public/all`);

  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }

  return response.json();
};

// User routes
export const getUserReviews = async (token: string): Promise<Review[]> => {
  const response = await fetch(`${API_URL}/reviews/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user reviews');
  }

  return response.json();
};

export const getReview = async (id: number, token: string): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch review');
  }

  return response.json();
};

export const createReview = async (review: ReviewCreate, token: string): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create review');
  }

  return response.json();
};

export const updateReview = async (
  id: number,
  review: ReviewUpdate,
  token: string
): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    throw new Error('Failed to update review');
  }

  return response.json();
};

export const deleteReview = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete review');
  }
};

// Admin routes
export const adminGetAllReviews = async (
  token: string, 
  skip: number = 0, 
  limit: number = 100,
  websiteId?: number,
  userId?: number
): Promise<Review[]> => {
  let url = `${API_URL}/admin/reviews?skip=${skip}&limit=${limit}`;
  
  if (websiteId) {
    url += `&website_id=${websiteId}`;
  }
  
  if (userId) {
    url += `&user_id=${userId}`;
  }
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all reviews');
  }

  return response.json();
};

export const adminUpdateReview = async (
  id: number,
  review: ReviewUpdate,
  token: string
): Promise<Review> => {
  const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    throw new Error('Failed to update review as admin');
  }

  return response.json();
};

export const adminDeleteReview = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete review as admin');
  }
};