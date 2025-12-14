// src/screens/mealPlan/MealPlanScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';

import { colors, spacing, borderRadius } from '../../context/ThemeContext';

interface Meal {
  name: string;
  calories: number;
  protein: number;
}

interface DayPlan {
  day: string;
  date: string;
  breakfast?: Meal;
  lunch?: Meal;
  snack?: Meal;
  dinner?: Meal;
}

const generateWeekDates = () => {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return {
      day: format(date, 'EEEE', { locale: vi }),
      date: format(date, 'd MMM', { locale: vi }),
    };
  });
};

const WEEK_DATES = generateWeekDates();

const HEALTHY_PLAN: DayPlan[] = [
  {
    ...WEEK_DATES[0],
    breakfast: { name: 'Bánh pancake protein với dâu', calories: 540, protein: 30 },
    lunch: { name: 'Gà nướng quinoa', calories: 680, protein: 48 },
    snack: { name: 'Sữa chua Hy Lạp + Hạnh nhân', calories: 220, protein: 18 },
    dinner: { name: 'Cá hồi & Khoai lang', calories: 650, protein: 45 },
  },
  {
    ...WEEK_DATES[1],
    breakfast: { name: 'Bánh mì bơ trứng', calories: 520, protein: 24 },
    lunch: { name: 'Gà tây cuộn rau', calories: 580, protein: 42 },
    snack: { name: 'Sinh tố protein + Chuối', calories: 280, protein: 30 },
    dinner: { name: 'Bò xào bông cải xanh', calories: 670, protein: 52 },
  },
  {
    ...WEEK_DATES[2],
    breakfast: { name: 'Yến mạch ngâm qua đêm', calories: 490, protein: 20 },
    lunch: { name: 'Salad cá ngừ đậu gà', calories: 640, protein: 44 },
    snack: { name: 'Phô mai cottage + Dứa', calories: 190, protein: 22 },
    dinner: { name: 'Gà nướng & Rau củ', calories: 660, protein: 50 },
  },
  {
    ...WEEK_DATES[3],
    breakfast: { name: 'Trứng tráng rau bina', calories: 510, protein: 28 },
    lunch: { name: 'Tôm mì zucchini', calories: 560, protein: 46 },
    snack: { name: 'Táo + Bơ đậu phộng', calories: 240, protein: 8 },
    dinner: { name: 'Đậu phụ xào rau', calories: 610, protein: 36 },
  },
  {
    ...WEEK_DATES[4],
    breakfast: { name: 'Sữa chua Parfait', calories: 530, protein: 32 },
    lunch: { name: 'Gà Buddha Bowl', calories: 700, protein: 50 },
    snack: { name: 'Cà rốt + Hummus', calories: 180, protein: 6 },
    dinner: { name: 'Cá tuyết nướng & Măng tây', calories: 600, protein: 48 },
  },
  {
    ...WEEK_DATES[5],
    breakfast: { name: 'Smoothie bowl xanh', calories: 500, protein: 28 },
    lunch: { name: 'Súp đậu lăng + Bánh mì', calories: 620, protein: 30 },
    snack: { name: 'Trứng luộc + Dưa chuột', calories: 200, protein: 16 },
    dinner: { name: 'Viên gà tây mì zoodle', calories: 650, protein: 52 },
  },
  {
    ...WEEK_DATES[6],
    breakfast: { name: 'Chia pudding xoài', calories: 480, protein: 18 },
    lunch: { name: 'Cá hồi Poke Bowl', calories: 710, protein: 46 },
    snack: { name: 'Dâu tây + Hạt óc chó', calories: 230, protein: 5 },
    dinner: { name: 'Salad gà nướng', calories: 670, protein: 54 },
  },
];

