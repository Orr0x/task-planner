import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    token?: string;
  }
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header and verify format
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Invalid token format:', authHeader);
      throw new Error('Invalid token format');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      throw new Error('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      _id: string;
    };

    console.log('Decoded token:', decoded);

    // Find user
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      console.log('User not found for id:', decoded._id);
      throw new Error('User not found');
    }

    // Add user and token to request
    req.user = user;
    req.token = token;

    console.log('Auth successful for user:', user._id);
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      error: 'Please authenticate',
    });
  }
};