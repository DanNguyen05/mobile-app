// src/screens/dashboard/DashboardScreen.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useAuth } from '../../context/AuthContext';
import { api, type User, type DailyStatistics, type FoodLog, type WorkoutLog } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import { StatCard } from '../../components/StatCard';
import { NutritionChart } from '../../components/NutritionChart';
import { MealCard } from '../../components/MealCard';

// Import articles from Health Insights
import type { Article } from '../healthInsights/HealthInsightsScreen';
const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Chế độ ăn Địa Trung Hải: Bí quyết sống lâu và khỏe mạnh',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    author: 'Dr. Nguyễn Minh',
    readTime: 8,
    excerpt: 'Tìm hiểu về chế độ ăn được khoa học công nhận là tốt nhất cho sức khỏe tim mạch và tuổi thọ.',
    content: '',
    tags: ['dinh dưỡng', 'tim mạch', 'tuổi thọ'],
    isFeatured: true,
    publishedDate: '10/12/2025',
  },
  {
    id: '2',
    title: 'Lợi ích của việc tập Yoga mỗi ngày',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    author: 'Lê Thu Hà',
    readTime: 6,
    excerpt: 'Khám phá những lợi ích tuyệt vời mà Yoga mang lại cho cả thể chất và tinh thần.',
    content: '',
    tags: ['yoga', 'thư giãn', 'sức khỏe tâm thần'],
    isFeatured: true,
    publishedDate: '09/12/2025',
  },
  {
    id: '3',
    title: 'Protein: Nên ăn bao nhiêu mỗi ngày?',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
    author: 'BS. Trần Văn Hùng',
    readTime: 5,
    excerpt: 'Hướng dẫn chi tiết về lượng protein cần thiết cho từng đối tượng và mục tiêu sức khỏe.',
    content: '',
    tags: ['protein', 'dinh dưỡng', 'cơ bắp'],
    publishedDate: '08/12/2025',
  },
  {
    id: '4',
    title: 'HIIT vs Cardio: Phương pháp nào tốt hơn?',
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    author: 'HLV Phạm Đức',
    readTime: 7,
    excerpt: 'So sánh chi tiết giữa tập luyện cường độ cao và cardio truyền thống.',
    content: '',
    tags: ['HIIT', 'cardio', 'giảm cân'],
    isFeatured: true,
    publishedDate: '07/12/2025',
  },
  {
    id: '5',
    title: 'Giấc ngủ và sức khỏe: Mối liên hệ quan trọng',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
    author: 'Dr. Hoàng Mai',
    readTime: 9,
    excerpt: 'Tại sao giấc ngủ chất lượng là chìa khóa cho sức khỏe tổng thể.',
    content: '',
    tags: ['giấc ngủ', 'sức khỏe', 'phục hồi'],
    publishedDate: '06/12/2025',
  },
];

const { width } = Dimensions.get('window');

// Time-based greeting helper
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Chào buổi sáng', emoji: '🌅' };
  if (hour < 18) return { text: 'Chào buổi chiều', emoji: '☀️' };
  return { text: 'Chào buổi tối', emoji: '🌙' };
};

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

