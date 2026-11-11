import { z } from 'zod';
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  // PASSWORD_REGEX,
} from '../../constants/auth.constants.js';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    )
    .max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`),
  // .regex(
  //   PASSWORD_REGEX,
  //   'Password must contain uppercase, lowercase, number and special character'
  // ),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(NAME_MIN_LENGTH, 'Name must be at least 3 characters')
    .max(NAME_MAX_LENGTH, 'Name cannot exceed 50 characters')
    // .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
