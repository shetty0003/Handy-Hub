// utils/supabase.ts
//
// Single shared Supabase client for the whole app.
//
// NOTE: this is the only client. It combines what used to be two divergent
// configurations:
//   - the correct env var name + explicit validation from app/utils/supabase.ts
//   - AsyncStorage session persistence and the URL polyfill from this file
//
// The env var is EXPO_PUBLIC_SUPABASE_ANON_KEY (as defined in .env). An earlier
// version of this file read EXPO_PUBLIC_SUPABASE_KEY, which does not exist, so
// the client was being constructed with an undefined API key.

import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Fail loudly at startup rather than sending `undefined` as the API key, which
// otherwise surfaces much later as a confusing "fetch failed" / 401 on every
// request.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file: ' +
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are required.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export default supabase