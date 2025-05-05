import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const verifyToken = async (token: string) => {
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Connect to database
    const { db } = await connectToDatabase();

    // Find user
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      bio: user.bio,
      phone: user.phone,
      birthdate: user.birthdate,
      shippingAddress: user.shippingAddress,
      points: user.points || 0
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}; 