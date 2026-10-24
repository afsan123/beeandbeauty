import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers.js';
import { getSupabaseAnonKey, getSupabaseUrl } from '../env.ts';

export async function createServerSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — cookie writes are ignored.
        }
      },
    },
  });
}

export async function getCurrentCustomer() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email || '',
    phone: (data.user.user_metadata?.phone as string | undefined) || '',
    fullName:
      (data.user.user_metadata?.full_name as string | undefined) ||
      (data.user.user_metadata?.name as string | undefined) ||
      '',
  };
}
