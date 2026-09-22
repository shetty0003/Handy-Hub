// app/utils/iconHelpers.ts
//
// The `service_categories.icon` column in the database contains a handful of
// names that are not valid Ionicons glyphs (e.g. "zap-outline", "truck-outline",
// "paintbrush-outline", "wrench-outline", "drop-outline", "sun-outline").
// @expo/vector-icons warns on every render for each invalid name.
//
// The database rows are the source of the stale values and are protected by
// RLS, so they cannot be corrected from the client. This module normalises any
// stored value to a valid glyph, so the UI renders the intended icon either way.
//
// Keep this map in sync with supabase/migrations/*_fix_service_category_icons.sql
// which performs the same correction at the data layer.

import type { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export const ICON_ALIASES: Record<string, IoniconName> = {
  'zap-outline': 'flash-outline',
  'truck-outline': 'car-outline',
  'paintbrush-outline': 'brush-outline',
  'wrench-outline': 'water-outline',
  'drop-outline': 'filter-outline',
  'sun-outline': 'sunny-outline',
};

const FALLBACK_ICON: IoniconName = 'construct-outline';

// Ionicons glyph names, loaded lazily so this module stays cheap to import.
let glyphNames: Set<string> | null = null;

function getGlyphNames(): Set<string> | null {
  if (glyphNames) return glyphNames;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const glyphMap = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json');
    glyphNames = new Set(Object.keys(glyphMap));
    return glyphNames;
  } catch {
    return null;
  }
}

/**
 * Returns a valid Ionicons glyph name for whatever is stored in the database.
 * Unknown names fall back to a generic service icon instead of warning.
 */
export function resolveIoniconName(name?: string | null): IoniconName {
  if (!name) return FALLBACK_ICON;

  const aliased = (ICON_ALIASES[name] ?? name) as string;

  const valid = getGlyphNames();
  if (!valid) {
    // Glyph map unavailable (e.g. a test environment) - trust the alias map.
    return aliased as IoniconName;
  }

  return (valid.has(aliased) ? aliased : FALLBACK_ICON) as IoniconName;
}