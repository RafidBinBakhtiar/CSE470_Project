import { ObjectId } from 'mongodb';

export interface Review {
  _id?: ObjectId;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ReviewInput {
  productId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export function mapReviewToResponse(review: Review): ReviewResponse {
  return {
    id: review._id?.toString() || '',
    productId: review.productId,
    userId: review.userId,
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
} 