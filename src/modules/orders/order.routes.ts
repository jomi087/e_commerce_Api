import { Router } from 'express';
import { orderController } from './order.controller.js';

import {
  createOrderSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from './order.validation.js';

import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../constants/roles.constants.js';

const router = Router();

// All order routes require authentication.
router.use(authenticate);

// Customer: Place an order
router.post(
  '/',
  authorize(USER_ROLES.CUSTOMER),
  validate(createOrderSchema),
  orderController.createOrder
);

// Customer: Get their own orders
router.get('/my-orders', authorize(USER_ROLES.CUSTOMER), orderController.getMyOrders);

// Admin: Get all orders
router.get('/', authorize(USER_ROLES.ADMIN), orderController.getAllOrders);

// Admin: Update order status
router.patch(
  '/:orderId/status',
  authorize(USER_ROLES.ADMIN),
  validate(orderIdSchema, 'params'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// Customer: Cancel their own order
router.patch(
  '/:orderId/cancel',
  authorize(USER_ROLES.CUSTOMER),
  validate(orderIdSchema, 'params'),
  orderController.cancelOrder
);

// Customer/Admin: Get order details
router.get('/:orderId', validate(orderIdSchema, 'params'), orderController.getOrderById);

export const orderRoutes = router;
