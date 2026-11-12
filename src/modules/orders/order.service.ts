
import mongoose, { Types } from 'mongoose';
import { Order } from './order.model.js';
import { ApiError } from '../../utils/ApiError.js';
import type { CreateOrderInput } from './order.validation.js';
import { Product } from '../products/product.model.js';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed'],
  confirmed: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export class OrderService {
  async createOrder(userId: string, input: CreateOrderInput) {
    const session = await mongoose.startSession();

    try {
      let createdOrder: unknown;

      await session.withTransaction(async () => {
        // Combine duplicate product IDs into one item.
        const quantities = new Map<string, number>();

        for (const item of input.items) {
          quantities.set(
            item.product,
            (quantities.get(item.product) ?? 0) + item.quantity
          );
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const [productId, quantity] of quantities) {
          // Atomically check status and available stock, then reduce stock.
          const product = await Product.findOneAndUpdate(
            {
              _id: productId,
              status: 'active',
              stock: { $gte: quantity },
            },
            {
              $inc: { stock: -quantity },
            },
            {
              new: true,
              session,
              runValidators: true,
            }
          );

          if (!product) {
            const existingProduct = await Product.findById(productId)
              .session(session)
              .select('status stock');

            if (!existingProduct) {
              throw ApiError.notFound('Product not found');
            }

            if (existingProduct.status !== 'active') {
              throw ApiError.badRequest(
                'One or more products are inactive'
              );
            }

            throw ApiError.badRequest(
              `Insufficient stock for product ${productId}`
            );
          }

          const price = product.salePrice ?? product.price;
          const subtotal = price * quantity;

          orderItems.push({
            product: product._id,
            productName: product.name,
            sku: product.sku,
            quantity,
            price,
            subtotal,
          });

          totalAmount += subtotal;
        }

        const [order] = await Order.create(
          [
            {
              user: new Types.ObjectId(userId),
              items: orderItems,
              shippingAddress: input.shippingAddress,
              totalAmount,
              status: 'pending',
            },
          ],
          { session }
        );

        createdOrder = order.toObject();
      });

      return createdOrder;
    } finally {
      await session.endSession();
    }
  }

  async getMyOrders(userId: string) {
    return Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getAllOrders() {
    return Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getOrderById(orderId: string, userId: string, isAdmin: boolean) {
    const filter = isAdmin
      ? { _id: orderId }
      : { _id: orderId, user: userId };

    const order = await Order.findOne(filter)
      .populate('user', 'name email')
      .lean();

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const currentStatus = order.status as OrderStatus;

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot change order status from ${currentStatus} to ${newStatus}`
      );
    }

    order.status = newStatus;
    await order.save();

    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const session = await mongoose.startSession();

    try {
      let cancelledOrder: unknown;

      await session.withTransaction(async () => {
        const order = await Order.findOne({
          _id: orderId,
          user: userId,
        }).session(session);

        if (!order) {
          throw ApiError.notFound('Order not found');
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
          throw ApiError.badRequest(
            'This order can no longer be cancelled'
          );
        }

        // Restore stock for every item in the order.
        for (const item of order.items) {
          const result = await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session }
          );

          if (result.matchedCount !== 1) {
            throw ApiError.internal(
              'Unable to restore stock for an ordered product'
            );
          }
        }

        order.status = 'cancelled';
        await order.save({ session });

        cancelledOrder = order.toObject();
      });

      return cancelledOrder;
    } finally {
      await session.endSession();
    }
  }
}

export const orderService = new OrderService();
