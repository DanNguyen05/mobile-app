/**
 * Map Prisma User model to API response format
 */
export const mapUser = (user) => ({
  user_id: user.id,
  email: user.email,
  password_hash: user.passwordHash,
  name: user.name,
  age: user.age,
  gender: user.gender,
  height_cm: user.heightCm,
  weight_kg: user.weightKg,
  neck_cm: user.neckCm,
  waist_cm: user.waistCm,
  hip_cm: user.hipCm,
  biceps_cm: user.bicepsCm,
  thigh_cm: user.thighCm,
  goal: user.goal,
  activity_level: user.activityLevel,
  exercise_preferences: user.exercisePreferences || {},
});

/**
 * Map Prisma FoodLog model to API response format
 */
export const mapFoodLog = (log) => ({
  log_id: log.id,
  user_id: log.userId,
  eaten_at: log.eatenAt.toISOString(),
  meal_type: log.mealType,
  food_name: log.foodName,
  calories: log.calories,
  protein_g: log.proteinGrams,
  carbs_g: log.carbsGrams,
  fat_g: log.fatGrams,
  health_consideration: log.healthConsideration,
  is_corrected: log.isCorrected,
  amount: log.amount,
  sugar: log.sugarGrams,
  status: log.status,
  thoughts: log.thoughts,
  image_url: log.imageUrl,
});

/**
 * Map Prisma WorkoutLog model to API response format
 */
export const mapWorkoutLog = (log) => ({
  log_id: log.id,
  user_id: log.userId,
  completed_at: log.completedAt.toISOString(),
  exercise_name: log.exerciseName,
  duration_minutes: log.durationMinutes,
  calories_burned_estimated: log.caloriesBurnedEstimated,
  is_ai_suggested: log.isAiSuggested,
});

/**
 * Map Prisma AiSuggestion model to API response format
 */
export const mapSuggestion = (suggestion) => ({
  suggestion_id: suggestion.id,
  user_id: suggestion.userId,
  generated_at: suggestion.generatedAt.toISOString(),
  type: suggestion.type,
  is_applied: suggestion.isApplied,
  content_details: suggestion.contentDetails,
});

/**
 * Map Prisma CalendarEvent model to API response format
 */
export const mapCalendarEvent = (event) => ({
  id: event.id,
  userId: event.userId,
  title: event.title,
  eventDate: event.eventDate.toISOString(),
  timeSlot: event.timeSlot,
  category: event.category,
  location: event.location,
  note: event.note,
  linkedModule: event.linkedModule,
});

/**
 * Parse date string to Date object (UTC)
 * @param {string} dateStr - Date string in format YYYY-MM-DD
 * @returns {Date}
 */
export const parseDateOnly = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error('Invalid date value');
  }
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Parse date for queries (handles start and end dates)
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/**
 * Calculate BMR (Basal Metabolic Rate)
 * @param {Object} params - User parameters
 * @returns {number} - BMR value
 */
export const calculateBMR = ({ weight, height, age, gender }) => {
  const isMale = gender?.toLowerCase() === 'male';
  
  if (isMale) {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.33 * age);
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - BMR value
 * @param {string} activityLevel - Activity level
 * @returns {number} - TDEE value
 */
export const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} - BMI value
 */
export const calculateBMI = (weight, height) => {
  return Number((weight / ((height / 100) ** 2)).toFixed(1));
};

/**
 * Handle Prisma errors and send appropriate response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} message - Custom error message
 */
export const handlePrismaError = (res, error, message) => {
  console.error(message, error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({ 
      error: 'Duplicate entry',
      details: message 
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({ 
      error: 'Record not found',
      details: message 
    });
  }
  
  res.status(500).json({ 
    error: message,
    details: error.message 
  });
};
