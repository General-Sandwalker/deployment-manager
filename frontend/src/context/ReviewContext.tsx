// src/context/ReviewContext.tsx
'use client';

import { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Review, ReviewCreate, ReviewUpdate } from '@/types';
import { useAuth } from './AuthContext';
import {
  createReview as createReviewService,
  getUserReviews,
  getAllReviews,
  getReview as getReviewService,
  updateReview as updateReviewService,
  deleteReview as deleteReviewService,
  adminGetAllReviews,
  adminUpdateReview,
  adminDeleteReview as adminDeleteReviewService
} from '@/services/reviews';

interface ReviewContextProps {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  fetchAllReviews: () => Promise<void>;
  getReview: (id: number) => Promise<Review>;
  createReview: (review: ReviewCreate) => Promise<Review>;
  updateReview: (id: number, updates: ReviewUpdate) => Promise<Review>;
  deleteReview: (id: number) => Promise<void>;
  adminGetReviews: (websiteId?: number, userId?: number) => Promise<void>;
  adminUpdateReview: (id: number, updates: ReviewUpdate) => Promise<Review>;
  adminDeleteReview: (id: number) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextProps>({
  reviews: [],
  isLoading: false,
  error: null,
  fetchReviews: async () => {},
  fetchAllReviews: async () => {},
  getReview: async () => ({ id: 0 } as Review),
  createReview: async () => ({ id: 0 } as Review),
  updateReview: async () => ({ id: 0 } as Review),
  deleteReview: async () => {},
  adminGetReviews: async () => {},
  adminUpdateReview: async () => ({ id: 0 } as Review),
  adminDeleteReview: async () => {},
});

export const useReviews = () => useContext(ReviewContext);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAdmin } = useAuth();

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserReviews(token);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAllReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReview = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      return await getReviewService(id, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createReview = useCallback(async (reviewData: ReviewCreate) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const review = await createReviewService(reviewData, token);
      setReviews(prev => [...prev, review]);
      return review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateReview = useCallback(async (id: number, updates: ReviewUpdate) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const review = await updateReviewService(id, updates, token);
      setReviews(prev => prev.map(r => r.id === id ? review : r));
      return review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const deleteReview = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      await deleteReviewService(id, token);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const adminGetReviews = useCallback(async (websiteId?: number, userId?: number) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminGetAllReviews(token, 0, 100, websiteId, userId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin]);

  const adminUpdateReviewHandler = useCallback(async (id: number, updates: ReviewUpdate) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      const review = await adminUpdateReview(id, updates, token);
      setReviews(prev => prev.map(r => r.id === id ? review : r));
      return review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin]);

  const adminDeleteReview = useCallback(async (id: number) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      await adminDeleteReviewService(id, token);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin]);

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        isLoading,
        error,
        fetchReviews,
        fetchAllReviews,
        getReview,
        createReview,
        updateReview,
        deleteReview,
        adminGetReviews,
        adminUpdateReview: adminUpdateReviewHandler,
        adminDeleteReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};