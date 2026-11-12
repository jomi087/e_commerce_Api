
import type { Request, Response } from 'express';
import { orderService } from './order.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { SUCCESS_MESSAGES } from '../../constants/messages.constants.js';
import type {
  CreateOrderInput,
  OrderIdInput,
  UpdateOrderStatusInput,
} from './order.validation.js';

export class OrderController {
  createOrder = async (req: Request, res: Response): Promise<void> => {
    const input = req.validated?.body as CreateOrderInput;

    const order = await orderService.createOrder(
      req.user!.id,
      input
    );

    sendSuccess(res, 201, SUCCESS_MESSAGES.SUCCESS, order);
  };

  getMyOrders = async (_req: Request, res: Response): Promise<void> => {
    const orders = await orderService.getMyOrders(_req.user!.id);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, orders);
  };

  getAllOrders = async (_req: Request, res: Response): Promise<void> => {
    const orders = await orderService.getAllOrders();

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, orders);
  };

  getOrderById = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.validated?.params as OrderIdInput;
    const isAdmin = req.user!.role === 'admin';

    const order = await orderService.getOrderById(
      orderId,
      req.user!.id,
      isAdmin
    );

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, order);
  };

  updateOrderStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { orderId } = req.validated?.params as OrderIdInput;
    const { status } = req.validated?.body as UpdateOrderStatusInput;

    const order = await orderService.updateOrderStatus(orderId, status);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, order);
  };

  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.validated?.params as OrderIdInput;

    const order = await orderService.cancelOrder(
      orderId,
      req.user!.id
    );

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, order);
  };
}

export const orderController = new OrderController();
