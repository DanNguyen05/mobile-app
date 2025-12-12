import express from 'express';
import { requireAuth, attachUserIfPresent } from '../middleware/auth.js';
import * as workoutController from '../controllers/workoutController.js';

const router = express.Router();

// Get workout logs (optionally authenticated)
router.get('/', attachUserIfPresent, workoutController.getWorkoutLogs);

// Create workout log (protected)
router.post('/', requireAuth, workoutController.createWorkoutLog);

// Update workout log (protected)
router.put('/:id', requireAuth, workoutController.updateWorkoutLog);

// Delete workout log (protected)
router.delete('/:id', requireAuth, workoutController.deleteWorkoutLog);

export default router;
