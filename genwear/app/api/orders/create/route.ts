import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const { token, items, totalAmount, shippingAddress, paymentMethod } = await req.json();

    // Connect to database
    const { db } = await connectToDatabase();

    // Get the next order number
    const lastOrder = await db.collection('orders')
      .findOne({}, { sort: { orderNumber: -1 } });
    
    // Start from 1001 if no orders exist, or increment the last order number
    const nextOrderNum = lastOrder ? 
      parseInt(lastOrder.orderNumber.replace('GW', '')) + 1 : 
      1001;
    
    const orderNumber = `GW${nextOrderNum}`;

    // Create order object
    const orderData: any = {
      orderNumber,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'card' ? 'PAID' : 'PENDING',
      createdAt: new Date()
    };

    // If token is provided, verify user and add userId
    let userId: ObjectId | null = null;
    if (token) {
      const user = await verifyToken(token);
      if (user) {
        userId = new ObjectId(user.id);
        orderData.userId = userId;
      }
    }

    // Create new order
    const order = await db.collection('orders').insertOne(orderData);

    // If user is authenticated, update user's orders array and points
    if (userId) {
      // Calculate points (1 point per 10 taka spent)
      const pointsEarned = Math.floor(totalAmount / 10);

      // Update user document with new order and points
      await db.collection('users').updateOne(
        { _id: userId },
        { 
          $addToSet: { orders: order.insertedId },
          $inc: { points: pointsEarned }
        }
      );
    }

    return NextResponse.json({ success: true, order: { _id: order.insertedId, orderNumber } });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
} 