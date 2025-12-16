// src/screens/mealPlan/MealPlanScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';

import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import { api } from '../../services/api';

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

// Template 1: High Protein Plan
const PLAN_1: DayPlan[] = [
  { ...WEEK_DATES[0], breakfast: { name: 'Bánh pancake protein với dâu', calories: 540, protein: 30 }, lunch: { name: 'Gà nướng quinoa', calories: 680, protein: 48 }, snack: { name: 'Sữa chua Hy Lạp + Hạnh nhân', calories: 220, protein: 18 }, dinner: { name: 'Cá hồi & Khoai lang', calories: 650, protein: 45 } },
  { ...WEEK_DATES[1], breakfast: { name: 'Bánh mì bơ trứng', calories: 520, protein: 24 }, lunch: { name: 'Gà tây cuộn rau', calories: 580, protein: 42 }, snack: { name: 'Sinh tố protein + Chuối', calories: 280, protein: 30 }, dinner: { name: 'Bò xào bông cải xanh', calories: 670, protein: 52 } },
  { ...WEEK_DATES[2], breakfast: { name: 'Yến mạch ngâm qua đêm', calories: 490, protein: 20 }, lunch: { name: 'Salad cá ngừ đậu gà', calories: 640, protein: 44 }, snack: { name: 'Phô mai cottage + Dứa', calories: 190, protein: 22 }, dinner: { name: 'Gà nướng & Rau củ', calories: 660, protein: 50 } },
  { ...WEEK_DATES[3], breakfast: { name: 'Trứng tráng rau bina', calories: 510, protein: 28 }, lunch: { name: 'Tôm mì zucchini', calories: 560, protein: 46 }, snack: { name: 'Táo + Bơ đậu phộng', calories: 240, protein: 8 }, dinner: { name: 'Đậu phụ xào rau', calories: 610, protein: 36 } },
  { ...WEEK_DATES[4], breakfast: { name: 'Sữa chua Parfait', calories: 530, protein: 32 }, lunch: { name: 'Gà Buddha Bowl', calories: 700, protein: 50 }, snack: { name: 'Cà rốt + Hummus', calories: 180, protein: 6 }, dinner: { name: 'Cá tuyết nướng & Măng tây', calories: 600, protein: 48 } },
  { ...WEEK_DATES[5], breakfast: { name: 'Smoothie bowl xanh', calories: 500, protein: 28 }, lunch: { name: 'Súp đậu lăng + Bánh mì', calories: 620, protein: 30 }, snack: { name: 'Trứng luộc + Dưa chuột', calories: 200, protein: 16 }, dinner: { name: 'Viên gà tây mì zoodle', calories: 650, protein: 52 } },
  { ...WEEK_DATES[6], breakfast: { name: 'Chia pudding xoài', calories: 480, protein: 18 }, lunch: { name: 'Cá hồi Poke Bowl', calories: 710, protein: 46 }, snack: { name: 'Dâu tây + Hạt óc chó', calories: 230, protein: 5 }, dinner: { name: 'Salad gà nướng', calories: 670, protein: 54 } },
];

