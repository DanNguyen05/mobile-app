// src/types/index.ts

export interface User {
  id: string;
  email: string;
  name?: string;
  gender?: 'male' | 'female';
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal?: 'lose' | 'maintain' | 'gain';
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  hasCompletedOnboarding?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingSize?: number;
  servingUnit?: string;
  imageUrl?: string;
  loggedAt: string;
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  exerciseType: string;
  name?: string;
  duration: number; // in minutes
  caloriesBurned: number;
  intensity?: 'low' | 'medium' | 'high';
  notes?: string;
  loggedAt: string;
  createdAt: string;
}

export interface DailyStatistics {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalWorkoutCalories: number;
  mealsLogged: number;
  workoutsLogged: number;
}

export interface WeeklyStatistics {
  startDate: string;
  endDate: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  totalWorkoutCalories: number;
  daysLogged: number;
  dailyData: DailyStatistics[];
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  measuredAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  FoodDiary: undefined;
  Exercises: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
