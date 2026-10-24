import { NextResponse } from 'next/server.js';
import { createServerSupabaseClient } from '../../../../lib/supabase/server.ts';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  return NextResponse.json({ success: true });
}
