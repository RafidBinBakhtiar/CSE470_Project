import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { Review, mapReviewToResponse } from '@/models/Review';

// GET /api/reviews?productId=xxx
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
    const reviews = await db.collection('reviews')
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();

    const mappedReviews = reviews.map(review => mapReviewToResponse(review as Review));

    return NextResponse.json({ reviews: mappedReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const userData = await verifyToken(token);
    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const data = await request.json();
    
    // Validate required fields
    if (!data.productId || !data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { error: 'Product ID and valid rating (1-5) are required' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await db.collection('reviews').findOne({
      productId: data.productId,
      userId: userData.id
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create new review
    const review: Review = {
      productId: data.productId,
      userId: userData.id,
      userName: userData.name,
      rating: data.rating,
      comment: data.comment || '',
      createdAt: new Date()
    };

    await db.collection('reviews').insertOne(review);

    // Update product's average rating
    const allReviews = await db.collection('reviews')
      .find({ productId: data.productId })
      .toArray();
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    // Update the product in the database with the new average rating
    // Note: This assumes we'll eventually move the products to the database
    // For now we'll store the ratings separately
    await db.collection('productRatings').updateOne(
      { productId: data.productId },
      { 
        $set: { 
          averageRating: parseFloat(averageRating.toFixed(1)),
          reviewCount: allReviews.length
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      review: mapReviewToResponse(review),
      newRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: allReviews.length
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 