import { createBrowserClient } from '@supabase/ssr';
import { createMockSupabase } from './mockSupabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isDemoMode = process.env.NEXT_PUBLIC_FORCE_DEMO === 'true' || 
                 !supabaseUrl || 
                 supabaseUrl.includes('mock.supabase.co') ||
                 supabaseUrl.includes('your-project-id');

// createBrowserClient automatically handles session persistence using cookies 
// which is required for Next.js Middleware to function correctly.
export const supabase = isDemoMode 
    ? createMockSupabase() 
    : createBrowserClient(
        supabaseUrl,
        supabaseKey
    );
