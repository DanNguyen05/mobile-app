import prisma from '../config/database.js';
import { mapWorkoutLog, parseDate, handlePrismaError } from '../utils/helpers.js';
import { config } from '../config/index.js';

/**
 * Get workout logs
 */
export const getWorkoutLogs = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || config.defaultUserId;
    const { start, end } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const where = { userId: Number(userId) };

    if (start || end) {
      where.completedAt = {};
      if (start) where.completedAt.gte = parseDate(start);
      if (end) {
        const endDate = parseDate(end);
        if (endDate) {
          endDate.setUTCDate(endDate.getUTCDate() + 1);
          where.completedAt.lt = endDate;
        }
      }
    }

    const logs = await prisma.workoutLog.findMany({
      where,
      orderBy: { completedAt: 'desc' },
    });

    res.json(logs.map(mapWorkoutLog));
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch workout logs');
  }
};

/**
 * Create workout log
 */
export const createWorkoutLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      completedAt,
      exerciseName,
      durationMinutes,
      caloriesBurnedEstimated,
      isAiSuggested,
    } = req.body;

    const created = await prisma.workoutLog.create({
      data: {
        userId,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        exerciseName: exerciseName || 'Workout',
        durationMinutes: Number(durationMinutes) || 0,
        caloriesBurnedEstimated: Number(caloriesBurnedEstimated) || 0,
        isAiSuggested: Boolean(isAiSuggested),
      },
    });

    res.status(201).json(mapWorkoutLog(created));
  } catch (error) {
    handlePrismaError(res, error, 'Failed to create workout log');
  }
};

/**
 * Update workout log
 */
export const updateWorkoutLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const {
      completedAt,
      exerciseName,
      durationMinutes,
      caloriesBurnedEstimated,
      isAiSuggested,
    } = req.body;

    const updated = await prisma.workoutLog.update({
      where: { id, userId },
      data: {
        completedAt: completedAt ? new Date(completedAt) : undefined,
        exerciseName,
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : undefined,
        caloriesBurnedEstimated: caloriesBurnedEstimated !== undefined ? Number(caloriesBurnedEstimated) : undefined,
        isAiSuggested: typeof isAiSuggested === 'boolean' ? isAiSuggested : undefined,
      },
    });

    res.json(mapWorkoutLog(updated));
  } catch (error) {
    handlePrismaError(res, error, 'Failed to update workout log');
  }
};

/**
 * Delete workout log
 */
export const deleteWorkoutLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    await prisma.workoutLog.delete({ where: { id, userId } });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(res, error, 'Failed to delete workout log');
  }
};
