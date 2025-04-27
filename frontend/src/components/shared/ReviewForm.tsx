'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  initialData?: {
    content: string;
    rating: number;
  };
  onSubmit: (data: { content: string; rating: number }) => Promise<void>;
  buttonText?: string;
}

export default function ReviewForm({
  initialData = { content: '', rating: 0 },
  onSubmit,
  buttonText = 'Submit'
}: ReviewFormProps) {
  const [content, setContent] = useState(initialData.content);
  const [rating, setRating] = useState(initialData.rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ content, rating });
      // Form submission was successful
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium text-[var(--text-primary)]">Rating</div>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-7 w-7 cursor-pointer transition-all ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <div className="mb-2 text-sm font-medium text-[var(--text-primary)]">Review</div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your review here..."
          className="min-h-[150px] bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
          required
        />
      </div>
      
      <Button
        type="submit"
        disabled={isSubmitting || !content || rating === 0}
        className="w-full bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
      >
        {isSubmitting ? 'Submitting...' : buttonText}
      </Button>
    </form>
  );
}