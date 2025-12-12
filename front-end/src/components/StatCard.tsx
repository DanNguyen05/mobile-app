// src/components/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 3) / 2;

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
});
