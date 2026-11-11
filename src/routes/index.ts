import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';

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


export default router;
