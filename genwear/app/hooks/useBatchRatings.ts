import { useState, useEffect, useRef, useCallback } from 'react';

interface RatingMap {
  [productId: string]: {
    averageRating: number;
    reviewCount: number;
  };
}

// Simple cache to prevent redundant API calls
const ratingsCache: RatingMap = {};

export default function useBatchRatings(productIds: string[]) {
  const [ratingsMap, setRatingsMap] = useState<RatingMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check which productIds are not in cache
  const fetchRatings = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    
    // Filter out ids that are already in cache
    const uncachedIds = ids.filter(id => !ratingsCache[id]);
    
    if (!uncachedIds.length) {
      // All requested ratings are cached, use the cache
      const cachedData = ids.reduce<RatingMap>((acc, id) => {
        if (ratingsCache[id]) {
          acc[id] = ratingsCache[id];
        }
        return acc;
      }, {});
      
      setRatingsMap(prev => ({ ...prev, ...cachedData }));
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews/ratings?productIds=${uncachedIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        if (data.ratings) {
          // Update cache with new data
          Object.entries(data.ratings).forEach(([id, rating]) => {
            ratingsCache[id] = rating as any;
          });
          
          // Use both cached and new data
          const completeData = ids.reduce<RatingMap>((acc, id) => {
            if (ratingsCache[id]) {
              acc[id] = ratingsCache[id];
            }
            return acc;
          }, {});
          
          setRatingsMap(prev => ({ ...prev, ...completeData }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch product ratings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clean up previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce API call to prevent excessive requests when component re-renders quickly
    timeoutRef.current = setTimeout(() => {
      fetchRatings(productIds);
    }, 100);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [productIds, fetchRatings]);

  const getRating = useCallback((productId: string) => {
    if (ratingsMap[productId]) {
      return {
        rating: ratingsMap[productId].averageRating,
        reviewCount: ratingsMap[productId].reviewCount
      };
    }
    return null;
  }, [ratingsMap]);

  return { ratingsMap, getRating, isLoading };
} 