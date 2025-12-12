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
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { api, type WorkoutLog } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';

const EXERCISE_TYPES = [
  { id: 'running', name: 'Running', icon: '🏃', caloriesPerMin: 10 },
  { id: 'walking', name: 'Walking', icon: '🚶', caloriesPerMin: 5 },
  { id: 'cycling', name: 'Cycling', icon: '🚴', caloriesPerMin: 8 },
  { id: 'swimming', name: 'Swimming', icon: '🏊', caloriesPerMin: 11 },
  { id: 'yoga', name: 'Yoga', icon: '🧘', caloriesPerMin: 4 },
  { id: 'gym', name: 'Weight Training', icon: '🏋️', caloriesPerMin: 6 },
  { id: 'hiit', name: 'HIIT', icon: '💪', caloriesPerMin: 12 },
  { id: 'other', name: 'Other', icon: '⚡', caloriesPerMin: 5 },
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
      Alert.alert('Error', 'Please enter duration');
      return;
    }

    const durationMin = parseInt(duration);
    if (isNaN(durationMin) || durationMin <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
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
      Alert.alert('Success', 'Workout logged successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log workout');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkout = async (logId: number) => {
    Alert.alert('Delete Workout', 'Are you sure you want to delete this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteWorkoutLog(logId);
            await fetchWorkouts();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete');
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercises</Text>
        <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🔥</Text>
          <Text style={styles.summaryValue}>{totalCaloriesBurned}</Text>
          <Text style={styles.summaryLabel}>Calories Burned</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>⏱️</Text>
          <Text style={styles.summaryValue}>{totalDuration}</Text>
          <Text style={styles.summaryLabel}>Minutes</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💪</Text>
          <Text style={styles.summaryValue}>{workouts.length}</Text>
          <Text style={styles.summaryLabel}>Workouts</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>Today's Workouts</Text>
        
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <TouchableOpacity
              key={workout.log_id}
              style={styles.workoutCard}
              onLongPress={() => handleDeleteWorkout(workout.log_id)}
            >
              <View style={styles.workoutIcon}>
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
                <Text style={styles.workoutDuration}>{workout.duration_minutes} min</Text>
                <Text style={styles.workoutCalories}>
                  {workout.calories_burned_estimated} kcal
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏃</Text>
            <Text style={styles.emptyStateText}>No workouts today</Text>
            <Text style={styles.emptyStateSubtext}>
              Start moving to track your progress!
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
              <Text style={styles.modalTitle}>Log Workout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Exercise Type</Text>
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
                  <Text style={styles.label}>Exercise Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter exercise name"
                    placeholderTextColor={colors.textLight}
                    value={customName}
                    onChangeText={setCustomName}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Duration (minutes) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 30"
                  placeholderTextColor={colors.textLight}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>

              {duration && !isNaN(parseInt(duration)) && (
                <View style={styles.caloriesPreview}>
                  <Text style={styles.caloriesPreviewLabel}>Estimated calories burned:</Text>
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
                <Text style={styles.saveButtonText}>Log Workout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  workoutIconText: {
    fontSize: 24,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workoutTime: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  workoutCalories: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 18,
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
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
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
