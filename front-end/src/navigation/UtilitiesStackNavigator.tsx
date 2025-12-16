// src/navigation/UtilitiesStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UtilitiesScreen from '../screens/utilities/UtilitiesScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import HealthyMenuScreen from '../screens/healthyMenu/HealthyMenuScreen';
import MealPlanScreen from '../screens/mealPlan/MealPlanScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import HealthInsightsScreen from '../screens/healthInsights/HealthInsightsScreen';
import ExercisesScreen from '../screens/exercises/ExercisesScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import WaterIntakeScreen from '../screens/waterIntake/WaterIntakeScreen';
import MeasurementsScreen from '../screens/measurements/MeasurementsScreen';
import RemindersScreen from '../screens/reminders/RemindersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../context/ThemeContext';

export type UtilitiesStackParamList = {
  UtilitiesHome: undefined;
  Progress: undefined;
  Settings: undefined;
  HealthyMenu: undefined;
  MealPlan: undefined;
  Calendar: undefined;
  HealthInsights: undefined;
  Exercises: undefined;
  Messages: undefined;
  WaterIntake: undefined;
  Measurements: undefined;
  Reminders: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<UtilitiesStackParamList>();

const BackButton = ({ navigation }: any) => (
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={{ marginLeft: 8 }}
  >
    <Ionicons name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>
);

export const UtilitiesStackNavigator = () => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : insets.top;
  
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#10b981',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStatusBarHeight: statusBarHeight,
        contentStyle: {
          backgroundColor: '#F5F7FA',
        },
        animation: 'slide_from_right',
        headerLeft: () => <BackButton navigation={navigation} />,
      })}
    >
      <Stack.Screen
        name="UtilitiesHome"
        component={UtilitiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MealPlan"
        component={MealPlanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HealthInsights"
        component={HealthInsightsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HealthyMenu"
        component={HealthyMenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WaterIntake"
        component={WaterIntakeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Measurements"
        component={MeasurementsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
