// src/screens/progress/ProgressScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, subDays } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { api, type DailyStatistics } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [weeklyStats, setWeeklyStats] = useState<DailyStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');

  const fetchData = useCallback(async () => {
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');
      const statsRes = await api.getWeeklyStatistics(startDate, endDate);
      setWeeklyStats(statsRes);
    } catch (error: any) {
      console.error('Error fetching progress data:', error);
      
      // Kiểm tra nếu là lỗi 401 (Unauthorized)
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng xuất và đăng nhập lại.',
          [{ text: 'Đã hiểu' }]
        );
      }
      
      setWeeklyStats([]);
    }
  }, []);

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

  // Prepare chart data
  const caloriesData = weeklyStats.length > 0 
    ? weeklyStats.map((s) => s.total_calories || 0)
    : [0, 0, 0, 0, 0, 0, 0];
  const proteinData = weeklyStats.length > 0
    ? weeklyStats.map((s) => s.total_protein || 0)
    : [0, 0, 0, 0, 0, 0, 0];
  const carbsData = weeklyStats.length > 0
    ? weeklyStats.map((s) => s.total_carbs || 0)
    : [0, 0, 0, 0, 0, 0, 0];
  const fatData = weeklyStats.length > 0
    ? weeklyStats.map((s) => s.total_fat || 0)
    : [0, 0, 0, 0, 0, 0, 0];
  const labels = weeklyStats.length > 0
    ? weeklyStats.map((s) => format(new Date(s.date), 'dd/MM'))
    : ['', '', '', '', '', '', ''];

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => colors.textSecondary,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: colors.primary,
      fill: '#fff',
    },
  };

  // Calculate BMI
  const bmi = user?.weight_kg && user?.height_cm
    ? Number((user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1))
    : 0;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Thiếu cân', color: '#60A5FA' };
    if (bmi < 25) return { label: 'Bình thường', color: colors.primary };
    if (bmi < 30) return { label: 'Thừa cân', color: '#FBBF24' };
    return { label: 'Béo phì', color: '#EF4444' };
  };

  const bmiCategory = getBMICategory(bmi);

  // Calculate weekly totals
  const weeklyTotals = {
    calories: weeklyStats.reduce((sum, s) => sum + (s.total_calories || 0), 0),
    protein: weeklyStats.reduce((sum, s) => sum + (s.total_protein || 0), 0),
    carbs: weeklyStats.reduce((sum, s) => sum + (s.total_carbs || 0), 0),
    fat: weeklyStats.reduce((sum, s) => sum + (s.total_fat || 0), 0),
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Tiến trình</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* BMI Card */}
        <View style={styles.bmiCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Chỉ số BMI</Text>
          </View>
          <View style={styles.bmiContent}>
            <View style={styles.bmiLeft}>
              <Text style={styles.bmiValue}>{bmi || '--'}</Text>
              <View style={[styles.bmiBadge, { backgroundColor: bmiCategory.color + '15' }]}>
                <Text style={[styles.bmiBadgeText, { color: bmiCategory.color }]}>
                  {bmiCategory.label}
                </Text>
              </View>
            </View>
            <View style={styles.bmiRight}>
              <View style={styles.bmiDetail}>
                <Ionicons name="arrow-up" size={16} color={colors.textSecondary} />
                <Text style={styles.bmiDetailText}>Chiều cao: {user?.height_cm || '--'} cm</Text>
              </View>
              <View style={styles.bmiDetail}>
                <Ionicons name="scale" size={16} color={colors.textSecondary} />
                <Text style={styles.bmiDetailText}>Cân nặng: {user?.weight_kg || '--'} kg</Text>
              </View>
            </View>
          </View>
          <View style={styles.bmiScale}>
            <View style={[styles.bmiScaleItem, { backgroundColor: '#60A5FA' }]} />
            <View style={[styles.bmiScaleItem, { backgroundColor: colors.primary }]} />
            <View style={[styles.bmiScaleItem, { backgroundColor: '#FBBF24' }]} />
            <View style={[styles.bmiScaleItem, { backgroundColor: '#EF4444' }]} />
          </View>
        </View>

        {/* Chart Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calories' && styles.tabActive]}
            onPress={() => setActiveTab('calories')}
          >
            <Text style={[styles.tabText, activeTab === 'calories' && styles.tabTextActive]}>
              Calories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'protein' && styles.tabActive]}
            onPress={() => setActiveTab('protein')}
          >
            <Text style={[styles.tabText, activeTab === 'protein' && styles.tabTextActive]}>
              Protein
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'carbs' && styles.tabActive]}
            onPress={() => setActiveTab('carbs')}
          >
            <Text style={[styles.tabText, activeTab === 'carbs' && styles.tabTextActive]}>
              Carbs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'fat' && styles.tabActive]}
            onPress={() => setActiveTab('fat')}
          >
            <Text style={[styles.tabText, activeTab === 'fat' && styles.tabTextActive]}>
              Fat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          {weeklyStats.length > 0 ? (
            <LineChart
              data={{
                labels: labels,
                datasets: [{ 
                  data: activeTab === 'calories' ? caloriesData 
                      : activeTab === 'protein' ? proteinData
                      : activeTab === 'carbs' ? carbsData
                      : fatData
                }],
              }}
              width={width - spacing.md * 4}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
            />
          ) : (
            <View style={styles.noData}>
              <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.noDataText}>Chưa có dữ liệu</Text>
              <Text style={styles.noDataSubtext}>Ghi nhận bữa ăn để xem xu hướng dinh dưỡng</Text>
            </View>
          )}
        </View>

        {/* Weekly Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Tổng kết tuần</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={20} color="#EF4444" />
              <Text style={styles.statValue}>{weeklyTotals.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="barbell" size={20} color="#10B981" />
              <Text style={styles.statValue}>{weeklyTotals.protein}g</Text>
              <Text style={styles.statLabel}>Protein</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="nutrition" size={20} color="#FBBF24" />
              <Text style={styles.statValue}>{weeklyTotals.carbs}g</Text>
              <Text style={styles.statLabel}>Carbs</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="water" size={20} color="#60A5FA" />
              <Text style={styles.statValue}>{weeklyTotals.fat}g</Text>
              <Text style={styles.statLabel}>Fat</Text>
            </View>
          </View>
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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
    marginRight: -40,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  // BMI Card
  bmiCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bmiContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bmiLeft: {
    alignItems: 'flex-start',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bmiBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bmiBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bmiRight: {
    gap: spacing.sm,
  },
  bmiDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bmiDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bmiScale: {
    flexDirection: 'row',
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  bmiScaleItem: {
    flex: 1,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  // Chart
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  noData: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noDataSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
