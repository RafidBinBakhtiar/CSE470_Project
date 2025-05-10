import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/reviews/rating?productId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Get the product rating from the database
    const rating = await db.collection('productRatings').findOne({ productId });
    
    return NextResponse.json({ rating });
  } catch (error) {
    console.error('Error fetching product rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product rating' },
      { status: 500 }
    );
  }
} 