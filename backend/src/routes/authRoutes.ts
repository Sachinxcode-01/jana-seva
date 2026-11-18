import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db } from '../database/db.js';
import { generateToken, authenticate, AuthenticatedRequest } from '../auth/authMiddleware.js';
import { User } from '../types.js';

const router = Router();

// Strict rate limiting on authentication routes (login & register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { fullName, email, password, state, occupation, incomeRange } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // SECURITY: Enforce citizen role on registration to prevent privilege escalation
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: String(fullName).trim(),
      email: cleanEmail,
      passwordHash,
      role: 'citizen',
      state: state || 'Karnataka',
      occupation: occupation || 'General Citizen',
      incomeRange: incomeRange || 'Below 2.5 Lakhs',
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        state: newUser.state,
        occupation: newUser.occupation,
        incomeRange: newUser.incomeRange
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        state: user.state,
        occupation: user.occupation,
        incomeRange: user.incomeRange
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      state: user.state,
      occupation: user.occupation,
      incomeRange: user.incomeRange,
      createdAt: user.createdAt
    }
  });
});

// Store for active password reset OTPs (email -> { otp, expiresAt })
const resetOtpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered citizen or admin account found with this email.' });
    }

    // Generate a secure 6-digit OTP valid for 15 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    resetOtpStore.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    console.log(`[PASSWORD RESET] Generated verification OTP for ${cleanEmail}: ${otp}`);

    return res.json({
      success: true,
      message: 'Verification OTP has been generated for password reset.',
      devOtp: otp, // Surfaced for instant lab viva demonstration without external SMTP configuration
      email: cleanEmail
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing password reset.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = resetOtpStore.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No active password reset request found. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      resetOtpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'Password reset OTP has expired. Please request a new one.' });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    const updated = db.updateUserPassword(cleanEmail, passwordHash);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Clean up OTP after successful reset
    resetOtpStore.delete(cleanEmail);

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new credentials.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
});

export default router;
