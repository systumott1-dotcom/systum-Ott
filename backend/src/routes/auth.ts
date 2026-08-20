import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';
import { authLimiter } from '../middleware/rateLimiter.js';
import { sendPasswordResetEmail } from '../services/email.js';

export const authRouter = Router();

// Apply strict rate limiting to all auth endpoints to prevent brute-force attacks
authRouter.use(authLimiter);

// In-memory fallback users
export interface InMemoryUserType {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'customer' | 'admin';
  isBanned?: boolean;
  bannedAt?: Date;
  banReason?: string;
  createdAt: string;
}

export const inMemoryUsers: InMemoryUserType[] = [
  {
    id: 'admin-default-1',
    name: 'Systum Admin',
    email: 'admin@systumott.in',
    passwordHash: bcrypt.hashSync('admin1234', 10),
    phone: '9306022703',
    role: 'admin',
    isBanned: false,
    createdAt: new Date('2025-01-01').toISOString(),
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
    const newUser: InMemoryUserType = {
      id: `usr-${Date.now()}`,
      name,
      email: normalizedEmail,
      passwordHash,
      phone,
      role: 'customer' as const,
      isBanned: false,
      createdAt: new Date().toISOString(),
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

      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been banned by the administrator. Please contact WhatsApp support at +91 93060 22703.',
        });
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

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned by the administrator. Please contact WhatsApp support at +91 93060 22703.',
      });
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

// In-memory OTP storage for password resets (15 minutes validity)
const resetOtpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/auth/forgot-password - Send password reset OTP to email / Gmail
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let userExists = false;

    if (isDbConnected) {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) userExists = true;
    } else {
      const user = inMemoryUsers.find((u) => u.email === normalizedEmail);
      if (user) userExists = true;
    }

    if (!userExists) {
      // Return success without revealing user existence to prevent enumeration
      return res.json({
        success: true,
        message: 'If an account is associated with this email, a 6-digit password reset code has been sent.',
      });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    resetOtpStore.set(normalizedEmail, { otp, expiresAt });

    // Send email via Resend
    await sendPasswordResetEmail(normalizedEmail, otp);

    res.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${normalizedEmail}. Please check your inbox or spam folder.`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
});

// POST /api/auth/reset-password - Verify OTP and update password
authRouter.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const storedOtpData = resetOtpStore.get(normalizedEmail);

  if (!storedOtpData) {
    return res.status(400).json({
      success: false,
      message: 'No active password reset request found for this email. Please request a new code.',
    });
  }

  if (Date.now() > storedOtpData.expiresAt) {
    resetOtpStore.delete(normalizedEmail);
    return res.status(400).json({
      success: false,
      message: 'The password reset code has expired. Please request a new code.',
    });
  }

  if (storedOtpData.otp !== otp.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid verification code. Please check the 6-digit code in your email.',
    });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        user.passwordHash = passwordHash;
        await user.save();
      }
    } else {
      const user = inMemoryUsers.find((u) => u.email === normalizedEmail);
      if (user) {
        user.passwordHash = passwordHash;
      }
    }

    // Clean up OTP after successful reset
    resetOtpStore.delete(normalizedEmail);

    res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, user: req.user });
});
