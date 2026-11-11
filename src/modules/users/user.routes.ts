import { Router } from 'express';

import { userController } from './user.controller.js';

import {
  updateProfileSchema,
  userIdSchema,
  updateUserStatusSchema,
  getAllUsersQuerySchema,
} from './user.validation.js';

import { validate } from '../../middlewares/validate.middleware.js';

import { USER_ROLES } from '../../constants/roles.constants.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// All routes below require authentication
router.use(authenticate);

// Customer / authenticated user routes

router
  .route('/profile')
  .get(userController.getProfile)
  .patch(validate(updateProfileSchema), userController.updateProfile);

// Admin-only routes

router.get(
  '/',
  authorize(USER_ROLES.ADMIN),
  validate(getAllUsersQuerySchema, 'query'),
  userController.getAllUsers
);

router.get(
  '/:userId',
  authorize(USER_ROLES.ADMIN),
  validate(userIdSchema, 'params'),
  userController.getUserById
);

router.patch(
  '/:userId/status',
  authorize(USER_ROLES.ADMIN),
  validate(userIdSchema, 'params'),
  validate(updateUserStatusSchema),
  userController.updateUserStatus
);

export const userRoutes = router;
