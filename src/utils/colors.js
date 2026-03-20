// Static fallback colors (used by StyleSheet.create which runs at module load)
export const colors = {
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
  text: '#1F2937',
  textSecondary: '#6B7280',
};

// Dynamic hook — import { useColors } from '../utils/colors' in any component
// Returns themed colors that respond to dark mode
import { useTheme } from './theme';

export function useColors() {
  const { colors: themeColors } = useTheme();
  return themeColors;
}
