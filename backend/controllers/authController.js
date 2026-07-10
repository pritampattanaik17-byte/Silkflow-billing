import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema } from '../validators/authValidator.js';

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
      return res.status(403).json({ message: `Access denied: You are registered as an ${user.role}, not an ${role}.` });
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
    console.error('Login error:', error);
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

    const { name, email, password, role } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role === 'owner' || role === 'employee' ? role : 'employee';

    if (userRole === 'owner') {
      const existingOwner = await prisma.user.findFirst({
        where: { role: 'owner' }
      });
      if (existingOwner) {
        return res.status(403).json({ message: 'An owner account already exists. You can only register as an employee.' });
      }
    }

    // Owner accounts are active immediately; employees require owner approval
    const initialStatus = userRole === 'owner' ? 'active' : 'inactive';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        status: initialStatus,
      },
    });

    // Only issue a token for active users (owner on first registration)
    if (initialStatus === 'active') {
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
    }

    // Employee registration — no token, must wait for owner activation
    res.status(201).json({
      message: 'Registration successful. Your account is pending approval by the owner. Please wait for activation before logging in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
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
    console.error('Check owner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
