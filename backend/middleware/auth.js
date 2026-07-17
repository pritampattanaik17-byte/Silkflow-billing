import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

/**
 * Middleware to authenticate a user via JWT.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // V13: Restrict JWT algorithm to HS256 to prevent algorithm confusion attacks
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    
    // Check if the user still exists and is currently active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found or deleted' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive. Please contact the owner.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to restrict access based on user role.
 * Must be used AFTER authenticate middleware.
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Access denied. Requires ${role} role.` });
    }
    next();
  };
};
