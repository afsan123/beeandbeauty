import { supabaseAdmin } from '../supabase/admin.ts';
import { LAUNCH_BANNERS } from '../data/launchCatalog.ts';

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
  mediaType?: 'none' | 'image' | 'video' | 'gif';
  mediaUrl?: string;
  overlayOpacity?: number;
  bannerType: 'hero' | 'promo' | 'announcement';
  isActive: boolean;
  sortOrder: number;
}

const DEFAULT_BANNERS: BannerSlide[] = LAUNCH_BANNERS;

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
        imageUrl: row.media_url || row.image_url,
        mediaType: row.media_type || (row.media_url?.endsWith('.mp4') || row.media_url?.endsWith('.webm') ? 'video' : row.media_url?.endsWith('.gif') ? 'gif' : (row.media_url || row.image_url) ? 'image' : 'none'),
        mediaUrl: row.media_url || row.image_url,
        overlayOpacity: typeof row.overlay_opacity === 'number' ? row.overlay_opacity : 50,
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

  const existingIdx = inMemoryBanners.findIndex((b) => b.id === newBanner.id);
  if (existingIdx !== -1) {
    inMemoryBanners[existingIdx] = newBanner;
  } else {
    inMemoryBanners.push(newBanner);
  }

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
      image_url: newBanner.mediaUrl || newBanner.imageUrl,
      media_url: newBanner.mediaUrl || newBanner.imageUrl,
      media_type: newBanner.mediaType || 'none',
      overlay_opacity: newBanner.overlayOpacity ?? 50,
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
        image_url: updated.mediaUrl || updated.imageUrl,
        media_url: updated.mediaUrl || updated.imageUrl,
        media_type: updated.mediaType || 'none',
        overlay_opacity: updated.overlayOpacity ?? 50,
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
