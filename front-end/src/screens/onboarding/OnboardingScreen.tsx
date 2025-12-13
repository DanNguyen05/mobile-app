// src/screens/onboarding/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';

const GOALS = [
  { id: 'lose_weight', label: 'Giảm cân', icon: '📉' },
  { id: 'maintain', label: 'Duy trì cân nặng', icon: '⚖️' },
  { id: 'gain_weight', label: 'Tăng cân', icon: '💪' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Ít vận động', description: 'Ít hoặc không tập' },
  { id: 'light', label: 'Nhẹ nhàng', description: '1-3 ngày/tuần' },
  { id: 'moderate', label: 'Trung bình', description: '3-5 ngày/tuần' },
  { id: 'active', label: 'Năng động', description: '6-7 ngày/tuần' },
  { id: 'very_active', label: 'Rất năng động', description: 'Tập nặng mỗi ngày' },
];

const GENDERS = [
  { id: 'male', label: 'Nam', icon: '👨' },
  { id: 'female', label: 'Nữ', icon: '👩' },
];

export default function OnboardingScreen() {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  const totalSteps = 4;

  const handleNext = () => {
    if (step === 1 && (!gender || !age)) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (step === 2 && (!height || !weight)) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (step === 3 && !goal) {
      Alert.alert('Lỗi', 'Vui lòng chọn mục tiêu');
      return;
    }
    if (step === 4 && !activityLevel) {
      Alert.alert('Lỗi', 'Vui lòng chọn mức độ hoạt động');
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.updateCurrentUser({
        gender,
        age: parseInt(age),
        heightCm: parseFloat(height),
        weightKg: parseFloat(weight),
        goal,
        activityLevel,
      });
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Thông tin cơ bản</Text>
      <Text style={styles.stepSubtitle}>Cho chúng tôi biết về bạn</Text>

      <Text style={styles.label}>Giới tính</Text>
      <View style={styles.optionRow}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.optionCard, gender === g.id && styles.optionCardSelected]}
            onPress={() => setGender(g.id)}
          >
            <Text style={styles.optionIcon}>{g.icon}</Text>
            <Text style={[styles.optionLabel, gender === g.id && styles.optionLabelSelected]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tuổi</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tuổi của bạn"
          placeholderTextColor={colors.textLight}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Đo lường cơ thể</Text>
      <Text style={styles.stepSubtitle}>Các chỉ số hiện tại của bạn</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Chiều cao (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 170"
          placeholderTextColor={colors.textLight}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cân nặng (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 70"
          placeholderTextColor={colors.textLight}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Mục tiêu của bạn</Text>
      <Text style={styles.stepSubtitle}>Bạn muốn đạt được điều gì?</Text>

      {GOALS.map((g) => (
        <TouchableOpacity
          key={g.id}
          style={[styles.goalCard, goal === g.id && styles.goalCardSelected]}
          onPress={() => setGoal(g.id)}
        >
          <Text style={styles.goalIcon}>{g.icon}</Text>
          <Text style={[styles.goalLabel, goal === g.id && styles.goalLabelSelected]}>
            {g.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Mức độ hoạt động</Text>
      <Text style={styles.stepSubtitle}>Bạn hoạt động nhiều thế nào?</Text>

      {ACTIVITY_LEVELS.map((a) => (
        <TouchableOpacity
          key={a.id}
          style={[styles.activityCard, activityLevel === a.id && styles.activityCardSelected]}
          onPress={() => setActivityLevel(a.id)}
        >
          <Text style={[styles.activityLabel, activityLevel === a.id && styles.activityLabelSelected]}>
            {a.label}
          </Text>
          <Text style={styles.activityDescription}>{a.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Bước {step} / {totalSteps}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === totalSteps ? 'Hoàn tất' : 'Tiếp tục'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  goalIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  goalLabelSelected: {
    color: colors.primary,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activityLabelSelected: {
    color: colors.primary,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  navigation: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
