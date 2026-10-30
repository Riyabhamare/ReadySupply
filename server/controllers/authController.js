import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { SupplierProfile } from '../models/SupplierProfile.js';
import { env } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { logActivity } from '../services/activityService.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper to set httpOnly cookie
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Conflict', message: 'An account with this email already exists.' });
    }

    // Role is strictly forced to SUPPLIER - never trust client input
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: ROLES.SUPPLIER,
      phone: data.phone || '',
      isDemo: false,
    });

    // Automatically create associated SupplierProfile
    const profile = await SupplierProfile.create({
      supplier: user._id,
      companyName: data.companyName,
      isDemo: false,
    });
    profile.calculateCompleteness();
    await profile.save();

    const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    setAuthCookie(res, token);

    await logActivity({
      supplierId: user._id,
      performedById: user._id,
      action: 'REGISTER',
      entityType: 'User',
      entityId: user._id.toString(),
      ip: req.ip,
    });

    res.status(201).json({
      message: 'Account registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    setAuthCookie(res, token);

    const profile = await SupplierProfile.findOne({ supplier: user._id });

    await logActivity({
      supplierId: user.role === ROLES.SUPPLIER ? user._id : null,
      performedById: user._id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      ip: req.ip,
    });

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isDemo: user.isDemo,
      },
      profile,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity({
        supplierId: req.user.role === ROLES.SUPPLIER ? req.user._id : null,
        performedById: req.user._id,
        action: 'LOGOUT',
        ip: req.ip,
      });
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === ROLES.SUPPLIER) {
      profile = await SupplierProfile.findOne({ supplier: user._id });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isDemo: user.isDemo,
      },
      profile,
    });
  } catch (err) {
    next(err);
  }
};

