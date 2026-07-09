import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

/**
 * Authenticate JWT token from Authorization header.
 * Attaches decoded { id, role } to req.user on success.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the user still exists and is currently active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { status: true, role: true }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Your account has been deactivated. Access denied.' });
    }

    req.user = { id: decoded.id, role: user.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

/**
 * Role-based authorization middleware.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: requireRole('owner')  — only owners can access the route.
 *        requireRole('owner', 'employee') — both can access.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};
