-- Migration: 20261012_admin_features.sql
-- Description: Schema for Categories, Products, Inventory, Banners, Limited Offers, and Pro Beauty Studio

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_title TEXT NOT NULL,
    description TEXT,
    tile_image TEXT,
    hero_banner_image TEXT,
    product_count INTEGER DEFAULT 0,
    subcategories JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    category_name TEXT NOT NULL,
    subtitle TEXT,
    short_description TEXT,
    description TEXT,
    how_to_use TEXT,
    ingredients TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    shades JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '{}'::jsonb,
    in_stock BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_new_launch BOOLEAN DEFAULT FALSE,
    is_kit BOOLEAN DEFAULT FALSE,
    is_under499 BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Inventory Overrides Table
CREATE TABLE IF NOT EXISTS public.product_inventory (
    product_id TEXT PRIMARY KEY,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 100,
    price NUMERIC(10, 2),
    compare_at_price NUMERIC(10, 2),
    is_bestseller BOOLEAN,
    is_new_launch BOOLEAN,
    is_featured BOOLEAN,
    shades_stock JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Banners Table (Hero Carousel, Mid-Page Promos, Announcements)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    tagline TEXT,
    cta_text TEXT NOT NULL,
    cta_href TEXT NOT NULL,
    secondary_cta_text TEXT,
    secondary_cta_href TEXT,
    bg_color TEXT DEFAULT 'from-[#4A104C] via-[#6A1B6D] to-[#360C38]',
    accent_color TEXT DEFAULT '#D4AF37',
    image_url TEXT,
    banner_type TEXT NOT NULL DEFAULT 'hero' CHECK (banner_type IN ('hero', 'promo', 'announcement')),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Limited Offers Table (Flash Deals & Special Campaigns)
CREATE TABLE IF NOT EXISTS public.limited_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_gift')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(10, 2) DEFAULT 0,
    free_item_name TEXT,
    expiry_note TEXT,
    badge TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pro Beauty Studio Tutorials & Masterclasses Table
CREATE TABLE IF NOT EXISTS public.studio_tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT DEFAULT '5 min masterclass',
    description TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    product_slug TEXT,
    product_name TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pro Beauty Studio Makeover & Consultation Bookings Table
CREATE TABLE IF NOT EXISTS public.studio_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    service_type TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Administrative Notes Table
CREATE TABLE IF NOT EXISTS public.customer_notes (
    customer_phone TEXT PRIMARY KEY,
    notes TEXT,
    tier_override TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.limited_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_status ON public.studio_bookings(status);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limited_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read inventory" ON public.product_inventory;
CREATE POLICY "Public can read inventory" ON public.product_inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read active banners" ON public.banners;
CREATE POLICY "Public can read active banners" ON public.banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read active offers" ON public.limited_offers;
CREATE POLICY "Public can read active offers" ON public.limited_offers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read studio tutorials" ON public.studio_tutorials;
CREATE POLICY "Public can read studio tutorials" ON public.studio_tutorials FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can create studio bookings" ON public.studio_bookings;
CREATE POLICY "Public can create studio bookings" ON public.studio_bookings FOR INSERT WITH CHECK (true);

