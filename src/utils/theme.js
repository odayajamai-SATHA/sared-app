import { useState, createContext, useContext, useCallback } from 'react';
import { useColorScheme } from 'react-native';

const lightColors = {
  primary: '#059669',
  primaryPressed: '#047857',
  primaryContainer: '#D1FAE5',
  onPrimary: '#FFFFFF',
  secondary: '#0F172A',
  secondaryContainer: '#E2E8F0',
  accent: '#D97706',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  error: '#DC2626',
  errorContainer: '#FEF2F2',
  success: '#059669',
  warning: '#D97706',
  border: '#D1D5DB',
  // Legacy aliases used by existing screens
  primaryDark: '#047857',
  primaryLight: '#34D399',
  primaryFaded: '#D1FAE5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  darkGray: '#374151',
  card: '#FFFFFF',
  cardBorder: '#D1D5DB',
  inputBg: '#F3F4F6',
  inputBorder: '#D1D5DB',
  shadow: '#000000',
  tabBar: '#FFFFFF',
  tabBarBorder: '#D1D5DB',
  statusBar: 'dark',
  headerBg: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  danger: '#DC2626',
  dangerFaded: '#FEF2F2',
  dangerBorder: '#FECACA',
  successFaded: '#F0FDF4',
  warningFaded: '#FFFBEB',
  overlay: 'rgba(0,0,0,0.6)',
};

const darkColors = {
  primary: '#34D399',
  primaryPressed: '#10B981',
  primaryContainer: '#064E3B',
  onPrimary: '#000000',
  secondary: '#E2E8F0',
  secondaryContainer: '#334155',
  accent: '#FBBF24',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  text: '#E5E7EB',
  textSecondary: '#9CA3AF',
  error: '#F87171',
  errorContainer: 'rgba(239,68,68,0.2)',
  success: '#34D399',
  warning: '#FBBF24',
  border: '#4B5563',
  // Legacy aliases
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryFaded: 'rgba(52,211,153,0.2)',
  white: '#1E1E1E',
  black: '#FFFFFF',
  gray: '#9CA3AF',
  lightGray: '#2C2C2C',
  darkGray: '#E5E7EB',
  card: '#1E1E1E',
  cardBorder: '#4B5563',
  inputBg: '#2C2C2C',
  inputBorder: '#4B5563',
  shadow: '#000000',
  tabBar: '#1A1A1A',
  tabBarBorder: '#4B5563',
  statusBar: 'light',
  headerBg: '#1A1A1A',
  surfaceSecondary: '#2C2C2C',
  danger: '#F87171',
  dangerFaded: 'rgba(239,68,68,0.2)',
  dangerBorder: 'rgba(239,68,68,0.4)',
  successFaded: 'rgba(52,211,153,0.2)',
  warningFaded: 'rgba(251,191,36,0.2)',
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
