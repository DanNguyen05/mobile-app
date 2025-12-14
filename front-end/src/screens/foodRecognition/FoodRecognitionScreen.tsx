// src/screens/foodRecognition/FoodRecognitionScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

import { api } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export default function FoodRecognitionScreen() {
  const navigation = useNavigation();
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiResult, setAiResult] = useState<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  } | null>(null);
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('Breakfast');

  useEffect(() => {
    // Tự động mở camera khi vào màn hình
    const initCamera = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần cấp quyền sử dụng camera', [
          {
            text: 'OK',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                (navigation as any).navigate('FoodLog');
              }
            },
          },
        ]);
        return;
      }
      handleTakePhoto();
    };
    initCamera();
  }, []);

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      await analyzeImage(result.assets[0].uri);
    } else {
      // User cancelled, go back to food diary
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        (navigation as any).navigate('FoodLog');
      }
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      const result = await api.analyzeFoodImage(imageUri);
      
      setAiResult({
        foodName: result.food_name || 'Món ăn không xác định',
        calories: result.calories || 0,
        protein: result.protein_g || 0,
        carbs: result.carbs_g || 0,
        fat: result.fat_g || 0,
        confidence: result.confidence || 0,
      });
      
      setShowConfirmModal(true);
    } catch (error: any) {
      console.error('❌ Error analyzing image:', error);
      Alert.alert(
        'Lỗi phân tích',
        'Không thể phân tích ảnh. Bạn có muốn thử lại không?',
        [
          { 
            text: 'Hủy', 
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                (navigation as any).navigate('FoodLog');
              }
            }
          },
          { text: 'Thử lại', onPress: handleTakePhoto },
        ]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveFood = async () => {
    if (!aiResult) return;

    setSaving(true);
    try {
      await api.addFoodLog({
        food_name: aiResult.foodName,
        calories: aiResult.calories,
        protein_g: aiResult.protein,
        carbs_g: aiResult.carbs,
        fat_g: aiResult.fat,
        meal_type: mealType,
        eaten_at: new Date().toISOString(),
        image_url: selectedImage || undefined,
      });

      setShowConfirmModal(false);
      Alert.alert('Thành công', 'Đã lưu món ăn!', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              (navigation as any).navigate('FoodLog');
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu món ăn');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('FoodLog');
    }
  };

  const handleRetake = () => {
    setShowConfirmModal(false);
    setSelectedImage(null);
    setAiResult(null);
    handleTakePhoto();
  };

  if (analyzing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.analyzingText}>Đang phân tích ảnh...</Text>
          <Text style={styles.analyzingSubtext}>AI đang nhận diện món ăn</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận món ăn</Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.scrollContent}
            >
              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              )}

              {aiResult && (
                <View style={styles.resultContainer}>
                  <Text style={styles.foodName}>{aiResult.foodName}</Text>
                  <Text style={styles.confidence}>
                    Độ tin cậy: {(aiResult.confidence * 100).toFixed(0)}%
                  </Text>

                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Ionicons name="flame" size={24} color={colors.warning} />
                      <Text style={styles.nutritionValue}>{aiResult.calories}</Text>
                      <Text style={styles.nutritionLabel}>Calo</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Ionicons name="fitness" size={24} color={colors.protein} />
                      <Text style={styles.nutritionValue}>{aiResult.protein}g</Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Ionicons name="nutrition" size={24} color={colors.carbs} />
                      <Text style={styles.nutritionValue}>{aiResult.carbs}g</Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Ionicons name="water" size={24} color={colors.fat} />
                      <Text style={styles.nutritionValue}>{aiResult.fat}g</Text>
                      <Text style={styles.nutritionLabel}>Chất béo</Text>
                    </View>
                  </View>

                  <Text style={styles.formLabel}>Loại bữa ăn</Text>
                  <View style={styles.mealTypeContainer}>
                    {MEAL_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.mealTypeButton,
                          mealType === type && styles.mealTypeButtonActive,
                        ]}
                        onPress={() => setMealType(type)}
                      >
                        <Text
                          style={[
                            styles.mealTypeText,
                            mealType === type && styles.mealTypeTextActive,
                          ]}
                        >
                          {type === 'Breakfast' && 'Sáng'}
                          {type === 'Lunch' && 'Trưa'}
                          {type === 'Dinner' && 'Tối'}
                          {type === 'Snack' && 'Phụ'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.retakeButton]}
                onPress={handleRetake}
              >
                <Ionicons name="camera" size={20} color={colors.text} />
                <Text style={styles.retakeButtonText}>Chụp lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveFood}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  analyzingText: {
    marginTop: spacing.lg,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  analyzingSubtext: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
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
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  scrollContent: {
    maxHeight: '70%',
  },
  resultContainer: {
    marginBottom: spacing.md,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  confidence: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retakeButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
