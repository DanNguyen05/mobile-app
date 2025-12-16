import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function GoalsScreen() {
  const navigation = useNavigation();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Reload data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await api.getCurrentUser();
      setUser(userData);
      
      // Calculate TDEE and goals
      const weight = userData.weightKg || 70;
      const height = userData.heightCm || 170;
      const age = userData.age || 30;
      const gender = userData.gender?.toLowerCase() || 'male';
      const activityLevel = userData.activityLevel || 'moderately_active';

      // Calculate BMR
      let bmr: number;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // Calculate TDEE based on activity level
      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extra_active: 1.9,
      };
      const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

      // Adjust TDEE based on goal
      let targetCalories = tdee;
      let targetWeight = weight;
      
      if (userData.goal === 'lose_weight' || userData.goal === 'weight_loss') {
        targetCalories = tdee - 500; // 500 kcal deficit
        targetWeight = weight - 5; // Target to lose 5kg
      } else if (userData.goal === 'gain_weight' || userData.goal === 'muscle_gain') {
        targetCalories = tdee + 300; // 300 kcal surplus
        targetWeight = weight + 5; // Target to gain 5kg
      }

      // Today's intake (would need to fetch from food logs)
      const todayIntake = 0; // Placeholder

      setGoals([
        {
          id: '1',
          title: 'Cân nặng mục tiêu',
          current: weight,
          target: targetWeight,
          unit: 'kg',
          icon: 'scale-outline',
          color: '#FF6B6B',
        },
        {
          id: '2',
          title: 'Calories mỗi ngày',
          current: todayIntake,
          target: targetCalories,
          unit: 'kcal',
          icon: 'flame-outline',
          color: '#4ECDC4',
        },
        {
          id: '3',
          title: 'Protein',
          current: 0,
          target: Math.round(targetCalories * 0.3 / 4), // 30% of calories from protein
          unit: 'g',
          icon: 'fish-outline',
          color: '#95E1D3',
        },
        {
          id: '4',
          title: 'Nước uống',
          current: 0,
          target: 2.5,
          unit: 'lít',
          icon: 'water-outline',
          color: '#45B7D1',
        },
      ]);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mục tiêu</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mục tiêu</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <Text style={styles.summaryTitle}>Tổng quan</Text>
          </View>
          <Text style={styles.summaryText}>
            Bạn đang hoàn thành {goals.filter(g => getProgress(g.current, g.target) >= 100).length}/{goals.length} mục tiêu
          </Text>
        </View>

        {/* Goals List */}
        {goals.map((goal) => {
          const progress = getProgress(goal.current, goal.target);
          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                <Ionicons name={goal.icon} size={28} color={goal.color} />
              </View>
              
              <View style={styles.goalContent}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                
                <View style={styles.goalStats}>
                  <Text style={styles.goalCurrent}>
                    {goal.current} / {goal.target} {goal.unit}
                  </Text>
                  <Text style={[styles.goalProgress, { color: goal.color }]}>
                    {progress.toFixed(0)}%
                  </Text>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { backgroundColor: goal.color + '30' }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: goal.color }
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle" size={20} color="#4ECDC4" />
            <Text style={styles.tipsTitle}>Thông tin</Text>
          </View>
          <Text style={styles.tipsText}>
            Tất cả mục tiêu được tính tự động dựa trên hồ sơ của bạn. Để cập nhật, vui lòng chỉnh sửa thông tin trong mục Cài đặt.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  goalCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  goalIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  goalCurrent: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  tipsCard: {
    backgroundColor: '#E0F7FA',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796B',
  },
  tipsText: {
    fontSize: 14,
    color: '#00695C',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
