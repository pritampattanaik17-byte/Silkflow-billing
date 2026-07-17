import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { registerSchema } from '../validators/authValidator.js';

/**
 * V13: Create an employee account (owner-only).
 * This replaces the old public registration path for employees.
 */
export const createEmployee = async (req, res) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    const { name, email, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'employee',
        status: 'inactive',
      },
    });

    res.status(201).json({
      message: 'Employee account created successfully. Account is pending activation.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Create employee error:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all employees (users with role 'employee')
export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: 'employee'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Prevent owner from targeting themselves or non-employee users
    if (id === req.user.id) {
      return res.status(403).json({ message: 'You cannot change your own status.' });
    }

    // Only allow toggling users with role 'employee'
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.role !== 'employee') {
      return res.status(403).json({ message: 'Only employee accounts can be toggled.' });
    }

    const employee = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Employee status updated successfully', status: employee.status });
  } catch (error) {
    console.error('Error updating employee status:', process.env.NODE_ENV === 'production' ? error.message : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
