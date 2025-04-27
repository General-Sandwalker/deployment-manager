/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useReviews } from '@/context/ReviewContext';
import { useAuth } from '@/context/AuthContext';
import ReviewCard from '@/components/shared/ReviewCard';
import ReviewForm from '@/components/shared/ReviewForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Review } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WebsiteStatus } from '@/types';
import { useWebsites } from '@/context/WebsiteContext';

export default function UserReviewsPage() {
  const { user } = useAuth();
  const { reviews, isLoading, fetchReviews, createReview, updateReview, deleteReview } = useReviews();
  const { websites, fetchWebsites } = useWebsites();
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchWebsites();
  }, [fetchReviews, fetchWebsites]);

  useEffect(() => {
    if (reviews.length > 0) {
      let filtered = [...reviews];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(review => 
          review.content.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleCreateReview = async (data: { content: string; rating: number }) => {
    if (!selectedWebsiteId) return;
    
    try {
      await createReview({
        ...data,
        website_id: selectedWebsiteId
      });
      setIsCreateModalOpen(false);
      setSelectedWebsiteId(null);
    } catch (error) {
      console.error('Failed to create review:', error);
    }
  };

  const handleEditReview = (review: Review) => {
    setCurrentReview(review);
    setIsEditModalOpen(true);
  };

  const handleUpdateReview = async (data: { content: string; rating: number }) => {
    if (!currentReview) return;
    
    try {
      await updateReview(currentReview.id, data);
      setIsEditModalOpen(false);
      setCurrentReview(null);
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(id);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const activeWebsites = websites.filter(w => w.status === WebsiteStatus.RUNNING);

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
        <h1 className="text-2xl font-bold">My Reviews</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
              <Plus className="mr-2 h-4 w-4" />
              New Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Review</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Select Website to Review
              </label>
              {activeWebsites.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeWebsites.map(website => (
                    <div 
                      key={website.id}
                      onClick={() => setSelectedWebsiteId(website.id)}
                      className={`p-3 rounded cursor-pointer ${
                        selectedWebsiteId === website.id 
                          ? 'bg-[var(--cosmic-highlight)] text-white' 
                          : 'bg-[var(--cosmic-light)] text-[var(--text-primary)] hover:bg-[var(--cosmic-light)]/70'
                      }`}
                    >
                      {website.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-secondary)]">
                  No active websites found. Please deploy a website first.
                </p>
              )}
            </div>
            
            {selectedWebsiteId && (
              <ReviewForm 
                onSubmit={handleCreateReview}
                buttonText="Submit Review"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <Input
            placeholder="Search in your reviews..."
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

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onEdit={() => handleEditReview(review)}
              onDelete={() => handleDeleteReview(review.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <p>You haven&apos;t written any reviews yet.</p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Write Your First Review
          </Button>
        </div>
      )}

      {/* Edit Review Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          
          {currentReview && (
            <ReviewForm 
              onSubmit={handleUpdateReview}
              initialData={{
                content: currentReview.content,
                rating: currentReview.rating
              }}
              buttonText="Update Review"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}