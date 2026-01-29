import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Please enter a valid email').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255).trim(),
  email: z.email('Please enter a valid email').max(255).trim().toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
