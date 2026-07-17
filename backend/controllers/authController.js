import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema, changePasswordSchema } from '../validators/authValidator.js';

export const login = async (req, res) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { email, password, role } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    if (role && user.role !== role) {
      // V8: Generic message — do not reveal the user's actual role
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { name, email, password } = validationResult.data;

    // V13: Public registration is ONLY for first-time owner setup.
    // Employee accounts must be created by an authenticated owner via POST /api/users.
    const existingOwner = await prisma.user.findFirst({
      where: { role: 'owner' }
    });
    if (existingOwner) {
      return res.status(403).json({ message: 'Registration is closed. Please contact the owner for an account.' });
    }

    // V13: Generic message to prevent email enumeration
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(403).json({ message: 'Registration is closed. Please contact the owner for an account.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // First-ever user is always the owner, active immediately
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'owner',
        status: 'active',
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Registration error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Change password for the authenticated user.
 * Requires current password verification before allowing update.
 */
export const changePassword = async (req, res) => {
  try {
    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { currentPassword, newPassword } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNew },
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkOwner = async (req, res) => {
  try {
    const owner = await prisma.user.findFirst({
      where: { role: 'owner' }
    });
    res.json({ hasOwner: !!owner });
  } catch (error) {
    console.error('Check owner error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
