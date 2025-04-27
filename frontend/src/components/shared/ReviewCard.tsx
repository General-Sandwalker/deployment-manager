/* eslint-disable @next/next/no-img-element */
import { Review, User, Website } from '@/types';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

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
  const { toast } = useToast();
  const isCurrentUserReview = user?.id === review.user_id;
  const isAdmin = user?.is_admin || false;

  const handleDelete = () => {
    if (onDelete) {
      try {
        onDelete();
        toast({
          title: "Success",
          description: "Review deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete review",
          variant: "destructive"
        });
      }
    }
  };

  const getUserName = (): string => {
    if (review.user) {
      return review.user.full_name || review.user.email || 'Anonymous';
    }
    return 'Anonymous';
  };

  const getUserInitial = (): string => {
    if (review.user?.full_name) {
      return review.user.full_name.charAt(0).toUpperCase();
    }
    if (review.user?.email) {
      return review.user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <div className="bg-cosmic-blue rounded-xl p-6 border border-cosmic-accent hover:border-cosmic-highlight transition-colors">
      {/* Website Title */}
      {review.website && (
        <div className="mb-2">
          <Badge variant="outline" className="bg-cosmic-light border-cosmic-highlight text-cosmic-highlight">
            {review.website.name}
          </Badge>
        </div>
      )}
      
      {/* Rating Stars */}
      <div className="flex items-center mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i}
            className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-white">{review.content}</p>
      
      {/* User Info and Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 bg-cosmic-accent">
            {review.user?.avatar ? (
              <AvatarImage src={review.user.avatar} alt="User Avatar" />
            ) : (
              <AvatarFallback className="bg-gray-500 text-white">
                {getUserInitial()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {getUserName()}
            </p>
            <p className="text-xs text-cosmic-highlight">
              {review.created_at ? formatDate(review.created_at) : 'Unknown date'}
            </p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            {(isCurrentUserReview || isAdmin) && (
              <>
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onEdit}
                    className="bg-transparent hover:bg-cosmic-accent text-white"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDelete}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Admin information */}
      {isAdminView && (
        <div className="mt-3 pt-3 border-t border-cosmic-accent text-xs text-cosmic-highlight">
          <p>Review ID: {review.id}</p>
          {review.website && <p>Website: {review.website.name} (ID: {review.website.id})</p>}
          <p>User ID: {review.user_id}</p>
          <p>Created: {review.created_at ? formatDate(review.created_at) : 'Unknown'}</p>
          {review.updated_at && <p>Last Updated: {formatDate(review.updated_at)}</p>}
        </div>
      )}
    </div>
  );
}