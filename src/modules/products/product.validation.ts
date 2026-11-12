
import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const productIdSchema = z.object({
  productId: objectIdSchema,
});

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required'),
    sku: z.string().trim().min(1, 'SKU is required'),
    description: z.string().trim().optional().default(''),
    price: z.number().min(0, 'Price cannot be negative'),
    salePrice: z.number().min(0).nullable().optional().default(null),
    stock: z.number().int().min(0, 'Stock cannot be negative').optional().default(0),
    category: objectIdSchema,
    status: z.enum(['active', 'inactive']).optional().default('active'),
  })
  .refine(
    (data) => data.salePrice === null || data.salePrice <= data.price,
    {
      message: 'Sale price cannot exceed original price',
      path: ['salePrice'],
    }
  );

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    sku: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    price: z.number().min(0).optional(),
    salePrice: z.number().min(0).nullable().optional(),
    images: z.array(z.string().url()).optional(),
    stock: z.number().int().min(0).optional(),
    category: objectIdSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

export const updateProductStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

export const productQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    category: objectIdSchema.optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sortBy: z.enum(['name', 'price', 'createdAt']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: 'Minimum price cannot exceed maximum price',
      path: ['maxPrice'],
    }
  );

export type ProductIdInput = z.infer<typeof productIdSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
