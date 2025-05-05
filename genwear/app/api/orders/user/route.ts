import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token and get user
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Get user with orders array
    const userWithOrders = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { orders: 1 } }
    );

    // If user has no orders array, return empty array
    if (!userWithOrders?.orders) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Fetch orders using the order IDs from user document
    const orders = await db.collection('orders')
      .find({ _id: { $in: userWithOrders.orders } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
} 