import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { userRoutes } from '../modules/users/user.routes.js';
import { categoryRoutes } from '../modules/categories/category.routes.js';

import { sendSuccess } from '../utils/ApiResponse.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  sendSuccess(res, 200, 'API is healthy and operational', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);



export default router