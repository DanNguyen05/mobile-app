// src/components/MealCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
  image?: string;
}

interface MealCardProps {
  meal: MealItem;
}

const MEAL_ICONS: Record<string, string> = {
  Breakfast: '🍳',
  Lunch: '🍚',
  Snack: '🍪',
  Dinner: '🍝',
};

const MEAL_LABELS: Record<string, string> = {
  Breakfast: 'Bữa sáng',
  Lunch: 'Bữa trưa',
  Snack: 'Bữa phụ',
  Dinner: 'Bữa tối',
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
      {meal.image && <Image source={{ uri: meal.image }} style={styles.foodImage} />}

      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: MEAL_COLORS[meal.status] }]}>
          <Text style={styles.badgeIcon}>{MEAL_ICONS[meal.status]}</Text>
          <Text style={styles.badgeText}>{MEAL_LABELS[meal.status]}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.time}>{meal.time}</Text>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {meal.name}
      </Text>

      <View style={styles.caloriesRow}>
        <View style={styles.caloriePill}>
          <Text style={styles.calorieValue}>{meal.calories.toLocaleString()}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
      </View>

      <View style={styles.macros}>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: colors.protein }]} />
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Đạm</Text>
            <Text style={[styles.macroValue, { color: colors.protein }]}>{meal.protein}g</Text>
          </View>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: colors.carbs }]} />
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Tinh bột</Text>
            <Text style={[styles.macroValue, { color: colors.carbs }]}>{meal.carbs}g</Text>
          </View>
        </View>
        <View style={styles.macroItem}>
          <View style={[styles.macroDot, { backgroundColor: colors.fat }]} />
          <View style={styles.macroInfo}>
            <Text style={styles.macroLabel}>Chất béo</Text>
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
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    gap: spacing.sm,
  },
  foodImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  metaPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  caloriePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '35',
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  calorieUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
