import { Router } from 'express';

import { categoryController } from './category.controller.js';

import { createCategorySchema, updateCategorySchema, categoryIdSchema } from './category.validation.js';

import { validate } from '../../middlewares/validate.middleware.js';

import { USER_ROLES } from '../../constants/roles.constants.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();


// GET /tree - Get complete category hierarchy
router.get('/tree', categoryController.getCategoryTree);


// create || get all
router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(authenticate, authorize(USER_ROLES.ADMIN), validate(createCategorySchema), categoryController.createCategory);

// get_by_id | update | delete
router
  .route('/:categoryId')
  .get(validate(categoryIdSchema, 'params'), categoryController.getCategoryById)
  .patch(
    authenticate,
    authorize(USER_ROLES.ADMIN),
    validate(categoryIdSchema, 'params'),
    validate(updateCategorySchema),
    categoryController.updateCategory
  )
  .delete(
    authenticate,
    authorize(USER_ROLES.ADMIN),
    validate(categoryIdSchema, 'params'),
    categoryController.deleteCategory
  );

export const categoryRoutes = router;
