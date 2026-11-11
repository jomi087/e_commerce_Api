import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.me);

export const authRoutes = router;
