'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ReviewFormProps {
  onSubmit: (data: { content: string; rating: number }) => Promise<void>;
  initialData?: { content: string; rating: number };
  buttonText?: string;
}

export default function ReviewForm({ 
  onSubmit, 
  initialData = { content: '', rating: 5 },
  buttonText = 'Submit Review'
}: ReviewFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ content: '', rating: 5 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cosmic-blue rounded-xl p-6 border border-cosmic-accent">
      <h3 className="text-lg font-semibold mb-4 text-white">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="focus:outline-none"
            >
              <Star
                size={24}
                className={`${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
              />
            </button>
          ))}
        </div>
        
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="bg-cosmic-light border-cosmic-accent text-white focus:border-cosmic-highlight"
          rows={4}
          placeholder="Share your experience..."
          required
        />
        
        <Button
          type="submit"
          className="bg-cosmic-highlight hover:bg-cosmic-highlight/90 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : buttonText}
        </Button>
      </form>
    </div>
  );
}