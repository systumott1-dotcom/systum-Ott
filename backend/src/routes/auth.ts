import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export const authRouter = Router();

// In-memory fallback users
const inMemoryUsers: Array<{
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'customer' | 'admin';
}> = [
  {
    id: 'admin-default-1',
    name: 'Systum Admin',
    email: 'admin@systumott.in',
    passwordHash: bcrypt.hashSync('admin1234', 10),
    phone: '9306022703',
    role: 'admin',
  },
];

const generateToken = (payload: { id: string; email: string; role: 'customer' | 'admin'; name: string }) => {
  const secret = process.env.JWT_SECRET || 'systum_ott_default_secret_2026';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// POST /api/auth/signup
authRouter.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
        phone,
        role: 'customer',
      });

      const token = generateToken({
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      });

      return res.status(201).json({
        success: true,
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone },
      });
    }

    // In-memory fallback
    const existing = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: normalizedEmail,
      passwordHash,
      phone,
      role: 'customer' as const,
    };
    inMemoryUsers.push(newUser);

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      });
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, user: req.user });
});
