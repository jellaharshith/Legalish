import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are missing or contain placeholder values
const isPlaceholderUrl = !supabaseUrl || supabaseUrl === 'your_supabase_project_url' || supabaseUrl.includes('your_supabase');
const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key' || supabaseAnonKey.includes('your_supabase');

if (!supabaseUrl || !supabaseAnonKey || isPlaceholderUrl || isPlaceholderKey) {
  const errorMessage = `
🔧 Supabase Configuration Required

Please configure your Supabase environment variables:

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy your Project URL and anon/public key
4. Update your .env file with:
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key

Current values:
- URL: ${supabaseUrl || 'missing'}
- Key: ${supabaseAnonKey ? 'present but may be placeholder' : 'missing'}

If you don't have a Supabase project yet, create one at https://supabase.com
  `;
  
  console.error(errorMessage);
  throw new Error('Supabase configuration required. Please check your .env file and update with your actual Supabase project credentials.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error(`Invalid Supabase URL format: "${supabaseUrl}". Please ensure your VITE_SUPABASE_URL starts with https:// and is a valid URL.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Test connection function
export const testSupabaseConnection = async () => {
  try {
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