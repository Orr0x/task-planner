import express from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Format user data consistently
const formatUserResponse = (user: any, token?: string) => ({
  success: true,
  data: {
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
    ...(token && { token }),
  },
});

// Register new user
const register = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    console.log('Registering user:', req.body);
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      fullName,
    });

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('User registered successfully:', user._id);
    res.status(201).json(formatUserResponse(user, token));
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register user',
    });
  }
};

// Login user
const login = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    console.log('Login attempt:', req.body.email);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('User logged in successfully:', user._id);
    res.json(formatUserResponse(user, token));
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to login',
    });
  }
};

// Get current user
const getCurrentUser = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    console.log('Getting current user:', req.user?._id);
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      console.log('User not found:', req.user?._id);
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json(formatUserResponse(user));
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user',
    });
  }
};

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getCurrentUser);

export default router;