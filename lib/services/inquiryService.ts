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

export async function getAllInquiries(statusFilter?: string): Promise<StoredInquiry[]> {
  let inquiries: StoredInquiry[] = [];

  try {
    let query = supabaseAdmin
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      inquiries = data.map((d) => ({
        id: d.id,
        ticketNumber: d.ticket_number,
        fullName: d.full_name,
        email: d.email,
        phone: d.phone,
        subject: d.subject,
        message: d.message,
        status: d.status,
        createdAt: d.created_at,
      }));
    }
  } catch (err) {
    console.warn('Supabase getAllInquiries fallback:', err);
  }

  if (inquiries.length === 0 && fallbackInquiries.size > 0) {
    inquiries = Array.from(fallbackInquiries.values());
    if (statusFilter && statusFilter !== 'all') {
      inquiries = inquiries.filter((i) => i.status === statusFilter);
    }
  }

  return inquiries;
}

export async function updateInquiryStatus(
  idOrTicket: string,
  status: 'new' | 'in_progress' | 'resolved'
): Promise<StoredInquiry | null> {
  const clean = idOrTicket.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
  let matched: StoredInquiry | null = null;

  try {
    let query = supabaseAdmin.from('contact_inquiries').update({ status });
    if (isUuid) {
      query = query.or(`id.eq.${clean},ticket_number.eq.${clean}`);
    } else {
      query = query.eq('ticket_number', clean);
    }

    const { data, error } = await query.select().maybeSingle();


    if (!error && data) {
      matched = {
        id: data.id,
        ticketNumber: data.ticket_number,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn('Supabase updateInquiryStatus fallback:', err);
  }

  // Fallback cache update
  for (const item of fallbackInquiries.values()) {
    if (item.id === idOrTicket || item.ticketNumber === idOrTicket) {
      item.status = status;
      matched = item;
      break;
    }
  }

  return matched;
}

