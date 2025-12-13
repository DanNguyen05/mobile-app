import prisma from '../config/database.js';
import { parseDateOnly, handlePrismaError } from '../utils/helpers.js';
import { config } from '../config/index.js';

/**
 * Get daily statistics
 */
export const getDailyStatistics = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || config.defaultUserId;
    const { date } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    // Validate userId is a valid number
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required (format: YYYY-MM-DD)' });
    }

    const targetDate = parseDateOnly(date);
    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const [foodStats, workoutStats] = await Promise.all([
      prisma.foodLog.aggregate({
        where: {
          userId: userIdNum,
          eatenAt: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        _sum: {
          calories: true,
          proteinGrams: true,
          carbsGrams: true,
          fatGrams: true,
        },
        _count: true,
      }),
      prisma.workoutLog.aggregate({
        where: {
          userId: userIdNum,
          completedAt: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        _sum: {
          caloriesBurnedEstimated: true,
          durationMinutes: true,
        },
        _count: true,
      }),
    ]);

    res.json({
      date: date,
      total_calories: foodStats._sum.calories || 0,
      total_protein: foodStats._sum.proteinGrams || 0,
      total_carbs: foodStats._sum.carbsGrams || 0,
      total_fat: foodStats._sum.fatGrams || 0,
      calories_burned: workoutStats._sum.caloriesBurnedEstimated || 0,
      exercise_duration: workoutStats._sum.durationMinutes || 0,
      meals_count: foodStats._count || 0,
      workouts_count: workoutStats._count || 0,
    });
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch daily statistics');
  }
};

/**
 * Get weekly statistics
 */
export const getWeeklyStatistics = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        error: 'User authentication required' 
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate parameters are required (format: YYYY-MM-DD)' 
      });
    }

    // Validate userId is a valid number
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    end.setUTCDate(end.getUTCDate() + 1);

    const [foodLogs, workoutLogs] = await Promise.all([
      prisma.foodLog.findMany({
        where: {
          userId: userIdNum,
          eatenAt: { gte: start, lt: end },
        },
        select: {
          eatenAt: true,
          calories: true,
          proteinGrams: true,
          carbsGrams: true,
          fatGrams: true,
        },
      }),
      prisma.workoutLog.findMany({
        where: {
          userId: userIdNum,
          completedAt: { gte: start, lt: end },
        },
        select: {
          completedAt: true,
          caloriesBurnedEstimated: true,
          durationMinutes: true,
        },
      }),
    ]);

    const dailyData = {};

    foodLogs.forEach(log => {
      const dateKey = log.eatenAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          calories_burned: 0,
          exercise_duration: 0,
          meals_count: 0,
          workouts_count: 0,
        };
      }
      dailyData[dateKey].total_calories += log.calories;
      dailyData[dateKey].total_protein += log.proteinGrams;
      dailyData[dateKey].total_carbs += log.carbsGrams;
      dailyData[dateKey].total_fat += log.fatGrams;
      dailyData[dateKey].meals_count += 1;
    });

    workoutLogs.forEach(log => {
      const dateKey = log.completedAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          calories_burned: 0,
          exercise_duration: 0,
          meals_count: 0,
          workouts_count: 0,
        };
      }
      dailyData[dateKey].calories_burned += log.caloriesBurnedEstimated;
      dailyData[dateKey].exercise_duration += log.durationMinutes;
      dailyData[dateKey].workouts_count += 1;
    });

    const weeklyStats = Object.values(dailyData).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    res.json(weeklyStats);
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch weekly statistics');
  }
};
