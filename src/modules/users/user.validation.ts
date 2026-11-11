import { z } from 'zod';
import { NAME_MIN_LENGTH, NAME_MAX_LENGTH } from '../../constants/auth.constants.js';
import { USER_ROLES_ARRAY } from '../../constants/roles.constants.js';

// Update own profile
export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`)
      .max(NAME_MAX_LENGTH, `Name cannot exceed ${NAME_MAX_LENGTH} characters`)
      .optional(),

    email: z.string().trim().email('Invalid email').optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

// Validate user ID
export const userIdSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

// Activate/deactivate account
export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    error: 'isActive must be a boolean',
  }),
});

export const getAllUsersQuerySchema = z.object({
  role: z.enum(USER_ROLES_ARRAY).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetAllUsersQuery = z.infer<typeof getAllUsersQuerySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
