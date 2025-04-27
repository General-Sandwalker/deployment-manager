// src/context/ReviewContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Review, ReviewCreate, ReviewUpdate } from '@/types';
import { 
  createReview as createReviewService,
  getUserReviews,
  getReview as getReviewService,
  updateReview as updateReviewService,
  deleteReview as deleteReviewService,
  getAllReviews
} from '@/services/reviews';
import { useAuth } from './AuthContext';

interface ReviewContextType {
  reviews: Review[];
  currentReview: Review | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  createReview: (data: ReviewCreate) => Promise<Review>;
  fetchReviews: () => Promise<void>;
  fetchAllReviews: () => Promise<void>;
  getReview: (id: number) => Promise<Review>;
  updateReview: (id: number, data: ReviewUpdate) => Promise<Review>;
  deleteReview: (id: number) => Promise<void>;
  adminDeleteReview: (id: number) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const isAdmin = user?.is_admin || false;

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
    if (!token || !isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllReviews(token);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all reviews');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin]);

  const createReview = useCallback(async (data: ReviewCreate) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const newReview = await createReviewService(data, token);
      setReviews(prev => [...prev, newReview]);
      return newReview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const getReview = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const review = await getReviewService(id, token);
      setCurrentReview(review);
      return review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateReview = useCallback(async (id: number, data: ReviewUpdate) => {
    if (!token) throw new Error('Not authenticated');
    // Regular users can only update their own reviews
    if (!isAdmin && currentReview?.user_id !== user?.id) {
      throw new Error('Not authorized to update this review');
    }
    setIsLoading(true);
    setError(null);
    try {
      const updatedReview = await updateReviewService(id, data, token);
      setReviews(prev => prev.map(r => r.id === id ? updatedReview : r));
      if (currentReview?.id === id) {
        setCurrentReview(updatedReview);
      }
      return updatedReview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, currentReview, isAdmin, user?.id]);

  const deleteReview = useCallback(async (id: number) => {
    if (!token) throw new Error('Not authenticated');
    // Regular users can only delete their own reviews
    if (!isAdmin && reviews.find(r => r.id === id)?.user_id !== user?.id) {
      throw new Error('Not authorized to delete this review');
    }
    setIsLoading(true);
    setError(null);
    try {
      await deleteReviewService(id, token);
      setReviews(prev => prev.filter(r => r.id !== id));
      if (currentReview?.id === id) {
        setCurrentReview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, currentReview, reviews, isAdmin, user?.id]);

  const adminDeleteReview = useCallback(async (id: number) => {
    if (!token || !isAdmin) throw new Error('Not authorized');
    setIsLoading(true);
    setError(null);
    try {
      await deleteReviewService(id, token);
      setReviews(prev => prev.filter(r => r.id !== id));
      if (currentReview?.id === id) {
        setCurrentReview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, isAdmin, currentReview]);

  return (
    <ReviewContext.Provider value={{
      reviews,
      currentReview,
      isLoading,
      error,
      isAdmin,
      createReview,
      fetchReviews,
      fetchAllReviews,
      getReview,
      updateReview,
      deleteReview,
      adminDeleteReview
    }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};