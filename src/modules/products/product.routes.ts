import { Router } from 'express';
import { productController } from './product.controller.js';

import {
  createProductSchema,
  productIdSchema,
  productQuerySchema,
  updateProductSchema,
  updateProductStatusSchema,
} from './product.validation.js';

import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../constants/roles.constants.js';

const router = Router();

// Public: List active products
// Admin: Create product
router
  .route('/')
  .get(validate(productQuerySchema, 'query'), productController.getAllProducts)
  .post(authenticate, authorize(USER_ROLES.ADMIN), validate(createProductSchema), productController.createProduct);

// Admin: List all products (active and inactive)
router.get(
  '/admin',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(productQuerySchema, 'query'),
  productController.getAllProductsAdmin
);

// Admin: Update product status
router.patch(
  '/:productId/status',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(productIdSchema, 'params'),
  validate(updateProductStatusSchema),
  productController.updateProductStatus
);

// Public: Get active product details
// Admin: Update and delete product
router
  .route('/:productId')
  .get(validate(productIdSchema, 'params'), productController.getProductById)
  .patch(
    authenticate,
    authorize(USER_ROLES.ADMIN),
    validate(productIdSchema, 'params'),
    validate(updateProductSchema),
    productController.updateProduct
  )
  .delete(
    authenticate,
    authorize(USER_ROLES.ADMIN),
    validate(productIdSchema, 'params'),
    productController.deleteProduct
  );

export const productRoutes = router;
