import { NextResponse } from 'next/server.js';
import { createServerSupabaseClient } from '../../../../lib/supabase/server.ts';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Customer accounts are unavailable.' }, { status: 503 });
  }

  const { password } = await request.json();
  if (!password || String(password).length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Open the set-password link from your email first.' }, { status: 401 });
  }

  const { error } = await supabase.auth.updateUser({ password: String(password) });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
