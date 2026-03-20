import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useColorScheme, Platform } from 'react-native';

const lightColors = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#34D399',
  primaryFaded: '#D1FAE5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  darkGray: '#374151',
  border: '#E5E7EB',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  text: '#1F2937',
  textSecondary: '#6B7280',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  inputBg: '#F3F4F6',
  inputBorder: '#E5E7EB',
  shadow: '#000000',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  statusBar: 'dark',
  headerBg: '#FFFFFF',
  danger: '#EF4444',
  dangerFaded: '#FEF2F2',
  dangerBorder: '#FECACA',
  success: '#22C55E',
  successFaded: '#F0FDF4',
  warning: '#F59E0B',
  warningFaded: '#FFFBEB',
  overlay: 'rgba(0,0,0,0.6)',
};

const darkColors = {
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryFaded: 'rgba(16,185,129,0.15)',
  white: '#1A1A2E',
  black: '#FFFFFF',
  gray: '#9CA3AF',
  lightGray: '#252540',
  darkGray: '#D1D5DB',
  border: '#2D2D4A',
  background: '#0F0F23',
  surface: '#1A1A2E',
  surfaceSecondary: '#252540',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  card: '#1A1A2E',
  cardBorder: '#2D2D4A',
  inputBg: '#252540',
  inputBorder: '#2D2D4A',
  shadow: '#000000',
  tabBar: '#1A1A2E',
  tabBarBorder: '#2D2D4A',
  statusBar: 'light',
  headerBg: '#1A1A2E',
  danger: '#F87171',
  dangerFaded: 'rgba(239,68,68,0.15)',
  dangerBorder: 'rgba(239,68,68,0.3)',
  success: '#34D399',
  successFaded: 'rgba(34,211,153,0.15)',
  warning: '#FBBF24',
  warningFaded: 'rgba(251,191,36,0.15)',
  overlay: 'rgba(0,0,0,0.8)',
};

const ThemeContext = createContext();

// Simple storage for theme preference (AsyncStorage alternative)
let savedTheme = null;

export function ThemeProvider({ children }) {
  let systemScheme = 'light';
  try {
    const detected = useColorScheme();
    if (detected) systemScheme = detected;
  } catch {
    // useColorScheme can fail on some devices
  }
  const [mode, setMode] = useState('system');

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const setTheme = useCallback((newMode) => {
    setMode(newMode);
    savedTheme = newMode;
  }, []);

  const toggleDark = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setMode(newMode);
    savedTheme = newMode;
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setTheme, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback if used outside provider
    return { colors: lightColors, isDark: false, mode: 'light', setTheme: () => {}, toggleDark: () => {} };
  }
  return ctx;
}

// Export for backward compatibility
export { lightColors, darkColors };
