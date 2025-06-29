import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are missing or contain placeholder values
const isPlaceholderUrl = !supabaseUrl || supabaseUrl === 'your_supabase_url' || supabaseUrl.includes('your_');
const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key' || supabaseAnonKey.includes('your_');

let supabase: any;

if (isPlaceholderUrl || isPlaceholderKey) {
  console.warn('⚠️ Supabase not configured - using placeholder values for development');
  console.warn('To connect to Supabase:');
  console.warn('1. Click "Connect to Supabase" button in the top right');
  console.warn('2. Or manually update your .env file with real Supabase credentials');
  
  // Create a mock client that won't crash the app
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    })
  };
} else {
  // Validate URL format only if it's not a placeholder
  try {
    new URL(supabaseUrl);
  } catch (error) {
    console.error('Invalid Supabase URL format:', supabaseUrl);
    throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'legal-terms-analyzer'
      }
    }
  });
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    if (isPlaceholderUrl || isPlaceholderKey) {
      console.log('Supabase connection test skipped - using placeholder configuration');
      return false;
    }
    
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !isPlaceholderUrl && !isPlaceholderKey;
};

export { supabase };