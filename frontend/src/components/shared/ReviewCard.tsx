/* eslint-disable @next/next/no-img-element */
import { Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Edit } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isAdminView?: boolean;
}

export default function ReviewCard({ 
  review, 
  onEdit, 
  onDelete, 
  showActions = true,
  isAdminView = false
}: ReviewCardProps) {
  const { user } = useAuth();
  const isCurrentUserReview = user?.id === review.user_id;
  const isAdmin = user?.is_admin || false;
  
  const renderStars = () => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={18}
        className={`${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
      />
    ));
  };

  return (
    <div className="bg-cosmic-blue rounded-xl p-6 border border-cosmic-accent hover:border-cosmic-highlight transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="flex">{renderStars()}</div>
          <p className="text-white">{review.content}</p>
          {review.website_id && (
            <Badge variant="secondary" className="bg-cosmic-light text-cosmic-highlight">
              Website ID: {review.website_id}
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="border-cosmic-accent text-cosmic-highlight">
          {new Date(review.created_at).toLocaleDateString()}
        </Badge>
      </div>
      
      {review.user && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-cosmic-accent">
              {review.user.avatar ? (
                <img src={review.user.avatar as string} alt="User Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="bg-gray-500 text-white flex items-center justify-center h-full w-full">
                  {review.user.email.charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {review.user.full_name || review.user.email}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              {/* Show edit button only if current user is the author and not in admin view */}
              {onEdit && isCurrentUserReview && !isAdminView && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onEdit}
                  className="text-cosmic-highlight hover:bg-cosmic-light"
                >
                  <Edit size={16} />
                </Button>
              )}
              {/* Show delete button for admin or if current user is the author */}
              {onDelete && (isCurrentUserReview || (isAdmin && isAdminView)) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDelete}
                  className="text-danger hover:bg-cosmic-light"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}