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
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
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

  const utilities: UtilityItem[] = [
    {
      id: 'progress',
      title: 'Tiến trình',
      description: 'Xem biểu đồ và thống kê sức khỏe',
      icon: 'bar-chart',
      iconColor: '#2196F3',
      onPress: navigateToProgress,
    },
    {
      id: 'healthy-menu',
      title: 'Thực đơn lành mạnh',
      description: 'Khám phá công thức nấu ăn healthy',
      icon: 'restaurant',
      iconColor: '#FF6B6B',
      onPress: navigateToHealthyMenu,
    },
    {
      id: 'meal-plan',
      title: 'Kế hoạch bữa ăn',
      description: 'Lên kế hoạch bữa ăn 7 ngày',
      icon: 'calendar',
      iconColor: '#8E44AD',
      onPress: navigateToMealPlan,
    },
    {
      id: 'calendar',
      title: 'Lịch sức khỏe',
      description: 'Quản lý lịch ăn uống và tập luyện',
      icon: 'calendar-outline',
      iconColor: '#3498DB',
      onPress: navigateToCalendar,
    },
    {
      id: 'health-insights',
      title: 'Kiến thức sức khỏe',
      description: 'Bài viết và mẹo sức khỏe',
      icon: 'bulb-outline',
      iconColor: '#F39C12',
      onPress: navigateToHealthInsights,
    },
    {
      id: 'profile',
      title: 'Hồ sơ cá nhân',
      description: 'Xem và chỉnh sửa thông tin cá nhân',
      icon: 'person',
      iconColor: colors.primary,
      onPress: () => Alert.alert('Hồ sơ', 'Chức năng đang phát triển'),
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      description: 'Tùy chỉnh ứng dụng theo ý bạn',
      icon: 'settings',
      iconColor: '#4CAF50',
      onPress: navigateToSettings,
    },
    {
      id: 'goals',
      title: 'Mục tiêu sức khỏe',
      description: 'Thiết lập và theo dõi mục tiêu',
      icon: 'trophy',
      iconColor: '#FF9800',
      onPress: () => Alert.alert('Mục tiêu', 'Chức năng đang phát triển'),
    },
    {
      id: 'measurements',
      title: 'Số đo cơ thể',
      description: 'Cập nhật cân nặng, BMI, chu vi',
      icon: 'resize',
      iconColor: '#9C27B0',
      onPress: () => Alert.alert('Số đo', 'Chức năng đang phát triển'),
    },
    {
      id: 'reminders',
      title: 'Nhắc nhở',
      description: 'Thiết lập thông báo ăn uống, tập luyện',
      icon: 'notifications',
      iconColor: '#FF5722',
      onPress: () => Alert.alert('Nhắc nhở', 'Chức năng đang phát triển'),
    },
    {
      id: 'water',
      title: 'Theo dõi nước uống',
      description: 'Ghi nhận lượng nước hàng ngày',
      icon: 'water',
      iconColor: '#03A9F4',
      onPress: () => Alert.alert('Nước uống', 'Chức năng đang phát triển'),
    },
    {
      id: 'help',
      title: 'Trợ giúp & Hỗ trợ',
      description: 'Câu hỏi thường gặp và liên hệ',
      icon: 'help-circle',
      iconColor: '#607D8B',
      onPress: () => Alert.alert('Trợ giúp', 'Chức năng đang phát triển'),
    },
    {
      id: 'about',
      title: 'Về ứng dụng',
      description: 'Phiên bản 1.0.0',
      icon: 'information-circle',
      iconColor: '#795548',
      onPress: () => Alert.alert(
        'Healthy Care Mobile',
        'Phiên bản 1.0.0\n\nỨng dụng quản lý sức khỏe toàn diện với AI',
        [{ text: 'OK' }]
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiện ích</Text>
        <Text style={styles.headerSubtitle}>Quản lý và tùy chỉnh</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={60} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Utilities Grid */}
        <View style={styles.utilitiesContainer}>
          {utilities.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.utilityCard}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
                <Ionicons name={item.icon} size={28} color={item.iconColor} />
              </View>
              <Text style={styles.utilityTitle}>{item.title}</Text>
              <Text style={styles.utilityDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Bottom Padding */}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  utilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  utilityCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  utilityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  utilityDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F4433615',
    marginBottom: spacing.lg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: spacing.sm,
  },
  bottomPadding: {
    height: 80,
  },
});

export default UtilitiesScreen;
