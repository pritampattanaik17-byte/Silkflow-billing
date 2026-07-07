import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["owner", "employee"], {
    errorMap: () => ({ message: "Role must be either 'owner' or 'employee'" }),
  }).optional().default("employee"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["owner", "employee"]).optional(),
});
