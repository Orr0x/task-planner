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
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    // Check if header exists and has correct format
    if (!authHeader) {
      console.log('No Authorization header found');
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format:', authHeader);
      res.status(401).json({
        success: false,
        error: 'Invalid token format',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token found in Authorization header');
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    // Get JWT secret from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not found in environment variables');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as {
        _id: string;
        iat: number;
        exp: number;
      };

      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.log('Token expired for user:', decoded._id);
        res.status(401).json({
          success: false,
          error: 'Token expired',
        });
        return;
      }

      // Find user
      const user = await User.findById(decoded._id).select('-password');
      if (!user) {
        console.log('User not found for id:', decoded._id);
        res.status(401).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Add user and token to request
      req.user = user;
      req.token = token;

      console.log('Auth successful for user:', user._id);
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.log('JWT verification failed:', error.message);
        res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
        return;
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
    return;
  }
};