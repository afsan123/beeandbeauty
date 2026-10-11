import { supabaseAdmin } from '../supabase/admin.ts';

export interface StudioTutorial {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  steps: string[];
  productSlug?: string;
  productName?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface StudioBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceType: string;
  preferredDate: string;
  preferredTime?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

const DEFAULT_TUTORIALS: StudioTutorial[] = [
  {
    id: 'tut-1',
    title: 'Royal Golden Hour: Bridal Glow Look',
    category: 'Bridal & Occasion',
    duration: '5 min masterclass',
    description: 'Learn how to sculpt a warm, radiant South Asian festive complexion using our Honey Silk HD Serum Foundation & 24K Royal Propolis Illuminator.',
    steps: [
      'Prep complexion with 2 drops of Honey Barrier Repair Serum on damp skin.',
      'Blend Honey Silk HD Foundation from center outwards with a damp sponge.',
      'Dab 24K Illuminator across high points of cheekbones, bridge of nose, and cupid bow.',
    ],
    productSlug: 'honey-silk-hd-serum-foundation',
    productName: 'Honey Silk HD Serum Foundation',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'tut-2',
    title: 'Velvet Plum Gradient Lips',
    category: 'Lip Artistry',
    duration: '3 min masterclass',
    description: 'Create high-fashion dimensional plum ombre lips that stay smudge-proof for 16 hours through dinners and festive events.',
    steps: [
      'Line outer lip perimeter with Precision Lip Sculpt Liner in Deep Berry.',
      'Fill inner lips with Royal Velvet Matte Lipstick in shade 03 Royal Plum.',
      'Blot lightly and top center with Nectar Plump Peptide Gloss for glass reflection.',
    ],
    productSlug: 'royal-honey-velvet-matte-lipstick',
    productName: 'Royal Velvet Matte Lipstick',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'tut-3',
    title: 'Arch & Define: Feathered Brow Tutorial',
    category: 'Eye & Brow Artistry',
    duration: '2 min quick tip',
    description: 'Master effortless micro-stroke feathered brows that resist Dhaka humidity with our Arch Precision Micro Brow Pencil.',
    steps: [
      'Brush natural brow hairs upward using the spoolie brush.',
      'Use light flicking motions to fill sparse gaps following hair growth direction.',
      'Set arches in place with clear brow gel for 16-hour hold.',
    ],
    productSlug: 'arch-precision-micro-brow-pencil',
    productName: 'Arch Precision Micro Brow Pencil',
    isActive: true,
    sortOrder: 3,
  },
];

const DEFAULT_BOOKINGS: StudioBooking[] = [
  {
    id: 'bk-101',
    clientName: 'Nusrat Jahan',
    clientPhone: '01711223344',
    clientEmail: 'nusrat.j@example.com',
    serviceType: 'Bridal Masterclass Makeover',
    preferredDate: '2026-10-25',
    preferredTime: '3:00 PM',
    notes: 'Requires warm undertone base with gold accents for reception event.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-102',
    clientName: 'Tasnim Farhana',
    clientPhone: '01899887766',
    clientEmail: 'tasnim@example.com',
    serviceType: 'Shade Match & Skin Consultation',
    preferredDate: '2026-10-18',
    preferredTime: '11:00 AM',
    notes: 'Sensitive skin with olive undertone looking for foundation and serum match.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

let inMemoryTutorials: StudioTutorial[] = [...DEFAULT_TUTORIALS];
let inMemoryBookings: StudioBooking[] = [...DEFAULT_BOOKINGS];
let isStudioLoaded = false;

export async function fetchRemoteStudio(): Promise<void> {
  try {
    const [tutRes, bkRes] = await Promise.all([
      supabaseAdmin.from('studio_tutorials').select('*').order('sort_order', { ascending: true }),
      supabaseAdmin.from('studio_bookings').select('*').order('created_at', { ascending: false }),
    ]);

    if (!tutRes.error && tutRes.data && tutRes.data.length > 0) {
      inMemoryTutorials = tutRes.data.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        duration: row.duration || '5 min masterclass',
        description: row.description || '',
        steps: Array.isArray(row.steps) ? row.steps : [],
        productSlug: row.product_slug,
        productName: row.product_name,
        videoUrl: row.video_url,
        thumbnailUrl: row.thumbnail_url,
        isActive: row.is_active !== false,
        sortOrder: row.sort_order || 0,
      }));
    }

    if (!bkRes.error && bkRes.data && bkRes.data.length > 0) {
      inMemoryBookings = bkRes.data.map((row) => ({
        id: row.id,
        clientName: row.client_name,
        clientPhone: row.client_phone,
        clientEmail: row.client_email,
        serviceType: row.service_type,
        preferredDate: row.preferred_date,
        preferredTime: row.preferred_time,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
      }));
    }

    isStudioLoaded = true;
  } catch {
    // Fallback
  }
}

