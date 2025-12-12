import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Register
router.post(
  '/register',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  authController.login
);

// Refresh token
router.post('/refresh', authController.refresh);

// Logout
router.post('/logout', authController.logout);

// Get profile (protected)
router.get('/me', requireAuth, authController.getProfile);

// Update profile (protected)
router.put('/me', requireAuth, authController.updateProfile);

// Update measurements (protected)
router.put('/me/measurements', requireAuth, authController.updateMeasurements);

export default router;
