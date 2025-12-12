// src/screens/dashboard/DashboardScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { useAuth } from '../../context/AuthContext';
import { api, type User, type DailyStatistics, type FoodLog, type WorkoutLog } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import { StatCard } from '../../components/StatCard';
import { NutritionChart } from '../../components/NutritionChart';
import { MealCard } from '../../components/MealCard';

const { width } = Dimensions.get('window');

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

export default function DashboardScreen() {
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState<DailyStatistics | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealItem[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, mealsRes, workoutRes] = await Promise.all([
        api.getDailyStatistics(today),
        api.getFoodLog().then((logs: FoodLog[]) =>
          logs.filter((log) => format(new Date(log.eaten_at), 'yyyy-MM-dd') === today)
        ),
        api.getWorkoutLog().then((allLogs: WorkoutLog[]) =>
          allLogs
            .filter((log) => format(new Date(log.completed_at), 'yyyy-MM-dd') === today)
            .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
            .slice(0, 5)
        ),
      ]);

      setTodayStats(statsRes);
      setRecentWorkouts(workoutRes);

      const mappedMeals: MealItem[] = mealsRes.map((log) => ({
        id: String(log.log_id),
        name: log.food_name,
        calories: log.calories,
        protein: Math.round(log.protein_g),
        carbs: Math.round(log.carbs_g),
        fat: Math.round(log.fat_g),
        time: format(new Date(log.eaten_at), 'h:mm a'),
        status: log.meal_type as MealItem['status'],
      }));

      mappedMeals.sort((a, b) => a.time.localeCompare(b.time));
      setTodayMeals(mappedMeals);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, [today]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    load();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const bmi = useMemo(() => {
    if (user?.weight_kg && user?.height_cm) {
      return Number((user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1));
    }
    return 0;
  }, [user]);

  const tdee = useMemo(() => {
    if (!user?.weight_kg || !user?.height_cm || !user?.age || !user?.gender) return 2500;

    const weight = user.weight_kg;
    const height = user.height_cm;
    const age = user.age || 25;
    const gender = user.gender || 'male';

    const bmr =
      gender === 'male'
        ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
        : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

    return Math.round(bmr * 1.55);
  }, [user]);

  const calorieIntakePercent = todayStats?.total_calories
    ? Math.min(100, Math.round((todayStats.total_calories / tdee) * 100))
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'} 👋</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="⚖️"
            label="Weight"
            value={`${user?.weight_kg || '--'} kg`}
            color={colors.primary}
          />
          <StatCard icon="📊" label="BMI" value={`${bmi || '--'}`} color={colors.secondary} />
          <StatCard
            icon="🔥"
            label="Calories"
            value={`${todayStats?.total_calories || 0}`}
            color={colors.warning}
          />
          <StatCard
            icon="🏃"
            label="Burned"
            value={`${todayStats?.calories_burned || 0}`}
            color={colors.error}
          />
        </View>

        {/* Nutrition Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Nutrition</Text>
          <NutritionChart
            protein={todayStats?.total_protein || 0}
            carbs={todayStats?.total_carbs || 0}
            fat={todayStats?.total_fat || 0}
            calories={todayStats?.total_calories || 0}
            tdee={tdee}
          />
          <Text style={styles.tdeeText}>
            {calorieIntakePercent}% of daily goal ({tdee} kcal)
          </Text>
        </View>

        {/* Recent Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
          </View>
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((workout) => (
              <View key={workout.log_id} style={styles.workoutCard}>
                <Text style={styles.workoutIcon}>🏋️</Text>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.exercise_name}</Text>
                  <Text style={styles.workoutStats}>
                    Burned {workout.calories_burned_estimated} kcal • {workout.duration_minutes} min
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No workouts today</Text>
              <Text style={styles.emptyStateSubtext}>Start exercising to track your progress!</Text>
            </View>
          )}
        </View>

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
          </View>
          {todayMeals.length > 0 ? (
            todayMeals.map((meal) => <MealCard key={meal.id} meal={meal} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No meals logged</Text>
              <Text style={styles.emptyStateSubtext}>Track your nutrition to reach your goals!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  tdeeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  workoutIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workoutStats: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
