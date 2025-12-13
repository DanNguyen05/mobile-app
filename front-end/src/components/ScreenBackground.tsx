// src/components/ScreenBackground.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenBackgroundProps {
  children: React.ReactNode;
}

const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenBackground;
