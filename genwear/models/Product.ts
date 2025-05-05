import { ObjectId } from 'mongodb';

export interface Product {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export function mapProductToResponse(product: Product): ProductResponse {
  return {
    id: product._id?.toString() || '',
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
} 