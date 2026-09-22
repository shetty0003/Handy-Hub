-- Fix invalid Ionicons glyph names stored in service_categories.icon.
--
-- The database contains seven categories whose `icon` value is not a valid
-- Ionicons glyph, which makes @expo/vector-icons warn on every render:
--
--   zap-outline, truck-outline, paintbrush-outline,
--   wrench-outline, drop-outline, sun-outline
--
-- The client cannot correct these: `service_categories` is protected by RLS and
-- the anon key has no UPDATE permission on it (writing returns 42501). Run this
-- with the service-role key or from the Supabase SQL editor.
--
-- app/utils/iconHelpers.ts performs the same mapping at render time so the UI is
-- already correct without this migration; applying this keeps the data honest.

UPDATE service_categories SET icon = 'flash-outline'    WHERE icon = 'zap-outline';
UPDATE service_categories SET icon = 'car-outline'      WHERE icon = 'truck-outline';
UPDATE service_categories SET icon = 'brush-outline'    WHERE icon = 'paintbrush-outline';
UPDATE service_categories SET icon = 'water-outline'    WHERE icon = 'wrench-outline';
UPDATE service_categories SET icon = 'filter-outline'   WHERE icon = 'drop-outline';
UPDATE service_categories SET icon = 'sunny-outline'    WHERE icon = 'sun-outline';

-- Verify: this should return zero rows.
-- SELECT id, name, icon FROM service_categories
-- WHERE icon IN ('zap-outline','truck-outline','paintbrush-outline',
--                'wrench-outline','drop-outline','sun-outline');