import prisma from '../config/database.js';
import { mapFoodLog, parseDate, handlePrismaError } from '../utils/helpers.js';
import { config } from '../config/index.js';

/**
 * Get food logs
 */
export const getFoodLogs = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || config.defaultUserId;
    const { start, end } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    // Validate userId is a valid number
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const where = { userId: userIdNum };

    if (start || end) {
      where.eatenAt = {};
      if (start) where.eatenAt.gte = parseDate(start);
      if (end) {
        const endDate = parseDate(end);
        if (endDate) {
          endDate.setUTCDate(endDate.getUTCDate() + 1);
          where.eatenAt.lt = endDate;
        }
      }
    }

    const logs = await prisma.foodLog.findMany({
      where,
      orderBy: { eatenAt: 'desc' },
    });

    res.json(logs.map(mapFoodLog));
  } catch (error) {
    handlePrismaError(res, error, 'Failed to fetch food logs');
  }
};

/**
 * Create food log
 */
export const createFoodLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      eatenAt,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      healthConsideration,
      isCorrected,
      amount,
      sugar,
      status,
      thoughts,
      imageUrl,
    } = req.body;

    const created = await prisma.foodLog.create({
      data: {
        userId,
        eatenAt: eatenAt ? new Date(eatenAt) : new Date(),
        mealType: mealType || 'Meal',
        foodName: foodName || 'Food Item',
        calories: Number(calories) || 0,
        proteinGrams: Number(protein) || 0,
        carbsGrams: Number(carbs) || 0,
        fatGrams: Number(fat) || 0,
        healthConsideration: healthConsideration || null,
        isCorrected: Boolean(isCorrected),
        amount: amount || null,
        sugarGrams: sugar !== undefined ? Number(sugar) : null,
        status: status || null,
        thoughts: thoughts || null,
        imageUrl: imageUrl || null,
      },
    });

    res.status(201).json(mapFoodLog(created));
  } catch (error) {
    handlePrismaError(res, error, 'Failed to create food log');
  }
};

/**
 * Update food log
 */
export const updateFoodLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const {
      eatenAt,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      healthConsideration,
      isCorrected,
      amount,
      sugar,
      status,
      thoughts,
      imageUrl,
    } = req.body;

    const updated = await prisma.foodLog.update({
      where: { id, userId },
      data: {
        eatenAt: eatenAt ? new Date(eatenAt) : undefined,
        mealType,
        foodName,
        calories: calories !== undefined ? Number(calories) : undefined,
        proteinGrams: protein !== undefined ? Number(protein) : undefined,
        carbsGrams: carbs !== undefined ? Number(carbs) : undefined,
        fatGrams: fat !== undefined ? Number(fat) : undefined,
        healthConsideration,
        isCorrected: typeof isCorrected === 'boolean' ? isCorrected : undefined,
        amount,
        sugarGrams: sugar !== undefined ? Number(sugar) : undefined,
        status,
        thoughts,
        imageUrl,
      },
    });

    res.json(mapFoodLog(updated));
  } catch (error) {
    handlePrismaError(res, error, 'Failed to update food log');
  }
};

/**
 * Delete food log
 */
export const deleteFoodLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    await prisma.foodLog.delete({ where: { id, userId } });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(res, error, 'Failed to delete food log');
  }
};

/**
 * Batch delete food logs
 */
export const batchDeleteFoodLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    const result = await prisma.foodLog.deleteMany({
      where: {
        id: { in: ids.map(Number) },
        userId,
      },
    });

    res.json({ deleted: result.count });
  } catch (error) {
    handlePrismaError(res, error, 'Failed to batch delete food logs');
  }
};
