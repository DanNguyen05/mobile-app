// src/components/NutritionChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, borderRadius } from '../context/ThemeContext';

interface NutritionChartProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  tdee: number;
}

export const NutritionChart: React.FC<NutritionChartProps> = ({
  protein,
  carbs,
  fat,
  calories,
  tdee,
}) => {
  const macroCalories = {
    protein: protein * 4,
    carbs: carbs * 4,
    fat: fat * 9,
  };
  const totalEatenCalories = macroCalories.protein + macroCalories.carbs + macroCalories.fat;

  const proteinPct = totalEatenCalories ? (macroCalories.protein / totalEatenCalories) * 100 : 0;
  const carbsPct = totalEatenCalories ? (macroCalories.carbs / totalEatenCalories) * 100 : 0;
  const fatPct = totalEatenCalories ? (macroCalories.fat / totalEatenCalories) * 100 : 0;

  const size = 140;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Fat */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.fat}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(fatPct / 100) * circumference} ${circumference}`}
            strokeDashoffset={0}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
          {/* Carbs */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.carbs}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(carbsPct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-(fatPct / 100) * circumference}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
          {/* Protein */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.protein}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(proteinPct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-((fatPct + carbsPct) / 100) * circumference}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.centerText}>
          <Text style={styles.caloriesValue}>{calories}</Text>
          <Text style={styles.caloriesLabel}>kcal</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <MacroItem label="Protein" value={Math.round(protein)} color={colors.protein} />
        <MacroItem label="Carbs" value={Math.round(carbs)} color={colors.carbs} />
        <MacroItem label="Fat" value={Math.round(fat)} color={colors.fat} />
      </View>
    </View>
  );
};

interface MacroItemProps {
  label: string;
  value: number;
  color: string;
}

const MacroItem: React.FC<MacroItemProps> = ({ label, value, color }) => (
  <View style={styles.macroItem}>
    <View style={[styles.macroIndicator, { backgroundColor: color }]} />
    <View>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}g</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  caloriesLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  macroLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
