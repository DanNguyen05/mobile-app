// src/screens/exercises/ExercisesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { api, type WorkoutLog } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import ScreenBackground from '../../components/ScreenBackground';
import { LinearGradient } from 'expo-linear-gradient';

const EXERCISE_TYPES = [
  { id: 'running', name: 'Chạy bộ', icon: '🏃', caloriesPerMin: 10 },
  { id: 'walking', name: 'Đi bộ', icon: '🚶', caloriesPerMin: 5 },
  { id: 'cycling', name: 'Đạp xe', icon: '🚴', caloriesPerMin: 8 },
  { id: 'swimming', name: 'Bơi lội', icon: '🏊', caloriesPerMin: 11 },
  { id: 'yoga', name: 'Yoga', icon: '🧘', caloriesPerMin: 4 },
  { id: 'gym', name: 'Tập tạ', icon: '🏋️', caloriesPerMin: 6 },
  { id: 'hiit', name: 'HIIT', icon: '💪', caloriesPerMin: 12 },
  { id: 'other', name: 'Khác', icon: '⚡', caloriesPerMin: 5 },
];

export default function ExercisesScreen() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedExercise, setSelectedExercise] = useState(EXERCISE_TYPES[0]);
  const [duration, setDuration] = useState('');
  const [customName, setCustomName] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchWorkouts = useCallback(async () => {
    try {
      const logs = await api.getWorkoutLog();
      const todayLogs = logs.filter(
        (log) => format(new Date(log.completed_at), 'yyyy-MM-dd') === today
      );
      setWorkouts(todayLogs.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      ));
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  }, [today]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchWorkouts();
      setLoading(false);
    };
    load();
  }, [fetchWorkouts]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [fetchWorkouts])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  };

  const resetForm = () => {
    setSelectedExercise(EXERCISE_TYPES[0]);
    setDuration('');
    setCustomName('');
  };

  const handleAddWorkout = async () => {
    if (!duration) {
      Alert.alert('Lỗi', 'Vui lòng nhập thời lượng');
      return;
    }

    const durationMin = parseInt(duration);
    if (isNaN(durationMin) || durationMin <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập thời lượng hợp lệ');
      return;
    }

    setSaving(true);
    try {
      const exerciseName = selectedExercise.id === 'other' && customName 
        ? customName 
        : selectedExercise.name;
      
      await api.addWorkoutLog({
        exercise_name: exerciseName,
        duration_minutes: durationMin,
        calories_burned_estimated: durationMin * selectedExercise.caloriesPerMin,
        completed_at: new Date().toISOString(),
      });
      resetForm();
      setModalVisible(false);
      await fetchWorkouts();
      Alert.alert('Thành công', 'Ghi nhận bài tập thành công!');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể ghi nhận bài tập');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkout = async (logId: number) => {
    Alert.alert('Xóa bài tập', 'Bạn có chắc chắn muốn xóa bài tập này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteWorkoutLog(logId);
            await fetchWorkouts();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể xóa');
          }
        },
      },
    ]);
  };

  // Calculate totals
  const totalCaloriesBurned = workouts.reduce((sum, w) => sum + w.calories_burned_estimated, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        {/* Header with gradient */}
        <LinearGradient
          colors={['#FF6B6B', '#EE5A52']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>💪 Bài tập</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
        </LinearGradient>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.summaryIcon}>🔥</Text>
            </View>
            <Text style={styles.summaryValue}>{totalCaloriesBurned}</Text>
            <Text style={styles.summaryLabel}>Calo đốt</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFB84D' }]}>
              <Text style={styles.summaryIcon}>⏱️</Text>
            </View>
            <Text style={styles.summaryValue}>{totalDuration}</Text>
            <Text style={styles.summaryLabel}>Phút</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#10b981' }]}>
              <Text style={styles.summaryIcon}>💪</Text>
            </View>
            <Text style={styles.summaryValue}>{workouts.length}</Text>
            <Text style={styles.summaryLabel}>Bài tập</Text>
          </View>
        </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏃 Bài tập hôm nay</Text>
          <Text style={styles.sectionCount}>{workouts.length} bài</Text>
        </View>
        
        {workouts.length > 0 ? (
          <View style={styles.workoutsContainer}>
            {workouts.map((workout) => (
              <TouchableOpacity
                key={workout.log_id}
                style={styles.workoutCard}
                onLongPress={() => handleDeleteWorkout(workout.log_id)}
              >
                <View style={styles.workoutIconBig}>
                  <Text style={styles.workoutIconText}>
                    {EXERCISE_TYPES.find(e => 
                      e.name.toLowerCase() === workout.exercise_name.toLowerCase()
                    )?.icon || '⚡'}
                  </Text>
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.exercise_name}</Text>
                  <Text style={styles.workoutTime}>
                    {format(new Date(workout.completed_at), 'h:mm a')}
                  </Text>
                </View>
                <View style={styles.workoutStats}>
                  <View style={styles.statBadge}>
                    <Text style={styles.workoutDuration}>{workout.duration_minutes} min</Text>
                  </View>
                  <View style={[styles.statBadge, { backgroundColor: '#FFF7ED' }]}>
                    <Text style={styles.workoutCalories}>
                      {workout.calories_burned_estimated} kcal
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏃</Text>
            <Text style={styles.emptyStateText}>Chưa có bài tập nào hôm nay</Text>
            <Text style={styles.emptyStateSubtext}>
              Bắt đầu vận động để theo dõi tiến trình!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>

      {/* Add Workout Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ghi nhận bài tập</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Loại bài tập</Text>
              <View style={styles.exerciseGrid}>
                {EXERCISE_TYPES.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseCard,
                      selectedExercise.id === exercise.id && styles.exerciseCardActive,
                    ]}
                    onPress={() => setSelectedExercise(exercise)}
                  >
                    <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                    <Text style={[
                      styles.exerciseName,
                      selectedExercise.id === exercise.id && styles.exerciseNameActive,
                    ]}>
                      {exercise.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedExercise.id === 'other' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tên bài tập</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tên bài tập"
                    placeholderTextColor={colors.textLight}
                    value={customName}
                    onChangeText={setCustomName}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Thời lượng (phút) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 30"
                  placeholderTextColor={colors.textLight}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>

              {duration && !isNaN(parseInt(duration)) && (
                <View style={styles.caloriesPreview}>
                  <Text style={styles.caloriesPreviewLabel}>Dự kiến đốt calo:</Text>
                  <Text style={styles.caloriesPreviewValue}>
                    ~{parseInt(duration) * selectedExercise.caloriesPerMin} kcal
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleAddWorkout}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.saveButtonText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: 'rgba(255,107,107,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workoutsContainer: {
    gap: spacing.sm,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutIconBig: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,107,107,0.2)',
  },
  workoutIconText: {
    fontSize: 26,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  workoutTime: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  workoutStats: {
    gap: 6,
    alignItems: 'flex-end',
  },
  statBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workoutDuration: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
  },
  workoutCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,107,0.1)',
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
    opacity: 0.5,
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
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopLeftRadius: borderRadius.xl * 1.5,
    borderTopRightRadius: borderRadius.xl * 1.5,
    borderWidth: 2,
    borderColor: 'rgba(255,107,107,0.2)',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  exerciseCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  exerciseCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  exerciseIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exerciseNameActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  caloriesPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  caloriesPreviewLabel: {
    fontSize: 14,
    color: colors.text,
  },
  caloriesPreviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