type RootStackParamList = {
  FoodLog: undefined;
  WorkoutLog: undefined;
  HealthInsights: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [todayStats, setTodayStats] = useState<DailyStatistics | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealItem[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(7); // Mock data - sẽ lấy từ API sau
  const progressAnim = useRef(new Animated.Value(0)).current;

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
        image: log.image_url ?? (log as any).imageUrl,
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

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

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

  // Tính trực tiếp nutrition từ meals để đảm bảo real-time update
  const totalNutrition = useMemo(() => {
    return todayMeals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
        calories: acc.calories + meal.calories,
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
  }, [todayMeals]);

  // Animate progress bar
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: Math.min(calorieIntakePercent, 100),
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [calorieIntakePercent]);

  // Motivational message dựa trên tiến độ
  const getMotivationalMessage = () => {
    const remaining = tdee - totalNutrition.calories;
    if (calorieIntakePercent >= 100) {
      return totalNutrition.calories > tdee + 200 
        ? { icon: '⚠️', text: `Đã vượt ${totalNutrition.calories - tdee} kcal`, color: colors.warning }
        : { icon: '🎉', text: 'Hoàn thành mục tiêu hôm nay!', color: colors.success };
    } else if (calorieIntakePercent >= 80) {
      return { icon: '🔥', text: `Sắp đạt mục tiêu! Còn ${remaining} kcal`, color: colors.primary };
    } else if (calorieIntakePercent >= 50) {
      return { icon: '💪', text: `Đang tiến bộ tốt! Còn ${remaining} kcal`, color: colors.primary };
    } else {
      return { icon: '🌟', text: `Bắt đầu thôi! Còn ${remaining} kcal`, color: colors.textSecondary };
    }
  };

  const message = getMotivationalMessage();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tổng quan</Text>
      </View>
      
      {/* Colorful Background Gradient */}
      <LinearGradient
        colors={['#E0F2F1', '#F1F8E9', '#FFF3E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      
      <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Enhanced Header */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {(user?.name || 'B').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingTime}>
                    {getTimeBasedGreeting().emoji} {getTimeBasedGreeting().text}
                  </Text>
                  <Text style={styles.greetingName}>{user?.name || 'Bạn'}!</Text>
                  <Text style={styles.greetingDate}>
                    {format(new Date(), 'EEEE, d MMMM yyyy')}
                  </Text>
                </View>
              </View>
              
              {/* Quick Mini Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <Ionicons name="flame" size={16} color="#fff" />
                  <Text style={styles.quickStatValue}>{currentStreak}</Text>
                </View>
                <View style={styles.quickStat}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.quickStatValue}>1</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Summary Card với Progress Bar */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Calo hôm nay</Text>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{calorieIntakePercent}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    calorieIntakePercent > 100
                      ? ['#f59e0b', '#ef4444']
                      : calorieIntakePercent >= 80
                      ? ['#10b981', '#059669']
                      : ['#3b82f6', '#10b981']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationIcon}>{message.icon}</Text>
            <Text style={[styles.motivationText, { color: message.color }]}>
              {message.text}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalNutrition.calories || 0}</Text>
              <Text style={styles.summaryLabel}>Đã nạp</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{tdee}</Text>
              <Text style={styles.summaryLabel}>Mục tiêu</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{todayStats?.calories_burned || 0}</Text>
              <Text style={styles.summaryLabel}>Đã đốt</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid - 1 Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="body-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{user?.weight_kg || '--'} kg</Text>
            <Text style={styles.statLabel}>Cân nặng</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="analytics-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{bmi || '--'}</Text>
            <Text style={styles.statLabel}>BMI</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="fast-food-outline" size={20} color={colors.protein} />
            </View>
            <Text style={styles.statValue}>{Math.round(totalNutrition.protein)}g</Text>
            <Text style={styles.statLabel}>Protein</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF4E6' }]}>
              <Ionicons name="nutrition-outline" size={20} color={colors.carbs} />
            </View>
            <Text style={styles.statValue}>{Math.round(totalNutrition.carbs)}g</Text>
            <Text style={styles.statLabel}>Carbs</Text>
          </View>
        </View>

        {/* Nutrition Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dinh dưỡng hôm nay</Text>
          <View style={styles.chartCard}>
            <NutritionChart
              protein={totalNutrition.protein}
              carbs={totalNutrition.carbs}
              fat={totalNutrition.fat}
              calories={totalNutrition.calories}
              tdee={tdee}
            />
          </View>
        </View>

        {/* Recent Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài tập gần đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WorkoutLog')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((workout) => (
              <TouchableOpacity key={workout.log_id} style={styles.workoutCard}>
                <View style={styles.workoutIconContainer}>
                  <Ionicons name="barbell-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.exercise_name}</Text>
                  <Text style={styles.workoutStats}>
                    {workout.calories_burned_estimated} kcal • {workout.duration_minutes} phút
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyStateText}>Chưa có bài tập nào hôm nay</Text>
              <Text style={styles.emptyStateSubtext}>Bắt đầu tập luyện để theo dõi tiến trình!</Text>
            </View>
          )}
        </View>

        {/* Today's Meals - Horizontal Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bữa ăn hôm nay</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FoodLog')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {todayMeals.length > 0 ? (
            <FlatList
              data={todayMeals}
              renderItem={({ item }: { item: MealItem }) => (
                <View style={styles.mealCardWrapper}>
                  <MealCard meal={item} />
                </View>
              )}
              keyExtractor={(item: MealItem) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mealsCarousel}
              snapToInterval={width - spacing.md * 3}
              decelerationRate="fast"
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyStateText}>Chưa ghi nhận bữa ăn nào</Text>
              <Text style={styles.emptyStateSubtext}>Ghi nhận dinh dưỡng để đạt mục tiêu!</Text>
            </View>
          )}
        </View>

        {/* Kiến thức sức khỏe */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Kiến thức sức khỏe</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HealthInsights')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {ARTICLES.slice(0, 5).map((article) => (
            <TouchableOpacity key={article.id} style={styles.articleCard}>
              <Image source={{ uri: article.image }} style={styles.articleImage} />
              <View style={styles.articleContent}>
                <View style={styles.articleHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {article.category === 'nutrition' ? '🥗 Dinh dưỡng' :
                       article.category === 'wellness' ? '🧘 Sức khỏe' : '🏋️ Tập luyện'}
                    </Text>
                  </View>
                  <View style={styles.readTimeContainer}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.readTime}>{article.readTime} phút</Text>
                  </View>
                </View>
                <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.articleExcerpt} numberOfLines={2}>{article.excerpt}</Text>
                <View style={styles.articleFooter}>
                  <Text style={styles.articleAuthor}>{article.author}</Text>
                  <Text style={styles.articleDate}>{article.publishedDate}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    top: 200,
    left: -30,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(251, 146, 60, 0.06)',
    bottom: 100,
    right: -40,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 140,
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
  // Enhanced Header
  headerCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerGradient: {
    padding: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingTime: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  greetingDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickStats: {
    gap: spacing.sm,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  // Summary Card
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBackground: {
    height: 14,
    backgroundColor: 'rgba(229, 231, 235, 0.6)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  progressBar: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
    borderRadius: borderRadius.full,
  },
  motivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(236, 253, 245, 0.8)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  motivationIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  percentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  percentText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  // Stats Grid - 1 Row with 4 Columns
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  // Streak & Achievements
  streakCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  streakCardGradient: {
    padding: spacing.lg,
  },
  streakGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  streakEmoji: {
    fontSize: 40,
    marginRight: spacing.sm,
    lineHeight: 40,
  },
  streakInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f97316',
    lineHeight: 30,
  },
  streakText: {
    fontSize: 13,
    color: '#92400e',
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(251, 146, 60, 0.2)',
    gap: spacing.xs,
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  badgeLocked: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 26,
    marginBottom: 4,
    lineHeight: 28,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
  badgeLabelLocked: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Section
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
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  // Meals Carousel
  mealsCarousel: {
    paddingRight: spacing.md,
  },
  mealCardWrapper: {
    width: width - spacing.md * 4,
    marginRight: spacing.sm,
  },
  // Article Cards
  articleCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  articleImage: {
    width: 120,
    height: 120,
    backgroundColor: colors.border,
  },
  articleContent: {
    flex: 1,
    padding: spacing.md,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  articleExcerpt: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  articleDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  // Workout Card
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.12)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  workoutStats: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Empty State
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
