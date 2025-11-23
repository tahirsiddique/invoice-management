import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Signup
router.post(
  '/signup',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
  ],
  validate,
  AuthController.signup
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  AuthController.login
);

// Google OAuth
router.post('/google/callback', AuthController.googleCallback);

// Password reset request
router.post(
  '/password-reset/request',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  AuthController.requestPasswordReset
);

// Password reset
router.post(
  '/password-reset',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,
  AuthController.resetPassword
);

// Email verification
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  validate,
  AuthController.verifyEmail
);

// Change password (authenticated)
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  validate,
  AuthController.changePassword
);

// Logout
router.post('/logout', authenticate, AuthController.logout);

// Get current user
router.get('/me', authenticate, AuthController.getMe);

export default router;
