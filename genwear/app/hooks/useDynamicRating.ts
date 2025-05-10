import { useState, useEffect } from 'react';

interface RatingData {
  averageRating: number;
  reviewCount: number;
}

export default function useDynamicRating(productId: string, initialRating: number, initialReviewCount: number) {
  const [rating, setRating] = useState<number>(initialRating);
  const [reviewCount, setReviewCount] = useState<number>(initialReviewCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRating = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/reviews/rating?productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.rating) {
            setRating(data.rating.averageRating);
            setReviewCount(data.rating.reviewCount);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product rating:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [productId]);

  return { rating, reviewCount, isLoading };
} 