
import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().trim().min(1, 'Country is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
});

export const orderIdSchema = z.object({
  orderId: objectIdSchema,
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: objectIdSchema,
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'An order must contain at least one product'),

  shippingAddress: shippingAddressSchema,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'confirmed',
    'processing',
    'shipped',
    'delivered',
  ]),
});

export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;
