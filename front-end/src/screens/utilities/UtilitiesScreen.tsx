// src/screens/utilities/UtilitiesScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';
import type { UtilitiesStackParamList } from '../../navigation/UtilitiesStackNavigator';

type NavigationProp = NativeStackNavigationProp<UtilitiesStackParamList, 'UtilitiesHome'>;

interface UtilityItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const UtilitiesScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToProgress = () => {
    navigation.navigate('Progress');
  };

  const navigateToHealthyMenu = () => {
    navigation.navigate('HealthyMenu');
  };

  const navigateToMealPlan = () => {
    navigation.navigate('MealPlan');
  };

  const navigateToCalendar = () => {
    navigation.navigate('Calendar');
  };

  const navigateToHealthInsights = () => {
    navigation.navigate('HealthInsights');
  };

  const navigateToMessages = () => {
    navigation.navigate('Messages');
  };

  const navigateToExercises = () => {
    navigation.navigate('Exercises');
  };

  const navigateToGoals = () => {
    navigation.navigate('Goals');
  };

  const navigateToWaterIntake = () => {
    navigation.navigate('WaterIntake');
  };

  const navigateToMeasurements = () => {
    navigation.navigate('Measurements');
  };

  const navigateToReminders = () => {
    navigation.navigate('Reminders');
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất');
            }
          },
        },
      ]
    );
  };

  // Main featured items - 4 items in a row
  const featuredItems: UtilityItem[] = [
    {
      id: 'ai-chat',
      title: 'Trợ lý AI',
      icon: 'chatbubble-ellipses',
      onPress: navigateToMessages,
    },
    {
      id: 'exercises',
      title: 'Bài tập',
      icon: 'barbell',
      onPress: navigateToExercises,
    },
    {
      id: 'meal-plan',
      title: 'Kế hoạch 7 ngày',
      icon: 'calendar',
      onPress: navigateToMealPlan,
    },
    {
      id: 'calendar',
      title: 'Lịch sức khỏe',
      icon: 'calendar-outline',
      onPress: navigateToCalendar,
    },
  ];

  // General utilities in grid layout
  const generalUtilities: UtilityItem[] = [
    {
      id: 'progress',
      title: 'Tiến trình',
      icon: 'stats-chart',
      onPress: navigateToProgress,
    },
    {
      id: 'healthy-menu',
      title: 'Thực đơn healthy',
      icon: 'restaurant',
      onPress: navigateToHealthyMenu,
    },
    {
      id: 'health-insights',
      title: 'Kiến thức',
      icon: 'bulb',
      onPress: navigateToHealthInsights,
    },
    {
      id: 'goals',
      title: 'Mục tiêu',
      icon: 'trophy',
      onPress: navigateToGoals,
    },
    {
      id: 'water',
      title: 'Nước uống',
      icon: 'water',
      onPress: navigateToWaterIntake,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header - Separate from ScrollView */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiện ích</Text>
      </View>

      {/* Featured Section - 4 items in a row - Fixed below header */}
      <View style={styles.featuredContainer}>
        {featuredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.featuredItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.featuredIconBox}>
              <Ionicons name={item.icon} size={28} color={colors.primary} />
            </View>
            <Text style={styles.featuredTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* General Utilities Section */}
        <View style={styles.generalSection}>
          <Text style={styles.sectionTitle}>Tiện ích chung</Text>
          
          <View style={styles.utilitiesGrid}>
            {generalUtilities.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.utilityItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.utilityIconBox}>
                  <Ionicons name={item.icon} size={32} color={colors.primary} />
                </View>
                <Text style={styles.utilityTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  featuredContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
  },
  featuredItem: {
    width: '23%',
    alignItems: 'center',
  },
  featuredIconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 16,
  },
  generalSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  utilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  utilityItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  utilityIconBox: {
    width: 60,
    height: 60,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  utilityTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },
  bottomPadding: {
    height: 100,
  },
});

export default UtilitiesScreen;
