import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// MongoDB connection
const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// JWT secret for token verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
};

// GET user's cart
export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    // Get user's cart
    const user = await db.collection('users').findOne(
      { email: decoded.email },
      { projection: { cart: 1 } }
    );

    await client.close();

    return NextResponse.json({ cart: user?.cart || [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { message: 'Error fetching cart' },
      { status: 500 }
    );
  }
}

// POST add item to cart
export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const itemData = await request.json();

    // Validate required fields
    if (!itemData.productId || !itemData.quantity || !itemData.size || !itemData.color) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    // Add item to user's cart
    const result = await db.collection('users').updateOne(
      { email: decoded.email },
      { 
        $push: { 
          cart: {
            ...itemData,
            productId: new ObjectId(itemData.productId),
            addedAt: new Date()
          }
        }
      }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Item added to cart successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { message: 'Error adding item to cart' },
      { status: 500 }
    );
  }
}

// PUT update user's cart
export async function PUT(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { cart } = await request.json();

    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    // Update user's cart
    const result = await db.collection('users').updateOne(
      { email: decoded.email },
      { $set: { cart } }
    );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Cart updated successfully' }
    );
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { message: 'Error updating cart' },
      { status: 500 }
    );
  }
}

// DELETE remove item from cart
export async function DELETE(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { message: 'Missing item ID' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    // Get current cart
    const user = await db.collection('users').findOne(
      { email: decoded.email },
      { projection: { cart: 1 } }
    );

    if (!user) {
      await client.close();
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Filter out the item to remove
    const updatedCart = (user.cart || []).filter(
      (item: any) => item.id !== itemId
    );

    // Update user's cart
    const result = await db.collection('users').updateOne(
      { email: decoded.email },
      { $set: { cart: updatedCart } }
    );

    await client.close();

    return NextResponse.json(
      { message: 'Item removed from cart successfully' }
    );
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json(
      { message: 'Error removing item from cart' },
      { status: 500 }
    );
  }
} 