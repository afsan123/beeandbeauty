import { supabaseAdmin } from '../supabase/admin.ts';

export interface CreateInquiryPayload {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface StoredInquiry {
  id: string;
  ticketNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
}

const fallbackInquiries = new Map<string, StoredInquiry>();

export async function createInquiry(payload: CreateInquiryPayload): Promise<StoredInquiry> {
  if (!payload.fullName?.trim()) {
    throw new Error('Full Name is required.');
  }
  if (!payload.email?.trim() || !payload.email.includes('@')) {
    throw new Error('Valid email address is required.');
  }
  if (!payload.message?.trim() || payload.message.trim().length < 10) {
    throw new Error('Please provide at least 10 characters for your message.');
  }

  const id = crypto.randomUUID();
  const ticketNumber = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const stored: StoredInquiry = {
    id,
    ticketNumber,
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
    status: 'new',
    createdAt: now,
  };

  fallbackInquiries.set(stored.ticketNumber, stored);

  try {
    await supabaseAdmin.from('contact_inquiries').insert({
      id: stored.id,
      ticket_number: stored.ticketNumber,
      full_name: stored.fullName,
      email: stored.email,
      phone: stored.phone,
      subject: stored.subject,
      message: stored.message,
      status: stored.status,
      created_at: stored.createdAt,
    });
  } catch (err) {
    console.warn('Supabase inquiry insert skipped or failed, fallback cached:', err);
  }

  return stored;
}
