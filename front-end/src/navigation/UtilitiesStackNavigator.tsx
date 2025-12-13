// src/navigation/UtilitiesStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import UtilitiesScreen from '../screens/utilities/UtilitiesScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HealthyMenuScreen from '../screens/healthyMenu/HealthyMenuScreen';
import MealPlanScreen from '../screens/mealPlan/MealPlanScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import HealthInsightsScreen from '../screens/healthInsights/HealthInsightsScreen';
import { colors } from '../context/ThemeContext';

export type UtilitiesStackParamList = {
  UtilitiesHome: undefined;
  Progress: undefined;
  Settings: undefined;
  HealthyMenu: undefined;
  MealPlan: undefined;
  Calendar: undefined;
  HealthInsights: undefined;
};

const Stack = createNativeStackNavigator<UtilitiesStackParamList>();

export const UtilitiesStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="UtilitiesHome"
        component={UtilitiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={({ navigation }) => ({
          title: 'Tiến trình',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="MealPlan"
        component={MealPlanScreen}
        options={({ navigation }) => ({
          title: 'Kế hoạch bữa ăn',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={({ navigation }) => ({
          title: 'Lịch sức khỏe',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="HealthInsights"
        component={HealthInsightsScreen}
        options={({ navigation }) => ({
          title: 'Kiến thức sức khỏe',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={({ navigation }) => ({
          title: 'Cài đặt',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="HealthyMenu"
        component={HealthyMenuScreen}
        options={({ navigation }) => ({
          title: 'Thực đơn lành mạnh',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};
