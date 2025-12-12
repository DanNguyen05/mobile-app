import express from 'express';
import { attachUserIfPresent } from '../middleware/auth.js';
import * as statisticsController from '../controllers/statisticsController.js';

const router = express.Router();

// Get daily statistics
router.get('/daily', attachUserIfPresent, statisticsController.getDailyStatistics);

// Get weekly statistics
router.get('/weekly', attachUserIfPresent, statisticsController.getWeeklyStatistics);

export default router;
