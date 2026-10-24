import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server.js';
import { getSupabaseAnonKey, getSupabaseUrl } from '../env.ts';

/** Refresh the customer Supabase session without touching the admin HMAC cookie. */
export async function refreshCustomerSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