// Template 2: Mediterranean Diet
const PLAN_2: DayPlan[] = [
  { ...WEEK_DATES[0], breakfast: { name: 'Bánh mì nguyên cám bơ đậu', calories: 450, protein: 15 }, lunch: { name: 'Salad Hy Lạp với phô mai feta', calories: 520, protein: 22 }, snack: { name: 'Olive + Cà chua bi', calories: 160, protein: 4 }, dinner: { name: 'Cá thu nướng với chanh', calories: 580, protein: 42 } },
  { ...WEEK_DATES[1], breakfast: { name: 'Sữa chua với mật ong & hạt', calories: 420, protein: 18 }, lunch: { name: 'Gà nướng thảo mộc', calories: 580, protein: 45 }, snack: { name: 'Hummus + Crudités', calories: 190, protein: 7 }, dinner: { name: 'Mực nướng kiểu Địa Trung Hải', calories: 550, protein: 38 } },
  { ...WEEK_DATES[2], breakfast: { name: 'Trứng luộc + Bánh mì nướng', calories: 440, protein: 20 }, lunch: { name: 'Súp minestrone', calories: 480, protein: 18 }, snack: { name: 'Quả sung khô + Hạnh nhân', calories: 210, protein: 6 }, dinner: { name: 'Tôm nướng với rau nướng', calories: 570, protein: 40 } },
  { ...WEEK_DATES[3], breakfast: { name: 'Yến mạch với quả mọng', calories: 460, protein: 16 }, lunch: { name: 'Bạch tuộc nướng salad', calories: 540, protein: 35 }, snack: { name: 'Cà rốt baby + Tzatziki', calories: 170, protein: 5 }, dinner: { name: 'Cá ngừ áp chảo', calories: 600, protein: 44 } },
  { ...WEEK_DATES[4], breakfast: { name: 'Smoothie xanh với bơ', calories: 480, protein: 14 }, lunch: { name: 'Tabouleh với gà nướng', calories: 560, protein: 38 }, snack: { name: 'Phô mai + Nho', calories: 200, protein: 8 }, dinner: { name: 'Moussaka chay', calories: 520, protein: 24 } },
  { ...WEEK_DATES[5], breakfast: { name: 'Bánh mì pita với phô mai dê', calories: 440, protein: 16 }, lunch: { name: 'Salad Caesar Hy Lạp', calories: 550, protein: 32 }, snack: { name: 'Dưa chuột + Feta', calories: 150, protein: 6 }, dinner: { name: 'Cá trắng hấp thảo mộc', calories: 540, protein: 42 } },
  { ...WEEK_DATES[6], breakfast: { name: 'Pancake chuối yến mạch', calories: 470, protein: 18 }, lunch: { name: 'Falafels với salad', calories: 580, protein: 20 }, snack: { name: 'Oliu + Cà chua', calories: 160, protein: 4 }, dinner: { name: 'Gà nướng chanh thảo mộc', calories: 590, protein: 46 } },
];

// Template 3: Asian Fusion
const PLAN_3: DayPlan[] = [
  { ...WEEK_DATES[0], breakfast: { name: 'Phở gà', calories: 480, protein: 32 }, lunch: { name: 'Cơm gà Hải Nam', calories: 620, protein: 40 }, snack: { name: 'Chè đậu xanh', calories: 200, protein: 8 }, dinner: { name: 'Cá kho tộ', calories: 560, protein: 38 } },
  { ...WEEK_DATES[1], breakfast: { name: 'Bánh mì trứng ốp la', calories: 520, protein: 24 }, lunch: { name: 'Bún chả', calories: 580, protein: 35 }, snack: { name: 'Sữa đậu nành + Bánh gạo', calories: 180, protein: 10 }, dinner: { name: 'Gà xào sả ớt', calories: 600, protein: 42 } },
  { ...WEEK_DATES[2], breakfast: { name: 'Cháo gà', calories: 440, protein: 28 }, lunch: { name: 'Canh chua cá', calories: 500, protein: 32 }, snack: { name: 'Mít + Nước dừa', calories: 220, protein: 4 }, dinner: { name: 'Đậu phụ sốt cà', calories: 520, protein: 26 } },
  { ...WEEK_DATES[3], breakfast: { name: 'Xôi gà', calories: 560, protein: 30 }, lunch: { name: 'Bò lúc lắc', calories: 640, protein: 45 }, snack: { name: 'Chè thái', calories: 240, protein: 6 }, dinner: { name: 'Tôm rim', calories: 580, protein: 40 } },
  { ...WEEK_DATES[4], breakfast: { name: 'Bánh cuốn', calories: 420, protein: 18 }, lunch: { name: 'Mì xào hải sản', calories: 660, protein: 38 }, snack: { name: 'Smoothie xoài', calories: 210, protein: 8 }, dinner: { name: 'Cá thu sốt', calories: 570, protein: 42 } },
  { ...WEEK_DATES[5], breakfast: { name: 'Bánh bao nhân thịt', calories: 480, protein: 22 }, lunch: { name: 'Cơm tấm sườn', calories: 680, protein: 40 }, snack: { name: 'Sương sáo', calories: 180, protein: 4 }, dinner: { name: 'Gỏi cuốn tôm', calories: 450, protein: 28 } },
  { ...WEEK_DATES[6], breakfast: { name: 'Bánh xèo', calories: 520, protein: 26 }, lunch: { name: 'Bún riêu', calories: 580, protein: 32 }, snack: { name: 'Chè bưởi', calories: 200, protein: 6 }, dinner: { name: 'Mực xào sa tế', calories: 590, protein: 44 } },
];

