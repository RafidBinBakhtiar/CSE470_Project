import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

interface RatingData {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

interface RatingsMap {
  [key: string]: {
    averageRating: number;
    reviewCount: number;
  };
}

// GET /api/reviews/ratings?productIds=id1,id2,id3
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIdsParam = searchParams.get('productIds');

    if (!productIdsParam) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    const productIds = productIdsParam.split(',');
    const { db } = await connectToDatabase();
    
    // Get ratings for all requested products
    const ratings = await db.collection('productRatings')
      .find({ productId: { $in: productIds } })
      .toArray();
    
    // Convert to a map of productId -> rating data
    const ratingsMap = ratings.reduce<RatingsMap>((acc, rating) => {
      acc[rating.productId] = {
        averageRating: rating.averageRating,
        reviewCount: rating.reviewCount
      };
      return acc;
    }, {});
    
    return NextResponse.json({ ratings: ratingsMap });
  } catch (error) {
    console.error('Error fetching product ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product ratings' },
      { status: 500 }
    );
  }
} 