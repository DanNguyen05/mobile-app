// src/components/MealCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../context/ThemeContext';

interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  status: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
}

interface MealCardProps {
  meal: MealItem;
}

const MEAL_ICONS: Record<string, string> = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Snack: '🍿',
  Dinner: '🌙',
};

const MEAL_COLORS: Record<string, string> = {
  Breakfast: '#FEF3C7',
  Lunch: '#DBEAFE',
  Snack: '#FCE7F3',
  Dinner: '#E0E7FF',
};

export const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: MEAL_COLORS[meal.status] }]}>
          <Text style={styles.badgeIcon}>{MEAL_ICONS[meal.status]}</Text>
          <Text style={styles.badgeText}>{meal.status}</Text>
        </View>
        <Text style={styles.time}>{meal.time}</Text>
      </View>

      <Text style={styles.name}>{meal.name}</Text>
      <Text style={styles.calories}>{meal.calories.toLocaleString()} kcal</Text>

      <View style={styles.macros}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={[styles.macroValue, { color: colors.protein }]}>{meal.protein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={[styles.macroValue, { color: colors.carbs }]}>{meal.carbs}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={[styles.macroValue, { color: colors.fat }]}>{meal.fat}g</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  calories: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
