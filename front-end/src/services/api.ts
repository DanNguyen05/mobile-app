// src/services/api.ts
import { http } from './http';

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  neck_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  biceps_cm: number | null;
  thigh_cm: number | null;
  goal: string | null;
  activity_level: string | null;
  exercise_preferences: {
    yoga: boolean;
    gym: boolean;
    [key: string]: boolean;
  } | null;
}

export interface BodyMeasurement {
  id: number;
  user_id: number;
  measured_at: string;
  weight_kg: number;
  neck_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  biceps_cm?: number;
  thigh_cm?: number;
  created_at: string;
}

export interface FoodLog {
  log_id: number;
  user_id: number;
  eaten_at: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  health_consideration: string;
  is_corrected: boolean;
  imageUrl?: string;
}

export interface WorkoutLog {
  log_id: number;
  user_id: number;
  completed_at: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned_estimated: number;
  is_ai_suggested: boolean;
}

export interface AiSuggestion {
  suggestion_id: number;
  user_id: number;
  generated_at: string;
  type: string;
  is_applied: boolean;
  content_details: any;
}

export interface DailyStatistics {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  calories_burned: number;
  exercise_duration: number;
  meals_count: number;
  workouts_count: number;
}

type UserUpdatePayload = Partial<Omit<User, 'user_id' | 'email' | 'password_hash'>> & {
  name?: string;
  age?: number;
  gender?: string;
  goal?: string;
  heightCm?: number;
  weightKg?: number;
  neckCm?: number;
  waistCm?: number;
  hipCm?: number;
  bicepsCm?: number;
  thighCm?: number;
  activityLevel?: string;
  exercisePreferences?: User['exercise_preferences'];
  tdee?: number;
  recommendedCalories?: number;
  goalType?: string;
};

const normalizeUserUpdatePayload = (data: UserUpdatePayload) => {
  const payload: Record<string, unknown> = {};

  const assignField = (camelKey: keyof UserUpdatePayload, snakeKey: string) => {
    if (
      Object.prototype.hasOwnProperty.call(data, camelKey) ||
      Object.prototype.hasOwnProperty.call(data, snakeKey)
    ) {
      const value =
        Object.prototype.hasOwnProperty.call(data, camelKey) && data[camelKey] !== undefined
          ? data[camelKey]
          : (data as any)[snakeKey];
      payload[camelKey as string] = value;
    }
  };

  if (Object.prototype.hasOwnProperty.call(data, 'name')) payload.name = data.name;
  if (Object.prototype.hasOwnProperty.call(data, 'age')) payload.age = data.age;
  if (Object.prototype.hasOwnProperty.call(data, 'gender')) payload.gender = data.gender;
  if (Object.prototype.hasOwnProperty.call(data, 'goal')) payload.goal = data.goal;

  assignField('heightCm', 'height_cm');
  assignField('weightKg', 'weight_kg');
  assignField('neckCm', 'neck_cm');
  assignField('waistCm', 'waist_cm');
  assignField('hipCm', 'hip_cm');
  assignField('bicepsCm', 'biceps_cm');
  assignField('thighCm', 'thigh_cm');
  assignField('activityLevel', 'activity_level');
  assignField('exercisePreferences', 'exercise_preferences');

  return payload;
};

export const api = {
  // Users
  getUsers: (): Promise<User[]> => http.request('/api/users'),
  getCurrentUser: (): Promise<User> => http.request('/api/users/me'),
  updateCurrentUser: (data: UserUpdatePayload): Promise<User> =>
    http.request('/api/users/me', {
      method: 'PUT',
      json: normalizeUserUpdatePayload(data),
    }),

  // Food Log
  getFoodLog: (): Promise<FoodLog[]> => http.request('/api/food-log'),
  addFoodLog: (data: {
    foodName?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    mealType?: string;
    eatenAt?: string;
    healthConsideration?: string;
    amount?: string;
    sugar?: number;
    imageUrl?: string;
  }): Promise<FoodLog> =>
    http.request('/api/food-log', { method: 'POST', json: data }),
  deleteFoodLog: (logId: number): Promise<void> =>
    http.request(`/api/food-log/${logId}`, { method: 'DELETE' }),

  // Workout Log
  getWorkoutLog: (params?: { start?: string; end?: string }): Promise<WorkoutLog[]> =>
    http.request('/api/workout-log', { params }),
  addWorkoutLog: (data: Partial<WorkoutLog>): Promise<WorkoutLog> =>
    http.request('/api/workout-log', { method: 'POST', json: data }),
  deleteWorkoutLog: (logId: number): Promise<void> =>
    http.request(`/api/workout-log/${logId}`, { method: 'DELETE' }),

  // AI Suggestions
  getAiSuggestions: (): Promise<AiSuggestion[]> => http.request('/api/ai-suggestions'),

  // Statistics
  getDailyStatistics: (date: string): Promise<DailyStatistics> =>
    http.request(`/api/statistics/daily?date=${date}`),
  getWeeklyStatistics: (startDate: string, endDate: string): Promise<DailyStatistics[]> =>
    http.request(`/api/statistics/weekly?startDate=${startDate}&endDate=${endDate}`),

  // Body Measurements
  getBodyMeasurements: (): Promise<BodyMeasurement[]> => http.request('/api/body-measurements'),
  createOrUpdateBodyMeasurement: (data: {
    weight_kg: number;
    neck_cm?: number;
    waist_cm?: number;
    hip_cm?: number;
    biceps_cm?: number;
    thigh_cm?: number;
  }): Promise<any> =>
    http.request('/api/body-measurements', {
      method: 'POST',
      json: data,
    }),

  // Progress Photos
  uploadProgressPhoto: (data: {
    date: string;
    view: string;
    imageBase64: string;
    note?: string;
  }) =>
    http.request('/api/progress-photos', {
      method: 'POST',
      json: data,
    }),
  getProgressPhotos: (date?: string) =>
    http.request('/api/progress-photos', {
      params: date ? { date } : undefined,
    }),

  // Chat / AI Messages
  sendMessage: (message: string): Promise<any> =>
    http.request('/api/chat', { method: 'POST', json: { message } }),
};
