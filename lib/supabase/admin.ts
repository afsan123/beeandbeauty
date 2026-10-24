import { createClient } from '@supabase/supabase-js';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl || 'https://xhhjowchwnaglimgpygr.supabase.co';

const rawServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const serviceRoleKey =
  rawServiceRoleKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaGpvd2Nod25hZ2xpbWdweWdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTY4MTc5MywiZXhwIjoyMTA3MjU3NzkzfQ.a1wKVhw3HY2LZh1PStxAOuOr3D5ynCix2fEwJfdhul0';

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
