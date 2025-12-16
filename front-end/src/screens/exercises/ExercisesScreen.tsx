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
  StatusBar,
  Linking,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { api, type WorkoutLog } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';

interface VideoExercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  muscleGroups: string[];
  difficulty: 'Người mới' | 'Trung bình' | 'Nâng cao';
  duration: number;
  calories: number;
}

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

const VIDEO_EXERCISES: VideoExercise[] = [
  {
    id: "YOGA_BEGINNER_01",
    name: "Yoga buổi sáng (20 phút)",
    description: "Một bài tập yoga buổi sáng nhẹ nhàng để khởi động ngày mới",
    videoUrl: "https://www.youtube.com/watch?v=4TLHLNX65-4",
    thumbnailUrl: "https://i.ytimg.com/vi/4TLHLNX65-4/maxresdefault.jpg",
    muscleGroups: ["Toàn thân", "Linh hoạt"],
    difficulty: "Người mới",
    duration: 20,
    calories: 80,
  },
  {
    id: "HIIT_FAT_LOSS_20",
    name: "HIIT đốt mỡ 20 phút",
    description: "Bài tập HIIT cường độ cao để đốt mỡ hiệu quả",
    videoUrl: "https://www.youtube.com/watch?v=zJKtwow2oBc",
    thumbnailUrl: "https://i.ytimg.com/vi/zJKtwow2oBc/maxresdefault.jpg",
    muscleGroups: ["Toàn thân", "Tim mạch"],
    difficulty: "Trung bình",
    duration: 20,
    calories: 350,
  },
  {
    id: "BEGINNER_ABS_01",
    name: "Bụng cơ bản 10 phút",
    description: "Bài tập bụng cho người mới bắt đầu, không cần dụng cụ",
    videoUrl: "https://www.youtube.com/watch?v=DHD1-2P94DI",
    thumbnailUrl: "https://i.ytimg.com/vi/DHD1-2P94DI/maxresdefault.jpg",
    muscleGroups: ["Thân", "Bụng"],
    difficulty: "Người mới",
    duration: 10,
    calories: 100,
  },
  {
    id: "FULL_BODY_STRENGTH_01",
    name: "Tăng sức mạnh toàn thân",
    description: "Tập sức mạnh toàn thân với tạ dumbbell",
    videoUrl: "https://www.youtube.com/watch?v=_jGebGZnYrU",
    thumbnailUrl: "https://i.ytimg.com/vi/_jGebGZnYrU/maxresdefault.jpg",
    muscleGroups: ["Toàn thân", "Sức mạnh"],
    difficulty: "Trung bình",
    duration: 45,
    calories: 320,
  },
  {
    id: "PLANK_BEGINNER_01",
    name: "Plank cơ bản cho người mới",
    description: "Hướng dẫn bài tập plank cơ bản cho người mới",
    videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    thumbnailUrl: "https://i.ytimg.com/vi/ASdvN_XEl_c/maxresdefault.jpg",
    muscleGroups: ["Thân", "Bụng"],
    difficulty: "Người mới",
    duration: 15,
    calories: 150,
  },
  {
    id: "CHEST_WORKOUT_01",
    name: "Ngực & tay sau 15 phút",
    description: "Bài tập ngực và tay sau hiệu quả với dumbbells",
    videoUrl: "https://www.youtube.com/watch?v=AiwbOqWfqvE",
    thumbnailUrl: "https://i.ytimg.com/vi/AiwbOqWfqvE/maxresdefault.jpg",
    muscleGroups: ["Ngực", "Tay sau"],
    difficulty: "Trung bình",
    duration: 15,
    calories: 200,
  },
];

