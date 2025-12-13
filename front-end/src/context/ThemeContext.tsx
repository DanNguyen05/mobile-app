// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

export const colors = {
  primary: '#10b981',
  primaryLight: '#D4F4DD',
  primaryDark: '#059669',
  secondary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  border: '#e5e7eb',
  // Nutrition colors
  protein: '#8B5CF6',  // Purple - dễ phân biệt
  carbs: '#FFB84D',     // Orange - giữ nguyên
  fat: '#EF4444',       // Red - đậm hơn, dễ nhìn
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  h4: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

interface ThemeContextValue {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  const value: ThemeContextValue = {
    colors,
    spacing,
    typography,
    borderRadius,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
