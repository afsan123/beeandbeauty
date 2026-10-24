import { createClient } from '@supabase/supabase-js';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl || 'https://xhhjowchwnaglimgpygr.supabase.co';

const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabaseAnonKey =
  rawKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaGpvd2Nod25hZ2xpbWdweWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2ODE3OTMsImV4cCI6MjEwNzI1Nzc5M30.Kp1i2RXxmS9B9m5KVouxl8lMRHHcFa2i6DZG1sk3biw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
