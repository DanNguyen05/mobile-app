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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, subDays } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';

import { useAuth } from '../../context/AuthContext';
import { api, type BodyMeasurement, type DailyStatistics } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<DailyStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'weight' | 'calories'>('weight');

  const fetchData = useCallback(async () => {
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');

      // Temporarily skip body measurements until backend implements it
      const statsRes = await api.getWeeklyStatistics(startDate, endDate);
      
      setMeasurements([]); // Empty for now
      setWeeklyStats(statsRes);
    } catch (error: any) {
      console.error('Error fetching progress data:', error);
      // Set empty data on error instead of showing error to user
      setWeeklyStats([]);
      setMeasurements([]);
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
  const weightData = measurements.slice(-7).map((m) => m.weight_kg);
  const weightLabels = measurements.slice(-7).map((m) => format(new Date(m.measured_at), 'dd/MM'));

  const caloriesData = weeklyStats.map((s) => s.total_calories);
  const caloriesLabels = weeklyStats.map((s) => format(new Date(s.date), 'dd/MM'));

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => colors.textSecondary,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  // Calculate BMI
  const bmi = user?.weight_kg && user?.height_cm
    ? Number((user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1))
    : 0;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Thiếu cân', color: '#60A5FA' };
    if (bmi < 25) return { label: 'Bình thường', color: '#10B981' };
    if (bmi < 30) return { label: 'Thừa cân', color: '#FBBF24' };
    return { label: 'Béo phì', color: '#EF4444' };
  };

  const bmiCategory = getBMICategory(bmi);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tiến trình</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* BMI Card */}
        <View style={styles.bmiCard}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiTitle}>Chỉ số khối cơ thể (BMI)</Text>
            <View style={[styles.bmiBadge, { backgroundColor: bmiCategory.color + '20' }]}>
              <Text style={[styles.bmiBadgeText, { color: bmiCategory.color }]}>
                {bmiCategory.label}
              </Text>
            </View>
          </View>
          <View style={styles.bmiContent}>
            <Text style={styles.bmiValue}>{bmi || '--'}</Text>
            <View style={styles.bmiDetails}>
              <Text style={styles.bmiDetailText}>Chiều cao: {user?.height_cm || '--'} cm</Text>
              <Text style={styles.bmiDetailText}>Cân nặng: {user?.weight_kg || '--'} kg</Text>
            </View>
          </View>
          <View style={styles.bmiScale}>
            <View style={[styles.bmiScaleItem, { backgroundColor: '#60A5FA' }]} />
            <View style={[styles.bmiScaleItem, { backgroundColor: '#10B981' }]} />
            <View style={[styles.bmiScaleItem, { backgroundColor: '#FBBF24' }]} />
            <View style={[styles.bmiScaleItem, { backgroundColor: '#EF4444' }]} />
          </View>
          <View style={styles.bmiLabels}>
            <Text style={styles.bmiLabel}>Thiếu</Text>
            <Text style={styles.bmiLabel}>Bình thường</Text>
            <Text style={styles.bmiLabel}>Thừa</Text>
            <Text style={styles.bmiLabel}>Béo</Text>
          </View>
        </View>

        {/* Chart Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'weight' && styles.tabActive]}
            onPress={() => setActiveTab('weight')}
          >
            <Text style={[styles.tabText, activeTab === 'weight' && styles.tabTextActive]}>
              Biển đổi cân nặng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calories' && styles.tabActive]}
            onPress={() => setActiveTab('calories')}
          >
            <Text style={[styles.tabText, activeTab === 'calories' && styles.tabTextActive]}>
              Calories nạp vào
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          {activeTab === 'weight' ? (
            weightData.length > 0 ? (
              <LineChart
                data={{
                  labels: weightLabels,
                  datasets: [{ data: weightData }],
                }}
                width={width - spacing.md * 4}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.noData}>
                <Text style={styles.noDataText}>Chưa có dữ liệu cân nặng</Text>
                <Text style={styles.noDataSubtext}>Ghi nhận đo lường để xem xu hướng</Text>
              </View>
            )
          ) : caloriesData.length > 0 ? (
            <LineChart
              data={{
                labels: caloriesLabels,
                datasets: [{ data: caloriesData }],
              }}
              width={width - spacing.md * 4}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(249, 158, 11, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>Chưa có dữ liệu calories</Text>
              <Text style={styles.noDataSubtext}>Ghi nhận bữa ăn để xem xu hướng</Text>
            </View>
          )}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Tổng kết tuần này</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Calo TB</Text>
              <Text style={styles.statValue}>
                {weeklyStats.length > 0
                  ? Math.round(
                      weeklyStats.reduce((sum, s) => sum + s.total_calories, 0) / weeklyStats.length
                    )
                  : '--'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Protein TB</Text>
              <Text style={styles.statValue}>
                {weeklyStats.length > 0
                  ? Math.round(
                      weeklyStats.reduce((sum, s) => sum + s.total_protein, 0) / weeklyStats.length
                    ) + 'g'
                  : '--'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tổng bài tập</Text>
              <Text style={styles.statValue}>
                {weeklyStats.reduce((sum, s) => sum + (s.workouts_count || 0), 0)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Calo đốt</Text>
              <Text style={styles.statValue}>
                {weeklyStats.reduce((sum, s) => sum + (s.calories_burned || 0), 0)}
              </Text>
            </View>
          </View>
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
    padding: spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  bmiCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bmiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  bmiBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  bmiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bmiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.lg,
  },
  bmiDetails: {},
  bmiDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bmiScale: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  bmiScaleItem: {
    flex: 1,
  },
  bmiLabels: {
    flexDirection: 'row',
  },
  bmiLabel: {
    flex: 1,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md - 2,
    alignItems: 'center',
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
    color: colors.surface,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  noData: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  noDataSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: (width - spacing.md * 3) / 2 - spacing.sm / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
});
