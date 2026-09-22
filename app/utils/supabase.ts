// app/utils/supabase.ts
//
// Re-export of the single shared client so both import paths
// (`utils/supabase` and `app/utils/supabase`) resolve to the SAME instance.
//
// Creating a second client here would mean two independent auth sessions and
// duplicate realtime channels, so this file must not call createClient again.
export { supabase, default } from '../../utils/supabase';