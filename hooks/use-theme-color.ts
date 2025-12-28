// app/hooks/use-color-scheme.ts (if using app directory)
// or hooks/use-color-scheme.ts (if using src directory)
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  return useRNColorScheme() ?? 'light';
}