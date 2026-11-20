import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db, DEFAULT_DOCUMENTS } from '../database/db.js';
import { generateToken, authenticate, optionalAuthenticate, AuthenticatedRequest } from '../auth/authMiddleware.js';
import { User, UserSession } from '../types.js';

const router = Router();

// Strict rate limiting on authentication routes (login, register, forgot-password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/v1/auth/register & /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      state,
      district,
      villageTown,
      occupation,
      beneficiaryCategory,
      incomeRange,
      gender,
      preferredLanguage,
      termsAccepted
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate email
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
    }

    // Check duplicate mobile if provided
    if (mobileNumber) {
      const existingMobile = db.getUserByEmailOrMobile(String(mobileNumber).trim());
      if (existingMobile) {
        return res.status(400).json({ success: false, message: 'An account with this mobile number already exists.' });
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const initialSession: UserSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Web Browser',
      loggedInAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    // SECURITY: Enforce citizen role on registration to prevent privilege escalation
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: String(fullName).trim(),
      email: cleanEmail,
      mobileNumber: mobileNumber ? String(mobileNumber).trim() : undefined,
      passwordHash,
      role: 'citizen',
      state: state || 'Karnataka',
      district: district || 'Bengaluru Urban',
      villageTown: villageTown || '',
      occupation: occupation || 'General Citizen',
      beneficiaryCategory: beneficiaryCategory || 'General',
      incomeRange: incomeRange || 'Below 2.5 Lakhs',
      gender: gender || 'Other',
      preferredLanguage: preferredLanguage || 'en',
      preferences: {
        language: preferredLanguage || 'en',
        emailNotifications: true,
        smsNotifications: false,
        schemeUpdates: true,
        theme: 'dark'
      },
      documents: DEFAULT_DOCUMENTS,
      sessions: [initialSession],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createUser(newUser);
    const token = generateToken(newUser, initialSession.id);

    const safeUser = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
      role: newUser.role,
      state: newUser.state,
      district: newUser.district,
      villageTown: newUser.villageTown,
      occupation: newUser.occupation,
      beneficiaryCategory: newUser.beneficiaryCategory,
      incomeRange: newUser.incomeRange,
      gender: newUser.gender,
      preferredLanguage: newUser.preferredLanguage,
      preferences: newUser.preferences,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      message: 'Citizen account created successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/v1/auth/login & /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, identifier, emailOrMobile, password, rememberMe } = req.body;
    const loginIdentifier = identifier || email || emailOrMobile;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ success: false, message: 'Email/Mobile number and password are required.' });
      }

      const user = db.getUserByEmailOrMobile(String(loginIdentifier).trim());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. No registered account found.' });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email/mobile or password.' });
      }

      const session: UserSession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Web Browser',
        loggedInAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      db.createSession(user.id, session);

      const token = generateToken(user, session.id);

      const safeUser = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        state: user.state,
        district: user.district,
        villageTown: user.villageTown,
        occupation: user.occupation,
        beneficiaryCategory: user.beneficiaryCategory,
        incomeRange: user.incomeRange,
        gender: user.gender,
        preferredLanguage: user.preferredLanguage,
        preferences: user.preferences,
        createdAt: user.createdAt
      };

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
      user: safeUser
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  });

// GET /api/v1/auth/profile & /api/auth/profile
router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      state: user.state,
      district: user.district,
      villageTown: user.villageTown,
      occupation: user.occupation,
      beneficiaryCategory: user.beneficiaryCategory,
      incomeRange: user.incomeRange,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage,
      preferences: user.preferences,
      createdAt: user.createdAt
    }
  });
});

// Store for active password reset OTPs (email -> { otp, expiresAt })
const resetOtpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/v1/auth/forgot-password & /api/auth/forgot-password
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

    console.log(`[PASSWORD RESET] Verification OTP for ${cleanEmail}: ${otp}`);

    return res.json({
      success: true,
      message: 'A verification code has been generated for password reset.',
      devOtp: otp, // Surfaced for instant lab viva demonstration without external SMTP configuration
      email: cleanEmail
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing password reset.' });
  }
});

// POST /api/v1/auth/reset-password & /api/auth/reset-password
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
      return res.status(400).json({ success: false, message: 'Invalid verification OTP code. Please check and try again.' });
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
      message: 'Your password has been successfully reset. You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
});

// POST /api/v1/auth/logout & /api/auth/logout
router.post('/logout', optionalAuthenticate, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
