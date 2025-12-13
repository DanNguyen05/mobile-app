import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

// Food recognition
router.post('/recognize-food', requireAuth, aiController.recognizeFood);

// Recognize food and save to food log in one step
router.post('/recognize-and-save-food', requireAuth, aiController.recognizeAndSaveFood);

// Exercise plan generation
router.post('/exercise-plan', requireAuth, aiController.generateExercisePlan);

// Chat with AI
router.post('/chat', requireAuth, aiController.chatWithAI);

// Get AI context
router.get('/context', requireAuth, aiController.getAIContext);

export default router;
