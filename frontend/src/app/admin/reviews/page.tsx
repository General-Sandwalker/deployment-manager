/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useReviews } from '@/context/ReviewContext';
import ReviewCard from '@/components/shared/ReviewCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Search, Filter, UserCheck } from 'lucide-react';
import { Review } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ReviewsAdminPage() {
  const { reviews, isLoading, adminGetReviews, adminDeleteReview } = useReviews();
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [websiteFilter, setWebsiteFilter] = useState<number | undefined>(undefined);
  const [userFilter, setUserFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    const loadReviews = async () => {
      await adminGetReviews(websiteFilter, userFilter);
    };
    
    loadReviews();
  }, [adminGetReviews, websiteFilter, userFilter]);

  useEffect(() => {
    if (reviews.length > 0) {
      let filtered = [...reviews];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(review => 
          review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (review.user?.email && review.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (review.user?.full_name && review.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (review.website?.name && review.website.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'highest':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest':
          filtered.sort((a, b) => a.rating - b.rating);
          break;
      }
      
      setFilteredReviews(filtered);
    } else {
      setFilteredReviews([]);
    }
  }, [reviews, searchTerm, sortBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteReview = async (id: number) => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await adminDeleteReview(id);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const clearFilters = () => {
    setWebsiteFilter(undefined);
    setUserFilter(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="text-[var(--cosmic-highlight)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Review Management</h1>
        <span className="text-sm text-[var(--text-secondary)]">
          Total Reviews: {reviews.length}
        </span>
      </div>

      {/* Active Filters */}
      {(websiteFilter !== undefined || userFilter !== undefined) && (
        <div className="bg-cosmic-accent/20 p-3 rounded-md flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">Active Filters:</span>
            {websiteFilter && <span className="ml-2">Website ID: {websiteFilter}</span>}
            {userFilter && <span className="ml-2">User ID: {userFilter}</span>}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            className="text-cosmic-highlight hover:bg-cosmic-light"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <Input
            placeholder="Search by content, user or website..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-[var(--cosmic-accent)] text-[var(--text-primary)]">
              <Filter className="mr-2 h-4 w-4" />
              Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[var(--cosmic-blue)] border-[var(--cosmic-accent)]">
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as never)}>
              <DropdownMenuRadioItem value="newest" className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">Newest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest" className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">Oldest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="highest" className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">Highest Rating</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="lowest" className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)]">Lowest Rating</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results count */}
      <div className="text-sm text-[var(--text-secondary)]">
        {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onDelete={() => handleDeleteReview(review.id)}
              isAdminView={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <p>No reviews found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}