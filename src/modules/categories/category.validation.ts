
import { z } from 'zod';

export const categoryIdSchema = z.object({
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  description: z.string().trim().optional().default(''),
  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID')
    .nullable()
    .optional()
    .default(null),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1, 'Category name is required').optional(),
    description: z.string().trim().optional(),
    parent: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID')
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

export type CategoryIdInput = z.infer<typeof categoryIdSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
