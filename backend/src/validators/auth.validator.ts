import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Invalid email address format'),
    mobileNumber: z.string().min(8, 'Phone number must be at least 8 characters').optional().or(z.literal('')),
    role: z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']).default('SALES'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
