// src/navigation/AppNavigator.tsx
import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { colors } from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

// Main Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import FoodDiaryScreen from '../screens/foodDiary/FoodDiaryScreen';
import ExercisesScreen from '../screens/exercises/ExercisesScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import FoodRecognitionScreen from '../screens/foodRecognition/FoodRecognitionScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Stack Navigators
import { UtilitiesStackNavigator } from './UtilitiesStackNavigator';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  FoodLog: undefined;
  Camera: undefined;
  Utilities: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FoodLog') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Camera') {
            iconName = 'camera';
          } else if (route.name === 'Utilities') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // Camera button style
          if (route.name === 'Camera') {
            return (
              <View
                style={{
                  backgroundColor: colors.primary,
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -30,
                  borderWidth: 4,
                  borderColor: '#fff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 10,
                }}
              >
                <Ionicons name={iconName} size={30} color="#fff" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="FoodLog" component={FoodDiaryScreen} options={{ title: 'Nhật ký' }} />
      <Tab.Screen 
        name="Camera" 
        component={FoodRecognitionScreen} 
        options={{ 
          title: 'Chụp ảnh',
          tabBarLabel: () => null,
        }} 
      />
      <Tab.Screen name="Utilities" component={UtilitiesStackNavigator} options={{ title: 'Tiện ích' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

// App Navigator
export const AppNavigator = () => {
  const { isLoggedIn, isOnboarded, loading } = useAuth();

  if (loading) {
    return null; // hoặc Loading Screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !isOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};