// Template 4: Low Carb
const PLAN_4: DayPlan[] = [
  { ...WEEK_DATES[0], breakfast: { name: 'Trứng chiên bơ phô mai', calories: 420, protein: 28 }, lunch: { name: 'Salad gà bơ', calories: 540, protein: 42 }, snack: { name: 'Celery + Bơ hạnh nhân', calories: 150, protein: 6 }, dinner: { name: 'Steak bò + Rau xào', calories: 620, protein: 48 } },
  { ...WEEK_DATES[1], breakfast: { name: 'Omelet nấm phô mai', calories: 440, protein: 30 }, lunch: { name: 'Cá hồi nướng rau', calories: 580, protein: 44 }, snack: { name: 'Phô mai que + Dưa leo', calories: 140, protein: 8 }, dinner: { name: 'Gà nướng bơ tỏi', calories: 590, protein: 46 } },
  { ...WEEK_DATES[2], breakfast: { name: 'Bacon + Trứng', calories: 460, protein: 32 }, lunch: { name: 'Salad Cobb', calories: 560, protein: 40 }, snack: { name: 'Hạt macadamia', calories: 200, protein: 4 }, dinner: { name: 'Sườn nướng', calories: 640, protein: 42 } },
  { ...WEEK_DATES[3], breakfast: { name: 'Smoothie bơ protein', calories: 480, protein: 35 }, lunch: { name: 'Gà rôti + Salad', calories: 570, protein: 45 }, snack: { name: 'Trứng luộc + Mayonnaise', calories: 180, protein: 12 }, dinner: { name: 'Cá thu nướng bơ', calories: 600, protein: 44 } },
  { ...WEEK_DATES[4], breakfast: { name: 'Sốt xúc xích bơ phô mai', calories: 500, protein: 28 }, lunch: { name: 'Tôm xào bơ tỏi', calories: 550, protein: 40 }, snack: { name: 'Olive + Phô mai', calories: 160, protein: 6 }, dinner: { name: 'Thịt hầm nấm', calories: 610, protein: 46 } },
  { ...WEEK_DATES[5], breakfast: { name: 'Chia pudding dừa', calories: 420, protein: 18 }, lunch: { name: 'Burger bò không bánh', calories: 620, protein: 48 }, snack: { name: 'Cá ngừ đóng hộp', calories: 190, protein: 26 }, dinner: { name: 'Gà nướng + Bông cải', calories: 580, protein: 44 } },
  { ...WEEK_DATES[6], breakfast: { name: 'Pancake hạnh nhân', calories: 460, protein: 24 }, lunch: { name: 'Salad tôm bơ', calories: 540, protein: 38 }, snack: { name: 'Bơ + Hạt chia', calories: 210, protein: 8 }, dinner: { name: 'Cá hồi áp chảo', calories: 600, protein: 46 } },
];

const MEAL_PLAN_TEMPLATES = [PLAN_1, PLAN_2, PLAN_3, PLAN_4];

const getRandomPlan = () => {
  const randomIndex = Math.floor(Math.random() * MEAL_PLAN_TEMPLATES.length);
  return MEAL_PLAN_TEMPLATES[randomIndex];
};