// Tutorials API
export async function getAllTutorials(): Promise<StudioTutorial[]> {
  if (!isStudioLoaded) {
    await fetchRemoteStudio();
  }
  return [...inMemoryTutorials];
}

export async function createTutorial(
  input: Omit<StudioTutorial, 'id' | 'sortOrder'> & { id?: string; sortOrder?: number }
): Promise<StudioTutorial> {
  const id = input.id || `tut-${Date.now()}`;
  const newTutorial: StudioTutorial = {
    ...input,
    id,
    isActive: input.isActive !== false,
    sortOrder: input.sortOrder || inMemoryTutorials.length + 1,
  };

  inMemoryTutorials.push(newTutorial);

  try {
    await supabaseAdmin.from('studio_tutorials').insert({
      id: newTutorial.id,
      title: newTutorial.title,
      category: newTutorial.category,
      duration: newTutorial.duration,
      description: newTutorial.description,
      steps: newTutorial.steps,
      product_slug: newTutorial.productSlug,
      product_name: newTutorial.productName,
      video_url: newTutorial.videoUrl,
      thumbnail_url: newTutorial.thumbnailUrl,
      is_active: newTutorial.isActive,
      sort_order: newTutorial.sortOrder,
    });
  } catch (err) {
    console.error('Remote tutorial insert fallback to memory:', err);
  }

  return newTutorial;
}

export async function deleteTutorial(id: string): Promise<boolean> {
  const index = inMemoryTutorials.findIndex((t) => t.id === id);
  if (index === -1) return false;

  inMemoryTutorials.splice(index, 1);

  try {
    await supabaseAdmin.from('studio_tutorials').delete().eq('id', id);
  } catch (err) {
    console.error('Remote tutorial delete fallback to memory:', err);
  }

  return true;
}

// Bookings API
export async function getAllBookings(): Promise<StudioBooking[]> {
  if (!isStudioLoaded) {
    await fetchRemoteStudio();
  }
  return [...inMemoryBookings];
}

export async function createBooking(
  input: Omit<StudioBooking, 'id' | 'status' | 'createdAt'> & { id?: string }
): Promise<StudioBooking> {
  const id = input.id || `bk-${Date.now()}`;
  const newBooking: StudioBooking = {
    ...input,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  inMemoryBookings.unshift(newBooking);

  try {
    await supabaseAdmin.from('studio_bookings').insert({
      id: newBooking.id,
      client_name: newBooking.clientName,
      client_phone: newBooking.clientPhone,
      client_email: newBooking.clientEmail,
      service_type: newBooking.serviceType,
      preferred_date: newBooking.preferredDate,
      preferred_time: newBooking.preferredTime,
      notes: newBooking.notes,
      status: newBooking.status,
      created_at: newBooking.createdAt,
    });
  } catch (err) {
    console.error('Remote booking insert fallback to memory:', err);
  }

  return newBooking;
}

export async function updateBookingStatus(
  id: string,
  status: StudioBooking['status']
): Promise<StudioBooking | null> {
  const booking = inMemoryBookings.find((b) => b.id === id);
  if (!booking) return null;

  booking.status = status;

  try {
    await supabaseAdmin
      .from('studio_bookings')
      .update({ status })
      .eq('id', id);
  } catch (err) {
    console.error('Remote booking status update fallback to memory:', err);
  }

  return booking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const index = inMemoryBookings.findIndex((b) => b.id === id);
  if (index === -1) return false;

  inMemoryBookings.splice(index, 1);

  try {
    await supabaseAdmin.from('studio_bookings').delete().eq('id', id);
  } catch (err) {
    console.error('Remote booking delete fallback to memory:', err);
  }

  return true;
}
