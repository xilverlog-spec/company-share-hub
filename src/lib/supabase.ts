import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate if the URL is a valid URL structure. If not (or empty/placeholder),
// we use a dummy valid URL to prevent the build process from crashing during prerendering.
const isValidUrl = (url: string): boolean => {
  if (!url || url.includes('YOUR_SUPABASE')) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const safeUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co';
const safeKey = supabaseAnonKey && !supabaseAnonKey.includes('YOUR_SUPABASE') ? supabaseAnonKey : 'placeholder-anon-key';

if (safeUrl.includes('placeholder-project')) {
  console.warn(
    'Supabase environment variables are missing or use placeholders. Please configure them in `.env.local`.'
  );
}

export const supabase = createClient(safeUrl, safeKey);
