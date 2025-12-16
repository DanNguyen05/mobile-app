import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const GLASS_SIZES = [
  { id: '1', name: 'Nhỏ', amount: 150, icon: 'wine' },
  { id: '2', name: 'Vừa', amount: 250, icon: 'water' },
  { id: '3', name: 'Lớn', amount: 350, icon: 'beer' },
];

export default function WaterIntakeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [waterIntake, setWaterIntake] = useState(0); // ml
  const [dailyGoal] = useState(2500); // ml
  const [history, setHistory] = useState<{ time: string; amount: number }[]>([]);

  // Load data from AsyncStorage
  useEffect(() => {
    if (user?.id) {
      loadWaterData();
    }
  }, [user?.id]);

  const loadWaterData = async () => {
    try {
      if (!user?.id) return;
      
      const today = new Date().toDateString();
      const dateKey = `waterDate_${user.id}`;
      const intakeKey = `waterIntake_${user.id}`;
      const historyKey = `waterHistory_${user.id}`;
      
      const savedDate = await AsyncStorage.getItem(dateKey);
      
      // Reset if it's a new day
      if (savedDate !== today) {
        await AsyncStorage.setItem(dateKey, today);
        await AsyncStorage.setItem(intakeKey, '0');
        await AsyncStorage.setItem(historyKey, '[]');
        setWaterIntake(0);
        setHistory([]);
      } else {
        const savedIntake = await AsyncStorage.getItem(intakeKey);
        const savedHistory = await AsyncStorage.getItem(historyKey);
        
        if (savedIntake) setWaterIntake(parseInt(savedIntake));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading water data:', error);
    }
  };

  const saveWaterData = async (intake: number, hist: { time: string; amount: number }[]) => {
    try {
      if (!user?.id) return;
      
      const intakeKey = `waterIntake_${user.id}`;
      const historyKey = `waterHistory_${user.id}`;
      
      await AsyncStorage.setItem(intakeKey, intake.toString());
      await AsyncStorage.setItem(historyKey, JSON.stringify(hist));
    } catch (error) {
      console.error('Error saving water data:', error);
    }
  };

  const progress = Math.min((waterIntake / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - waterIntake, 0);

  const addWater = (amount: number) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newIntake = Math.min(waterIntake + amount, dailyGoal);
    const newHistory = [{ time, amount }, ...history];
    
    setWaterIntake(newIntake);
    setHistory(newHistory);
    saveWaterData(newIntake, newHistory);
  };

  const removeLastIntake = () => {
    if (history.length > 0) {
      const lastIntake = history[0];
      const newIntake = Math.max(waterIntake - lastIntake.amount, 0);
      const newHistory = history.slice(1);
      
      setWaterIntake(newIntake);
      setHistory(newHistory);
      saveWaterData(newIntake, newHistory);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nước uống</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Water Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.waterGlassContainer}>
            <View style={styles.waterGlass}>
              <View style={[styles.waterFill, { height: `${progress}%` }]}>
                <Animated.View style={styles.waterWave} />
              </View>
              <Ionicons 
                name="water" 
                size={60} 
                color={progress >= 100 ? '#fff' : '#45B7D1'} 
                style={styles.waterIcon}
              />
            </View>
          </View>

          <View style={styles.progressStats}>
            <Text style={styles.progressAmount}>{waterIntake}ml</Text>
            <Text style={styles.progressGoal}>/ {dailyGoal}ml</Text>
            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
            
            {progress >= 100 ? (
              <View style={styles.congratsBox}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.congratsText}>Đã đạt mục tiêu! 🎉</Text>
              </View>
            ) : (
              <Text style={styles.remainingText}>
                Còn {remaining}ml để đạt mục tiêu
              </Text>
            )}
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Thêm nhanh</Text>
          <View style={styles.glassButtons}>
            {GLASS_SIZES.map((glass) => (
              <TouchableOpacity
                key={glass.id}
                style={styles.glassButton}
                onPress={() => addWater(glass.amount)}
                activeOpacity={0.7}
              >
                <Ionicons name={glass.icon as any} size={32} color={colors.primary} />
                <Text style={styles.glassName}>{glass.name}</Text>
                <Text style={styles.glassAmount}>{glass.amount}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Lịch sử hôm nay</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={removeLastIntake} style={styles.undoButton}>
                <Ionicons name="arrow-undo" size={18} color={colors.error} />
                <Text style={styles.undoText}>Hoàn tác</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="water-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Chưa có lịch sử uống nước</Text>
            </View>
          ) : (
            history.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons name="water" size={20} color={colors.primary} />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyAmount}>{entry.amount}ml</Text>
                  <Text style={styles.historyTime}>{entry.time}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
            ))
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#FFA726" />
            <Text style={styles.tipsTitle}>Mẹo nhỏ</Text>
          </View>
          <Text style={styles.tipsText}>
            • Uống 1 cốc nước ngay khi thức dậy{'\n'}
            • Uống nước trước mỗi bữa ăn 30 phút{'\n'}
            • Mang theo bình nước bên mình{'\n'}
            • Uống nhiều hơn khi tập luyện
          </Text>
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  waterGlassContainer: {
    marginBottom: spacing.lg,
  },
  waterGlass: {
    width: 120,
    height: 180,
    borderWidth: 4,
    borderColor: '#45B7D1',
    borderRadius: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#45B7D1',
    transition: 'height 0.3s ease',
  },
  waterWave: {
    width: '100%',
    height: 10,
    backgroundColor: '#3A9FB8',
    opacity: 0.5,
  },
  waterIcon: {
    zIndex: 1,
  },
  progressStats: {
    alignItems: 'center',
  },
  progressAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  progressGoal: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  remainingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  congratsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  congratsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  quickAddSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  glassButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  glassButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  glassName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  glassAmount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  historySection: {
    marginBottom: spacing.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  undoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  emptyHistory: {
    backgroundColor: '#fff',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  historyContent: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tipsCard: {
    backgroundColor: '#FFF3E0',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
  },
  tipsText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 22,
  },
});
