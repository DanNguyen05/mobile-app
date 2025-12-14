// src/screens/foodDiary/FoodDiaryScreen.tsx
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { api, type FoodLog } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import { MealCard } from '../../components/MealCard';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export default function FoodDiaryScreen() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  } | null>(null);

  // Form state
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('Breakfast');

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchFoodLogs = useCallback(async () => {
    try {
      const logs = await api.getFoodLog();
      console.log('📊 API Response:', logs);
      console.log('📊 Is Array?', Array.isArray(logs));
      
      if (!Array.isArray(logs)) {
        console.warn('⚠️ API did not return an array, setting empty array');
        setFoodLogs([]);
        return;
      }
      
      const todayLogs = logs.filter(
        (log) => format(new Date(log.eaten_at), 'yyyy-MM-dd') === today
      );
      console.log('📊 Today logs:', todayLogs);
      setFoodLogs(todayLogs);
    } catch (error) {
      console.error('❌ Error fetching food logs:', error);
      setFoodLogs([]);
    }
  }, [today]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchFoodLogs();
      setLoading(false);
    };
    load();
  }, [fetchFoodLogs]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFoodLogs();
    }, [fetchFoodLogs])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoodLogs();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setMealType('Breakfast');
    setSelectedImage(null);
    setAiResult(null);
  };

  const analyzeImage = async (imageUri: string) => {
    setAnalyzingImage(true);
    try {
      // Simulate AI analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI response - in production, call actual AI API
      const mockResults = [
        { foodName: 'Gà nướng với quinoa', calories: 680, protein: 48, carbs: 45, fat: 28, confidence: 95 },
        { foodName: 'Cá hồi nướng với khoai lang', calories: 650, protein: 45, carbs: 52, fat: 22, confidence: 92 },
        { foodName: 'Salad gà với rau xanh', calories: 420, protein: 38, carbs: 25, fat: 18, confidence: 88 },
        { foodName: 'Bò xào với bông cải xanh', calories: 670, protein: 52, carbs: 28, fat: 35, confidence: 90 },
        { foodName: 'Cơm gà', calories: 550, protein: 35, carbs: 65, fat: 15, confidence: 85 },
      ];
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setAiResult(randomResult);
      
      // Pre-fill form with AI results
      setFoodName(randomResult.foodName);
      setCalories(String(randomResult.calories));
      setProtein(String(randomResult.protein));
      setCarbs(String(randomResult.carbs));
      setFat(String(randomResult.fat));
      
      setShowImageModal(false);
      setModalVisible(true);
      
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phân tích ảnh. Vui lòng thử lại.');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần cấp quyền sử dụng camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowImageModal(true);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowImageModal(true);
    }
  };

  const handleImageOptions = () => {
    Alert.alert(
      'Thêm ảnh đồ ăn',
      'Chọn nguồn ảnh',
      [
        { text: 'Chụp ảnh', onPress: handleTakePhoto },
        { text: 'Chọn từ thư viện', onPress: handlePickImage },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleAddFood = async () => {
    if (!foodName || !calories) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món ăn và calories');
      return;
    }

    setSaving(true);
    try {
      await api.addFoodLog({
        food_name: foodName,
        calories: parseInt(calories),
        protein_g: parseFloat(protein) || 0,
        carbs_g: parseFloat(carbs) || 0,
        fat_g: parseFloat(fat) || 0,
        meal_type: mealType,
        eaten_at: new Date().toISOString(),
      });
      
      // Close modal and reset form first
      setModalVisible(false);
      resetForm();
      
      // Then fetch updated data
      await fetchFoodLogs();
      
      // Show success message after UI updates
      setTimeout(() => {
        Alert.alert('Thành công', 'Ghi nhận món ăn thành công!');
      }, 300);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể ghi nhận món ăn');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFood = async (logId: number) => {
    Alert.alert('Xóa món ăn', 'Bạn có chắc chắn muốn xóa món ăn này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteFoodLog(logId);
            await fetchFoodLogs();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể xóa');
          }
        },
      },
    ]);
  };

  // Calculate totals
  const totals = Array.isArray(foodLogs) ? foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein_g || 0),
      carbs: acc.carbs + (log.carbs_g || 0),
      fat: acc.fat + (log.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // Group by meal type
  const groupedMeals = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = Array.isArray(foodLogs) ? foodLogs.filter((log) => log.meal_type === type) : [];
    return acc;
  }, {} as Record<string, FoodLog[]>);

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
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Nhật ký ăn uống</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng kết hôm nay</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.calories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.protein }]}>
              {Math.round(totals.protein)}g
            </Text>
            <Text style={styles.summaryLabel}>Protein</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.carbs }]}>
              {Math.round(totals.carbs)}g
            </Text>
            <Text style={styles.summaryLabel}>Carbs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.fat }]}>
              {Math.round(totals.fat)}g
            </Text>
            <Text style={styles.summaryLabel}>Béo</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {MEAL_TYPES.map((type) => (
          <View key={type} style={styles.mealSection}>
            <Text style={styles.mealTypeTitle}>{type}</Text>
            {groupedMeals[type]?.length > 0 ? (
              groupedMeals[type]?.map((log) => (
                <TouchableOpacity
                  key={log.log_id}
                  onLongPress={() => handleDeleteFood(log.log_id)}
                >
                  <MealCard
                    meal={{
                      id: String(log.log_id),
                      name: log.food_name,
                      calories: log.calories,
                      protein: Math.round(log.protein_g),
                      carbs: Math.round(log.carbs_g),
                      fat: Math.round(log.fat_g),
                      time: format(new Date(log.eaten_at), 'h:mm a'),
                      status: type,
                    }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyMeal}>
                <Text style={styles.emptyMealText}>Chưa ghi nhận {type}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>

      {/* AI Camera Button */}
      <TouchableOpacity style={styles.cameraFab} onPress={handleImageOptions}>
        <Ionicons name="camera" size={24} color={colors.surface} />
      </TouchableOpacity>

      {/* Add Food Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {aiResult ? 'Kết quả AI - Xác nhận thông tin' : 'Ghi nhận món ăn'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {aiResult && (
                <View style={styles.aiResultBanner}>
                  <Ionicons name="sparkles" size={20} color={colors.primary} />
                  <Text style={styles.aiResultText}>
                    AI phát hiện: {aiResult.foodName} ({aiResult.confidence}% chắc chắn)
                  </Text>
                </View>
              )}

              {selectedImage && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên món ăn *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Gà nướng"
                  placeholderTextColor={colors.textLight}
                  value={foodName}
                  onChangeText={setFoodName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Loại bữa ăn</Text>
                <View style={styles.mealTypeButtons}>
                  {MEAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.mealTypeBtn,
                        mealType === type && styles.mealTypeBtnActive,
                      ]}
                      onPress={() => setMealType(type)}
                    >
                      <Text
                        style={[
                          styles.mealTypeBtnText,
                          mealType === type && styles.mealTypeBtnTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Calories *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.macroRow}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Carbs (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Fat (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleAddFood}
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

      {/* Image Analysis Modal */}
      <Modal visible={showImageModal} animationType="fade" transparent>
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContent}>
            <Text style={styles.imageModalTitle}>Phân tích ảnh đồ ăn</Text>
            
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.analysisImage} />
            )}
            
            {analyzingImage ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.analyzingText}>Đang phân tích bằng AI...</Text>
                <Text style={styles.analyzingSubtext}>
                  Vui lòng đợi trong giây lát
                </Text>
              </View>
            ) : (
              <View style={styles.imageModalButtons}>
                <TouchableOpacity
                  style={[styles.imageModalBtn, styles.imageModalBtnSecondary]}
                  onPress={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                  }}
                >
                  <Text style={styles.imageModalBtnTextSecondary}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageModalBtn}
                  onPress={() => selectedImage && analyzeImage(selectedImage)}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.imageModalBtnText}>Phân tích AI</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  headerGradient: {
    backgroundColor: colors.primary,
    paddingBottom: spacing.lg,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  summaryCard: {
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  mealSection: {
    marginBottom: spacing.xl,
  },
  mealTypeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  emptyMeal: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyMealText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cameraFab: {
    position: 'absolute',
    bottom: 170,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
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
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
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
  mealTypeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealTypeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  mealTypeBtnTextActive: {
    color: colors.surface,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  // AI Result Banner
  aiResultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  aiResultText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  // Image Analysis Modal
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  imageModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  imageModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  analysisImage: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  imageModalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imageModalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  imageModalBtnSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageModalBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  imageModalBtnTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
