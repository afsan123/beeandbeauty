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

export interface StoredSubscriber {
  id?: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export async function getAllSubscribers(): Promise<StoredSubscriber[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        email: d.email,
        isActive: Boolean(d.is_active),
        createdAt: d.created_at,
      }));
    }
  } catch (err) {
    console.warn('Supabase getAllSubscribers fallback:', err);
  }

  return Array.from(fallbackSubscribers).map((email) => ({
    email,
    isActive: true,
    createdAt: new Date().toISOString(),
  }));
}

