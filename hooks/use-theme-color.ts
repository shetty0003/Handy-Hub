// app/hooks/use-color-scheme.ts (if using app directory)
// or hooks/use-color-scheme.ts (if using src directory)
import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export function useColorScheme() {
  return useRNColorScheme() ?? 'light';
}

/**
 * Returns the requested color from the active theme, falling back to the
 * light theme when a key is not defined for the current scheme.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}