export default function MealPlanScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<DayPlan[]>(HEALTHY_PLAN);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');

  const getMealColor = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '#FFF4E6';
      case 'lunch':
        return '#E8F5E9';
      case 'snack':
        return '#E3F2FD';
      case 'dinner':
        return '#FCE4EC';
      default:
        return colors.background;
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'sunny';
      case 'lunch':
        return 'restaurant';
      case 'snack':
        return 'cafe';
      case 'dinner':
        return 'moon';
      default:
        return 'nutrition';
    }
  };

  const handleGeneratePlan = () => {
    Alert.alert(
      'Tạo kế hoạch mới',
      'Tính năng AI đang phát triển. Bạn muốn sử dụng kế hoạch mẫu lành mạnh?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Sử dụng mẫu',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setPlan(HEALTHY_PLAN);
              setShowForm(false);
              setLoading(false);
              Alert.alert('Thành công', 'Đã tải kế hoạch bữa ăn lành mạnh!');
            }, 1000);
          },
        },
      ]
    );
  };

  const renderMealCard = (meal: Meal | undefined, type: string) => {
    if (!meal) {
      return (
        <View style={[styles.mealCard, { backgroundColor: getMealColor(type) }]}>
          <View style={styles.mealHeader}>
            <Ionicons name={getMealIcon(type) as any} size={20} color={colors.textSecondary} />
            <Text style={styles.mealType}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
          </View>
          <Text style={styles.emptyMeal}>Chưa có bữa ăn</Text>
        </View>
      );
    }

    return (
      <View style={[styles.mealCard, { backgroundColor: getMealColor(type) }]}>
        <View style={styles.mealHeader}>
          <Ionicons name={getMealIcon(type) as any} size={20} color={colors.primary} />
          <Text style={styles.mealType}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
        </View>
        <Text style={styles.mealName}>{meal.name}</Text>
        <View style={styles.mealStats}>
          <View style={styles.statChip}>
            <Ionicons name="flame" size={14} color={colors.warning} />
            <Text style={styles.statText}>{meal.calories} kcal</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="fitness" size={14} color={colors.protein} />
            <Text style={styles.statText}>{meal.protein}g protein</Text>
          </View>
        </View>
      </View>
    );
  };

  const totalCalories = plan[selectedDay]
    ? (plan[selectedDay].breakfast?.calories || 0) +
      (plan[selectedDay].lunch?.calories || 0) +
      (plan[selectedDay].snack?.calories || 0) +
      (plan[selectedDay].dinner?.calories || 0)
    : 0;

  const totalProtein = plan[selectedDay]
    ? (plan[selectedDay].breakfast?.protein || 0) +
      (plan[selectedDay].lunch?.protein || 0) +
      (plan[selectedDay].snack?.protein || 0) +
      (plan[selectedDay].dinner?.protein || 0)
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      
      {/* Custom Header */}
      <View style={[styles.customHeader, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Kế hoạch 7 ngày</Text>
          <Text style={styles.headerSubtitle}>Bữa ăn lành mạnh</Text>
        </View>
        <TouchableOpacity style={styles.headerGenerateButton} onPress={() => setShowForm(true)}>
          <Ionicons name="sparkles" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Week Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekTabs}
        contentContainerStyle={styles.weekTabsContent}
      >
        {plan.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dayTab, selectedDay === index && styles.dayTabActive]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[styles.dayName, selectedDay === index && styles.dayNameActive]}>
              {day.day.substring(0, 3)}
            </Text>
            <Text style={[styles.dayDate, selectedDay === index && styles.dayDateActive]}>
              {day.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Daily Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Ionicons name="flame" size={24} color={colors.warning} />
          <Text style={styles.summaryValue}>{totalCalories}</Text>
          <Text style={styles.summaryLabel}>Tổng calo</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="fitness" size={24} color={colors.protein} />
          <Text style={styles.summaryValue}>{totalProtein}g</Text>
          <Text style={styles.summaryLabel}>Tổng protein</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="restaurant" size={24} color={colors.primary} />
          <Text style={styles.summaryValue}>4</Text>
          <Text style={styles.summaryLabel}>Bữa ăn</Text>
        </View>
      </View>

      {/* Meals */}
      <ScrollView style={styles.mealsContainer} contentContainerStyle={styles.mealsContent}>
        {renderMealCard(plan[selectedDay]?.breakfast, 'breakfast')}
        {renderMealCard(plan[selectedDay]?.lunch, 'lunch')}
        {renderMealCard(plan[selectedDay]?.snack, 'snack')}
        {renderMealCard(plan[selectedDay]?.dinner, 'dinner')}
      </ScrollView>

      {/* Generate Plan Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo kế hoạch mới</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Dị ứng thực phẩm</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Tôm, Sữa, Đậu phộng (cách nhau bằng dấu phẩy)"
                value={allergies}
                onChangeText={setAllergies}
                multiline
              />

              <Text style={styles.formLabel}>Sở thích ăn uống</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Ăn chay, Low-carb, Ăn nhiều rau..."
                value={preferences}
                onChangeText={setPreferences}
                multiline
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleGeneratePlan}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Tạo kế hoạch AI</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.note}>
                💡 AI sẽ tạo kế hoạch bữa ăn phù hợp với sở thích và tránh dị ứng của bạn
              </Text>
            </ScrollView>
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#10b981',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerGenerateButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  weekTabs: {
    flexGrow: 0,
  },
  weekTabsContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  dayTab: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    minWidth: 70,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dayNameActive: {
    color: '#fff',
  },
  dayDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayDateActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  mealsContainer: {
    flex: 1,
  },
  mealsContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  mealCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyMeal: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  mealStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.lg,
    minHeight: 60,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  note: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