export default function ExercisesScreen() {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Tất cả' | 'Người mới' | 'Trung bình' | 'Nâng cao'>('Tất cả');
  const [selectedVideo, setSelectedVideo] = useState<VideoExercise | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

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
      const load = async () => {
        setLoading(true);
        await fetchWorkouts();
        setLoading(false);
      };
      load();
    }, [fetchWorkouts])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  };

  const handleVideoPress = (video: VideoExercise) => {
    setSelectedVideo(video);
    setVideoModalVisible(true);
  };

  const handleStartWorkout = async () => {
    if (!selectedVideo) return;

    try {
      // Mở video YouTube
      await Linking.openURL(selectedVideo.videoUrl);
      
      // Tự động thêm workout log
      const workoutData = {
        exercise_name: selectedVideo.name,
        duration_minutes: selectedVideo.duration,
        calories_burned_estimated: selectedVideo.calories,
      };

      await api.addWorkoutLog(workoutData);
      Alert.alert('Thành công', 'Bài tập đã được ghi nhận! Chúc bạn tập luyện hiệu quả 💪');
      
      setVideoModalVisible(false);
      setSelectedVideo(null);
      fetchWorkouts(); // Refresh danh sách
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('Lỗi', 'Không thể ghi nhận bài tập');
    }
  };

  const handleWatchOnly = async () => {
    if (!selectedVideo) return;
    
    try {
      await Linking.openURL(selectedVideo.videoUrl);
      setVideoModalVisible(false);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error opening video:', error);
      Alert.alert('Lỗi', 'Không thể mở video');
    }
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

  const filteredVideos = selectedDifficulty === 'Tất cả' 
    ? VIDEO_EXERCISES 
    : VIDEO_EXERCISES.filter(v => v.difficulty === selectedDifficulty);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Bài tập</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🔥</Text>
          <Text style={styles.summaryValue}>{totalCaloriesBurned}</Text>
          <Text style={styles.summaryLabel}>Calo đốt</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>⏱️</Text>
          <Text style={styles.summaryValue}>{totalDuration}</Text>
          <Text style={styles.summaryLabel}>Phút</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💪</Text>
          <Text style={styles.summaryValue}>{workouts.length}</Text>
          <Text style={styles.summaryLabel}>Bài tập</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Video Workout Section */}
        <View style={styles.videoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Video bài tập gợi ý</Text>
            <View style={styles.filterButtons}>
              {(['Tất cả', 'Người mới', 'Trung bình', 'Nâng cao'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterBtn,
                    selectedDifficulty === level && styles.filterBtnActive,
                  ]}
                  onPress={() => setSelectedDifficulty(level)}
                >
                  <Text
                    style={[
                      styles.filterBtnText,
                      selectedDifficulty === level && styles.filterBtnTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {filteredVideos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoScroll}>
              {filteredVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => handleVideoPress(video)}
                >
                  <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumbnail} />
                  <View style={styles.videoBadge}>
                    <Ionicons name="play-circle" size={24} color="#fff" />
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoName} numberOfLines={2}>{video.name}</Text>
                    <View style={styles.videoMeta}>
                      <View style={styles.videoMetaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.videoMetaText}>{video.duration} min</Text>
                      </View>
                      <View style={styles.videoMetaItem}>
                        <Ionicons name="flame-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.videoMetaText}>{video.calories} kcal</Text>
                      </View>
                    </View>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{video.difficulty}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyVideoState}>
              <Text style={styles.emptyVideosText}>
                Không có video nào cho độ khó "{selectedDifficulty}"
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Bài tập hôm nay</Text>
        
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

      {/* Video Action Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={videoModalVisible}
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoActionModal}>
            {selectedVideo && (
              <>
                <Text style={styles.videoActionTitle}>{selectedVideo.name}</Text>
                <View style={styles.videoActionStats}>
                  <View style={styles.videoActionStat}>
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                    <Text style={styles.videoActionStatText}>{selectedVideo.duration} phút</Text>
                  </View>
                  <View style={styles.videoActionStat}>
                    <Ionicons name="flame-outline" size={20} color="#ef4444" />
                    <Text style={styles.videoActionStatText}>{selectedVideo.calories} kcal</Text>
                  </View>
                </View>
                <Text style={styles.videoActionDescription}>{selectedVideo.description}</Text>

                <View style={styles.videoActionButtons}>
                  <TouchableOpacity
                    style={[styles.videoActionBtn, styles.videoActionBtnPrimary]}
                    onPress={handleStartWorkout}
                  >
                    <Ionicons name="fitness" size={20} color="#fff" />
                    <Text style={styles.videoActionBtnTextPrimary}>Bắt đầu tập</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.videoActionBtn, styles.videoActionBtnSecondary]}
                    onPress={handleWatchOnly}
                  >
                    <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
                    <Text style={styles.videoActionBtnTextSecondary}>Chỉ xem</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.videoActionClose}
                  onPress={() => setVideoModalVisible(false)}
                >
                  <Text style={styles.videoActionCloseText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  headerSpacer: {
    width: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  videoSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  videoScroll: {
    marginBottom: spacing.md,
  },
  emptyVideoState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyVideosText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  videoCard: {
    width: 280,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoThumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background,
  },
  videoBadge: {
    position: 'absolute',
    top: 60,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: spacing.md,
  },
  videoName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    height: 40,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  videoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyVideos: {
    width: 280,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginRight: spacing.md,
  },
  emptyVideosText: {
    fontSize: 14,
    color: colors.textSecondary,
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
    bottom: 40,
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
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  videoActionModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  videoActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  videoActionStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  videoActionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  videoActionStatText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  videoActionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  videoActionButtons: {
    gap: spacing.md,
  },
  videoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  videoActionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  videoActionBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  videoActionBtnTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoActionBtnTextSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  videoActionClose: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  videoActionCloseText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
