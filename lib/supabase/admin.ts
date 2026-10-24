import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://xhhjowchwnaglimgpygr.supabase.co';
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaGpvd2Nod25hZ2xpbWdweWdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTY4MTc5MywiZXhwIjoyMTA3MjU3NzkzfQ.a1wKVhw3HY2LZh1PStxAOuOr3D5ynCix2fEwJfdhul0';

function cleanEnv(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim().replace(/^['"]|['"]$/g, '').trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }
  return trimmed;
}

const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || DEFAULT_URL;
const serviceRoleKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) || DEFAULT_SERVICE_ROLE_KEY;

let admin: SupabaseClient;
try {
  admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} catch {
  admin = createClient(DEFAULT_URL, DEFAULT_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = admin;