export default function MealPlanScreen() {
  const navigation = useNavigation();
  const [plan, setPlan] = useState<DayPlan[]>(PLAN_1);
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
        return 'sunny-outline';
      case 'lunch':
        return 'restaurant-outline';
      case 'snack':
        return 'cafe-outline';
      case 'dinner':
        return 'moon-outline';
      default:
        return 'nutrition-outline';
    }
  };

  const getMealTitle = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'Sáng';
      case 'lunch':
        return 'Trưa';
      case 'snack':
        return 'Phụ';
      case 'dinner':
        return 'Tối';
      default:
        return 'Bữa ăn';
    }
  };

  const showErrorDialog = () => {
    Alert.alert(
      'API đang lỗi',
      'Không thể kết nối với AI. Bạn có muốn sử dụng template có sẵn không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Dùng template',
          onPress: () => {
            const randomPlan = getRandomPlan();
            setPlan(randomPlan);
            setShowForm(false);
          },
        },
      ]
    );
  };

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      
      const result = await api.generateMealPlan({
        allergies: allergies.trim() || undefined,
        preferences: preferences.trim() || undefined,
      });

      if (result.mealPlan && Array.isArray(result.mealPlan)) {
        if (result.source === 'fallback') {
          showErrorDialog();
        } else {
          setPlan(result.mealPlan);
          setShowForm(false);
          Alert.alert(
            'Thành công',
            `Đã tạo kế hoạch ăn uống ${result.mealPlan.length} ngày với mục tiêu ${result.targetCalories} kcal/ngày!`
          );
        }
      } else {
        throw new Error('Invalid meal plan format');
      }
    } catch (error: any) {
      console.error('Generate meal plan error:', error);
      showErrorDialog();
    } finally {
      setLoading(false);
    }
  };

  const renderMealCard = (meal: Meal | undefined, type: string) => {
    if (!meal) {
      return (
        <View style={[styles.mealCard, styles.emptyMealCard]}>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIconBg, { backgroundColor: getMealColor(type) }]}>
              <Ionicons name={getMealIcon(type) as any} size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.mealTitleContainer}>
              <Text style={styles.mealType}>{getMealTitle(type)}</Text>
              <Text style={styles.emptyMealText}>Chưa có món ăn</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={[styles.mealIconBg, { backgroundColor: getMealColor(type) }]}>
            <Ionicons name={getMealIcon(type) as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.mealTitleContainer}>
            <Text style={styles.mealType}>{getMealTitle(type)}</Text>
            <Text style={styles.mealName}>{meal.name}</Text>
          </View>
        </View>
        <View style={styles.mealStats}>
          <View style={styles.mealStatItem}>
            <View style={styles.statIconBg}>
              <Ionicons name="flame" size={14} color="#EF4444" />
            </View>
            <Text style={styles.statText}>{meal.calories} kcal</Text>
          </View>
          <View style={styles.mealStatItem}>
            <View style={[styles.statIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="fitness" size={14} color="#10B981" />
            </View>
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
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Kế hoạch 7 ngày</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Week Tabs */}
        <View style={styles.weekTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekTabsContent}
          >
            {plan.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.dayTab, selectedDay === index && styles.dayTabActive]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[styles.dayName, selectedDay === index && styles.dayNameActive]}>
                  Ngày
                </Text>
                <Text style={[styles.dayDate, selectedDay === index && styles.dayDateActive]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="flame" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.summaryValue}>{totalCalories}</Text>
                <Text style={styles.summaryLabel}>Calo</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconContainer, { backgroundColor: colors.protein }]}>
                <Ionicons name="fitness" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.summaryValue}>{totalProtein}g</Text>
                <Text style={styles.summaryLabel}>Protein</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          {renderMealCard(plan[selectedDay]?.breakfast, 'breakfast')}
          {renderMealCard(plan[selectedDay]?.lunch, 'lunch')}
          {renderMealCard(plan[selectedDay]?.snack, 'snack')}
          {renderMealCard(plan[selectedDay]?.dinner, 'dinner')}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

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
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  weekTabsContainer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  weekTabsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#fff',
    marginRight: spacing.sm,
    minWidth: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  dayNameActive: {
    color: '#fff',
  },
  dayDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  dayDateActive: {
    color: 'rgba(255,255,255,0.95)',
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mealsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyMealCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mealIconBg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealType: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  emptyMealText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  mealStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mealStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  statIconBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
