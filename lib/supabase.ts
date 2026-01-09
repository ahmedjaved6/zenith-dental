import { createClient } from "@supabase/supabase-js";

// Helper to safely access environment variables across different bundlers/environments
const getEnv = (key: string) => {
  try {
    // Vite / ESM environments
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  
  try {
    // CommonJS / Node-like environments
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  return undefined;
};

// Hardcoded fallbacks to ensure the app works out-of-the-box in AI Studio and other previews
const DEFAULT_URL = 'https://efxnuapkxxkdsicsgoxb.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeG51YXBreHhrZHNpY3Nnb3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTkzNTMsImV4cCI6MjA4MzI5NTM1M30.-_vdHji0vKAbx5RfLAAS0R0cL5foQ4Q8O9EL9qdszK8';

/**
 * CRITICAL: The Supabase URL must not have a trailing slash for Edge Function 
 * invocation to work correctly via the SDK's internal transport.
 */
export const SUPABASE_URL = (getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || DEFAULT_URL).replace(/\/$/, "");
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      "X-Client-Info": "zenith-dental-ai-studio"
    }
  }
});
