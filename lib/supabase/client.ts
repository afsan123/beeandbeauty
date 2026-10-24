import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://xhhjowchwnaglimgpygr.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaGpvd2Nod25hZ2xpbWdweWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2ODE3OTMsImV4cCI6MjEwNzI1Nzc5M30.Kp1i2RXxmS9B9m5KVouxl8lMRHHcFa2i6DZG1sk3biw';

function cleanEnv(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim().replace(/^['"]|['"]$/g, '').trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }
  return trimmed;
}

const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || DEFAULT_URL;
const supabaseAnonKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || DEFAULT_ANON_KEY;

let client: SupabaseClient;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch {
  client = createClient(DEFAULT_URL, DEFAULT_ANON_KEY);
}

export const supabase = client;
