'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  initialRating: number;
  initialReviewCount: number;
  onRatingUpdate?: (newRating: number, newReviewCount: number) => void;
}

export default function ProductReviews({ 
  productId, 
  initialRating, 
  initialReviewCount,
  onRatingUpdate 
}: ProductReviewsProps) {
  const { user, isAuthenticated, token } = useUser();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?productId=${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews);
      
      // Check if current user has already reviewed
      if (isAuthenticated && user) {
        const userReview = data.reviews.find((review: Review) => review.userId === user.id);
        setUserHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    if (userRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating: userRating,
          comment,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }
      
      // Update reviews list with new review
      setReviews([data.review, ...reviews]);
      setUserHasReviewed(true);
      setUserRating(0);
      setComment('');
      
      // Update parent component with new rating
      if (onRatingUpdate) {
        onRatingUpdate(data.newRating, data.reviewCount);
      }
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
      
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400 mr-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(initialRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
        </div>
        <span className="text-lg font-medium">
          {initialRating.toFixed(1)} out of 5
        </span>
        <span className="text-sm text-gray-500 ml-2">
          ({initialReviewCount} {initialReviewCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>
      
      {isAuthenticated && !userHasReviewed && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex text-gray-300">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 cursor-pointer ${
                      i < (hoverRating || userRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : ''
                    }`}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(i + 1)}
                  />
                ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full"
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleSubmitReview} 
            disabled={submitting || userRating === 0}
            className="w-full md:w-auto"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 flex flex-col items-center justify-center text-center">
          <MessageSquare className="w-10 h-10 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium mb-2">Want to share your opinion?</h3>
          <p className="text-gray-500 mb-4">Log in to leave a review for this product</p>
          <Button asChild variant="outline">
            <a href="/login">Log In</a>
          </Button>
        </div>
      )}
      
      {isAuthenticated && userHasReviewed && (
        <div className="bg-green-50 p-4 rounded-lg mb-8 text-center">
          <p className="text-green-700">Thank you for reviewing this product!</p>
        </div>
      )}
      
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{review.userName}</h4>
                  <div className="flex text-yellow-400 my-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
              </div>
              {review.comment && (
                <p className="mt-2 text-gray-600">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 