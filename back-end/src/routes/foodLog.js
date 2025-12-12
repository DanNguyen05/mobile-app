import express from 'express';
import { requireAuth, getUserIdOrFallback, attachUserIfPresent } from '../middleware/auth.js';
import * as foodController from '../controllers/foodController.js';

const router = express.Router();

// Get food logs (optionally authenticated)
router.get('/', attachUserIfPresent, foodController.getFoodLogs);

// Create food log (protected)
router.post('/', requireAuth, foodController.createFoodLog);

// Update food log (protected)
router.put('/:id', requireAuth, foodController.updateFoodLog);

// Delete food log (protected)
router.delete('/:id', requireAuth, foodController.deleteFoodLog);

// Batch delete food logs (protected)
router.post('/batch-delete', requireAuth, foodController.batchDeleteFoodLogs);

export default router;
