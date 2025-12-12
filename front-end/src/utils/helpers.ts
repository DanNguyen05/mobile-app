// src/utils/helpers.ts
import { format, parseISO, isToday, isYesterday } from 'date-fns';

/**
 * Format date to display string
 */
export const formatDate = (date: string | Date, formatString: string = 'MMM d, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

/**
 * Format date relative to today
 */
export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';
  return format(dateObj, 'MMM d');
};

/**
 * Calculate BMI
 */
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60A5FA' };
  if (bmi < 25) return { label: 'Normal', color: '#10B981' };
  if (bmi < 30) return { label: 'Overweight', color: '#FBBF24' };
  return { label: 'Obese', color: '#EF4444' };
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export const calculateTDEE = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: string = 'moderate'
): number => {
  // Harris-Benedict Equation
  const bmr = gender === 'male'
    ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
    : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.33 * age);

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
