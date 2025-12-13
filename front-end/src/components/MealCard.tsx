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
  Breakfast: '�',
  Lunch: '🍚',
  Snack: '🍪',
  Dinner: '🍝',
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
        <View
          style={[styles.badge, { backgroundColor: MEAL_COLORS[meal.status] }]}
        >
          <Text style={styles.badgeIcon}>{MEAL_ICONS[meal.status]}</Text>
          <Text style={styles.badgeText}>{meal.status}</Text>
        </View>
        <Text style={styles.time}>{meal.time}</Text>
      </View>

      <Text style={styles.name}>{meal.name}</Text>
      
      <View style={styles.caloriesContainer}>
        <Text style={styles.calories}>{meal.calories.toLocaleString()}</Text>
        <Text style={styles.caloriesUnit}>kcal</Text>
      </View>

      <View style={styles.macros}>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: colors.protein }]} />
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={[styles.macroValue, { color: colors.protein }]}>{meal.protein}g</Text>
          </View>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: colors.carbs }]} />
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={[styles.macroValue, { color: colors.carbs }]}>{meal.carbs}g</Text>
          </View>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: colors.fat }]} />
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={[styles.macroValue, { color: colors.fat }]}>{meal.fat}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  time: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  calories: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  caloriesUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
    opacity: 0.7,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  macroInfo: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
