import { supabaseAdmin } from '../supabase/admin.ts';

export interface NewsletterSubscribeResult {
  success: boolean;
  message: string;
}

const fallbackSubscribers = new Set<string>();

export async function subscribeNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
    };
  }

  fallbackSubscribers.add(cleanEmail);

  try {
    await supabaseAdmin.from('newsletter_subscribers').upsert(
      {
        email: cleanEmail,
        is_active: true,
      },
      { onConflict: 'email' }
    );
  } catch (err) {
    console.warn('Supabase newsletter subscribe skipped or failed:', err);
  }

  return {
    success: true,
    message: 'Welcome to the Bee & Beauty inner circle! Check your inbox for exclusive beauty drops.',
  };
}
