import { supabaseAdmin } from '../supabase/admin.ts';

export interface BannerSlide {
  id: string;
  tagline: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  bgColor: string;
  accentColor: string;
  imageUrl?: string;
  bannerType: 'hero' | 'promo' | 'announcement';
  isActive: boolean;
  sortOrder: number;
}

const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'slide-1',
    tagline: 'LUXURY COSMETICS | NEW LAUNCH',
    title: 'ROYAL VELVET MATTE LIPSTICK',
    subtitle: 'Infused with botanical royal jelly & honey nectar. 16-hour weightless comfort in bespoke shades for South Asian complexions.',
    ctaText: 'Shop Lipsticks',
    ctaHref: '/shop/lips',
    secondaryCtaText: 'Explore Makeup',
    secondaryCtaHref: '/shop/all',
    bgColor: 'from-[#4A104C] via-[#6A1B6D] to-[#360C38]',
    accentColor: '#D4AF37',
    bannerType: 'hero',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'slide-2',
    tagline: 'DERMATOLOGICALLY TESTED | CLEAN SKINCARE',
    title: 'HONEY BARRIER REPAIR & GLOW SERUM',
    subtitle: 'Raw propolis, 5% niacinamide & ceramide NP. Rebuilds compromised moisture barriers, calms redness, and unlocks an effortless glass glow.',
    ctaText: 'Shop Skincare',
    ctaHref: '/shop/skin',
    secondaryCtaText: 'View All Rituals',
    secondaryCtaHref: '/shop/skin',
    bgColor: 'from-[#1B3828] via-[#2A4D39] to-[#14261C]',
    accentColor: '#F4D06F',
    bannerType: 'hero',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'slide-3',
    tagline: 'SKINCARE-INFUSED BASE | SOUTH ASIAN TONES',
    title: 'HONEY SILK HD SERUM FOUNDATION',
    subtitle: 'Flawless luminous coverage with SPF 30 & antioxidant propolis. Breathable skin-first makeup engineered for warm & olive undertones.',
    ctaText: 'Find Your Shade',
    ctaHref: '/shop/face',
    secondaryCtaText: 'Explore Face',
    secondaryCtaHref: '/shop/face',
    bgColor: 'from-[#4E243B] via-[#6E3052] to-[#341627]',
    accentColor: '#D4AF37',
    bannerType: 'hero',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'slide-4',
    tagline: 'CURATED BEAUTY & SKINCARE VAULTS',
    title: 'THE QUEEN BEE LUXE BOX',
    subtitle: 'Complete luxury rituals pairing barrier skincare with high-pigment cosmetics in gold-embossed keepsake packaging. Nationwide delivery.',
    ctaText: 'Shop Gift Sets',
    ctaHref: '/shop/kits',
    secondaryCtaText: 'View Deals',
    secondaryCtaHref: '/offers',
    bgColor: 'from-[#3A0C3C] via-[#5C165F] to-[#2B082D]',
    accentColor: '#F4E295',
    bannerType: 'hero',
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'promo-1',
    tagline: 'SPECIAL LAUNCH OFFER',
    title: 'Festive Glamour Celebration: Flat ৳700 Off',
    subtitle: 'Enjoy an instant ৳700 discount on cart value over ৳2,999 with code BEE700. Complimentary doorstep delivery nationwide.',
    ctaText: 'View All Offers',
    ctaHref: '/offers',
    bgColor: 'from-[#521354] to-[#6A1B6D]',
    accentColor: '#D4AF37',
    bannerType: 'promo',
    isActive: true,
    sortOrder: 5,
  },
];

let inMemoryBanners: BannerSlide[] = [...DEFAULT_BANNERS];
let isBannersLoaded = false;

export async function fetchRemoteBanners(): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      inMemoryBanners = data.map((row) => ({
        id: row.id,
        tagline: row.tagline || '',
        title: row.title,
        subtitle: row.subtitle || '',
        ctaText: row.cta_text,
        ctaHref: row.cta_href,
        secondaryCtaText: row.secondary_cta_text,
        secondaryCtaHref: row.secondary_cta_href,
        bgColor: row.bg_color || 'from-[#4A104C] via-[#6A1B6D] to-[#360C38]',
        accentColor: row.accent_color || '#D4AF37',
        imageUrl: row.image_url,
        bannerType: row.banner_type || 'hero',
        isActive: row.is_active !== false,
        sortOrder: row.sort_order || 0,
      }));
      isBannersLoaded = true;
    }
  } catch {
    // Fallback to in-memory
  }
}

export async function getAllBanners(): Promise<BannerSlide[]> {
  if (!isBannersLoaded) {
    await fetchRemoteBanners();
  }
  return [...inMemoryBanners].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActiveBanners(type?: 'hero' | 'promo' | 'announcement'): Promise<BannerSlide[]> {
  const all = await getAllBanners();
  return all.filter((b) => b.isActive && (!type || b.bannerType === type));
}

export async function createBanner(input: Omit<BannerSlide, 'id'> & { id?: string }): Promise<BannerSlide> {
  const id = input.id || `banner-${Date.now()}`;
  const newBanner: BannerSlide = {
    ...input,
    id,
    isActive: input.isActive !== false,
    sortOrder: input.sortOrder || inMemoryBanners.length + 1,
  };

  inMemoryBanners.push(newBanner);

  try {
    await supabaseAdmin.from('banners').insert({
      id: newBanner.id,
      tagline: newBanner.tagline,
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      cta_text: newBanner.ctaText,
      cta_href: newBanner.ctaHref,
      secondary_cta_text: newBanner.secondaryCtaText,
      secondary_cta_href: newBanner.secondaryCtaHref,
      bg_color: newBanner.bgColor,
      accent_color: newBanner.accentColor,
      image_url: newBanner.imageUrl,
      banner_type: newBanner.bannerType,
      is_active: newBanner.isActive,
      sort_order: newBanner.sortOrder,
    });
  } catch (err) {
    console.error('Remote banner insert fallback to memory:', err);
  }

  return newBanner;
}

export async function updateBanner(
  id: string,
  updates: Partial<BannerSlide>
): Promise<BannerSlide | null> {
  const index = inMemoryBanners.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated: BannerSlide = {
    ...inMemoryBanners[index],
    ...updates,
  };
  inMemoryBanners[index] = updated;

  try {
    await supabaseAdmin
      .from('banners')
      .update({
        tagline: updated.tagline,
        title: updated.title,
        subtitle: updated.subtitle,
        cta_text: updated.ctaText,
        cta_href: updated.ctaHref,
        secondary_cta_text: updated.secondaryCtaText,
        secondary_cta_href: updated.secondaryCtaHref,
        bg_color: updated.bgColor,
        accent_color: updated.accentColor,
        image_url: updated.imageUrl,
        banner_type: updated.bannerType,
        is_active: updated.isActive,
        sort_order: updated.sortOrder,
      })
      .eq('id', id);
  } catch (err) {
    console.error('Remote banner update fallback to memory:', err);
  }

  return updated;
}

export async function deleteBanner(id: string): Promise<boolean> {
  const index = inMemoryBanners.findIndex((b) => b.id === id);
  if (index === -1) return false;

  inMemoryBanners.splice(index, 1);

  try {
    await supabaseAdmin.from('banners').delete().eq('id', id);
  } catch (err) {
    console.error('Remote banner delete fallback to memory:', err);
  }

  return true;
}
