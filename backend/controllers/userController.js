import prisma from '../lib/prisma.js';

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
